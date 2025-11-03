'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AdminUser {
  username: string;
  role: string;
  token: string;
}

interface FeaturedProduct {
  id: string;
  productId: string;
  type: 'new' | 'featured';
  isActive: boolean;
  displayOrder: number;
}

interface CatalogItem {
  id: string;
  name: string;
  brand: string;
}

// Sortable row component
function SortableRow({ item, onEdit, onDelete }: { item: FeaturedProduct; onEdit: (f: FeaturedProduct) => void; onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-move touch-none" {...attributes} {...listeners}>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
          </svg>
          <span>{item.displayOrder}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{item.productId}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.type === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
        }`}>
          {item.type === 'new' ? 'New' : 'Featured'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {item.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900">Edit</button>
        <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
      </td>
    </tr>
  );
}

export default function FeaturedProductsPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFeatured, setEditingFeatured] = useState<FeaturedProduct | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    type: 'featured' as 'new' | 'featured',
    isActive: true,
    displayOrder: 1
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = featured.findIndex((f) => f.id === active.id);
      const newIndex = featured.findIndex((f) => f.id === over.id);

      const newFeatured = arrayMove(featured, oldIndex, newIndex);
      
      // Update display orders
      const updatedFeatured = newFeatured.map((item, index) => ({
        ...item,
        displayOrder: index + 1
      }));

      setFeatured(updatedFeatured);

      // Save all featured in the new order
      try {
        const updatePromises = updatedFeatured.map(item =>
          fetch('/api/admin/featured', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          })
        );

        await Promise.all(updatePromises);
        setSuccess('Featured products order updated successfully!');
      } catch (error) {
        console.error('Error updating featured order:', error);
        setError('Failed to update featured products order');
        // Reload to revert
        loadFeatured();
      }
    }
  };

  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      router.push('/admin/login');
      return;
    }

    try {
      const userData = JSON.parse(adminUser);
      setUser(userData);
      loadFeatured();
      loadCatalogItems();
    } catch (error) {
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadFeatured = async () => {
    try {
      const response = await fetch('/api/admin/featured');
      if (response.ok) {
        const data = await response.json();
        setFeatured(data.featured || []);
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
    }
  };

  const loadCatalogItems = async () => {
    try {
      const response = await fetch('/api/catalog?limit=1000');
      if (response.ok) {
        const data = await response.json();
        setCatalogItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading catalog items:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        id: editingFeatured?.id || `featured-${Date.now()}`,
        displayOrder: parseInt(formData.displayOrder.toString())
      };

      const response = await fetch('/api/admin/featured', {
        method: editingFeatured ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess(editingFeatured ? 'Featured product updated!' : 'Featured product added!');
        setShowAddModal(false);
        setEditingFeatured(null);
        resetForm();
        loadFeatured();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save featured product');
      }
    } catch (error) {
      setError('Error saving featured product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this featured product?')) return;

    try {
      const response = await fetch('/api/admin/featured', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        setSuccess('Featured product removed!');
        loadFeatured();
      } else {
        setError('Failed to delete featured product');
      }
    } catch (error) {
      setError('Error deleting featured product');
    }
  };

  const handleEdit = (item: FeaturedProduct) => {
    setEditingFeatured(item);
    setFormData({
      productId: item.productId,
      type: item.type,
      isActive: item.isActive,
      displayOrder: item.displayOrder
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      type: 'featured',
      isActive: true,
      displayOrder: 1
    });
    setEditingFeatured(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={() => router.push('/admin')}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  title="Back to Dashboard"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
              </div>
              <p className="mt-2 text-gray-600 ml-10">Select and manage featured & new products</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Featured
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        {/* Featured Products List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <SortableContext
                items={featured.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="bg-white divide-y divide-gray-200">
                  {featured.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No featured products configured. Click "Add Featured" to get started.
                      </td>
                    </tr>
                  ) : (
                    featured.map((item) => (
                      <SortableRow
                        key={item.id}
                        item={item}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{editingFeatured ? 'Edit Featured Product' : 'Add Featured Product'}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                  <select
                    required
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a product...</option>
                    {catalogItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.brand} - {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'new' | 'featured' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="new">🆕 New</option>
                    <option value="featured">⭐ Featured</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingFeatured ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

