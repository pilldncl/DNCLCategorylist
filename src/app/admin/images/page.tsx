'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useImageConfig } from '@/hooks/useDynamicImages';
import { getAdminUser, clearAdminUser, AdminUser } from '@/utils/adminAuth';

interface CatalogItem {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  sku?: string;
  grade?: string;
  minQty?: number;
  category?: string;
  image?: string;
}

interface DeviceImage {
  device: string;
  model: string;
  brand: string;
  imageUrls: string[];
  lastUpdated: string;
}

export default function ImageManagementPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [imageFilter, setImageFilter] = useState<'all' | 'with-images' | 'without-images'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceImage | null>(null);
  const [formData, setFormData] = useState({
    device: '',
    model: '',
    brand: '',
    imageUrls: ['']
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [databaseStatus, setDatabaseStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [databaseStats, setDatabaseStats] = useState({
    totalImages: 0,
    totalDevices: 0,
    lastUpdated: null as string | null
  });
  const router = useRouter();

  const { config, loading: configLoading, error: configError, addDevice, updateDevice, deleteDevice, refresh } = useImageConfig();

  useEffect(() => {
    // Check if user is logged in
    const adminUser = getAdminUser();
    if (!adminUser) {
      router.push('/admin/login');
      return;
    }

    setUser(adminUser);
    loadCatalogData();
    checkDatabaseStatus();
    setLoading(false);
  }, [router]);

  const loadCatalogData = async () => {
    try {
      // Request all products by setting a high limit
      const response = await fetch('/api/catalog?limit=1000');
      if (response.ok) {
        const data = await response.json();
        // Catalog API returns { items }
        const catalogData = data.items || [];
        console.log(`Loaded ${catalogData.length} products from catalog API`);
        setCatalogItems(catalogData);
        setFilteredItems(catalogData);
      } else {
        console.error('Failed to load catalog data');
        setCatalogItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error('Error loading catalog:', error);
      setCatalogItems([]);
      setFilteredItems([]);
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      setDatabaseStatus('checking');
      const response = await fetch('/api/images');
      if (response.ok) {
        const data = await response.json();
        setDatabaseStatus('connected');
        setDatabaseStats({
          totalImages: data.devices?.reduce((sum: number, device: { imageUrls: string[] }) => sum + device.imageUrls.length, 0) || 0,
          totalDevices: data.devices?.length || 0,
          lastUpdated: data.lastUpdated
        });
      } else {
        setDatabaseStatus('disconnected');
      }
    } catch (error) {
      console.error('Error checking database status:', error);
      setDatabaseStatus('disconnected');
    }
  };

  // Filter catalog items based on search, brand, and image status
  useEffect(() => {
    let filtered = catalogItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(item => item.brand === selectedBrand);
    }

    // Image status filter
    if (imageFilter !== 'all') {
      filtered = filtered.filter(item => {
        const deviceImages = getDeviceImages(item);
        const hasImages = !!deviceImages && deviceImages.imageUrls.length > 0;
        return imageFilter === 'with-images' ? hasImages : !hasImages;
      });
    }

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [catalogItems, searchTerm, selectedBrand, imageFilter, config.devices]);

  const getUniqueBrands = () => {
    return [...new Set(catalogItems.map(item => item.brand))].sort();
  };

  const getDeviceImages = (item: CatalogItem) => {
    // Parse the SKU to extract device and model
    const sku = item.name || item.sku;
    if (!sku) return null;
    
    // Split SKU by hyphens (e.g., "PIXEL-8-128" -> ["PIXEL", "8", "128"])
    const skuParts = sku.split('-');
    if (skuParts.length < 2) return null;
    
    const device = skuParts[0]; // First part is usually the device
    const model = skuParts[1];  // Second part is usually the model
    
    return config.devices.find(deviceConfig =>
      deviceConfig.device.toUpperCase() === device.toUpperCase() && 
      deviceConfig.model.toUpperCase() === model.toUpperCase() && 
      deviceConfig.brand.toUpperCase() === item.brand.toUpperCase()
    );
  };

  const handleAddImages = (item: CatalogItem) => {
    const sku = item.name || item.sku;
    if (!sku) return;
    
    const skuParts = sku.split('-');
    if (skuParts.length < 2) return;
    
    const device = skuParts[0];
    const model = skuParts[1];
    
    setFormData({
      device: device,
      model: model,
      brand: item.brand,
      imageUrls: ['']
    });
    setEditingDevice(null);
    setShowAddModal(true);
  };

  const handleEditImages = (item: CatalogItem) => {
    const deviceImages = getDeviceImages(item);
    if (deviceImages) {
      setFormData({
        device: deviceImages.device,
        model: deviceImages.model,
        brand: deviceImages.brand,
        imageUrls: [...deviceImages.imageUrls]
      });
      setEditingDevice(deviceImages);
      setShowAddModal(true);
    }
  };

  const handleDeleteImages = async (item: CatalogItem) => {
    const deviceImages = getDeviceImages(item);
    if (!deviceImages) return;

    if (!confirm(`Are you sure you want to delete all images for ${item.name}?`)) {
      return;
    }

    const success = await deleteDevice(deviceImages);
    if (success) {
      setSuccess(`Images deleted for ${item.name}`);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Failed to delete images');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validUrls = formData.imageUrls.filter(url => url.trim() !== '');
    if (validUrls.length === 0) {
      setError('At least one image URL is required');
      return;
    }

    const deviceData = {
      device: formData.device,
      model: formData.model,
      brand: formData.brand,
      imageUrls: validUrls,
      lastUpdated: new Date().toISOString()
    };

    let success = false;
    if (editingDevice) {
      success = await updateDevice(deviceData);
    } else {
      success = await addDevice(deviceData);
    }

    if (success) {
      setSuccess(editingDevice ? 'Images updated successfully' : 'Images added successfully');
      setShowAddModal(false);
      setFormData({ device: '', model: '', brand: '', imageUrls: [''] });
      setEditingDevice(null);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Failed to save images');
      setTimeout(() => setError(''), 3000);
    }
  };

  const addImageUrl = () => {
    setFormData(prev => ({
      ...prev,
      imageUrls: [...prev.imageUrls, '']
    }));
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const updateImageUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.map((url, i) => i === index ? value : url)
    }));
  };

  const handleRefresh = () => {
    loadCatalogData();
    refresh();
    checkDatabaseStatus();
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Image Management</h1>
              <p className="text-gray-600">
                Manage product images dynamically - no backend restarts required
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={configLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {configLoading ? 'Refreshing...' : 'Refresh Data'}
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Database Status */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Database Status
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  databaseStatus === 'connected' ? 'bg-green-500' : 
                  databaseStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {databaseStatus === 'connected' ? 'Connected to Database' : 
                   databaseStatus === 'disconnected' ? 'Database Disconnected' : 'Checking Connection...'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Total Devices:</span> {databaseStats.totalDevices}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Total Images:</span> {databaseStats.totalImages}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Last Updated:</span> {databaseStats.lastUpdated ? 
                  new Date(databaseStats.lastUpdated).toLocaleString() : 'Never'}
              </div>
            </div>
            {databaseStatus === 'disconnected' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  ⚠️ Database connection failed. Images are being served from local storage. 
                  Please check your Supabase configuration.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Filters & Search</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Brands</option>
                  {getUniqueBrands().map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Image Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Status</label>
                <select
                  value={imageFilter}
                  onChange={(e) => setImageFilter(e.target.value as 'all' | 'with-images' | 'without-images')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Products</option>
                  <option value="with-images">With Images</option>
                  <option value="without-images">Without Images</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedBrand('');
                    setImageFilter('all');
                  }}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Products ({filteredItems.length} of {catalogItems.length} total)
                </h2>
                <p className="text-sm text-gray-600">
                  Manage images for your catalog products
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Items per page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filter criteria.
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => {
                    const deviceImages = getDeviceImages(item);
                    const hasImages = !!deviceImages;
                    const imageCount = deviceImages?.imageUrls.length || 0;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-16">
                              {hasImages && deviceImages?.imageUrls[0] ? (
                                <img
                                  className="h-16 w-16 rounded-lg object-cover"
                                  src={deviceImages.imageUrls[0]}
                                  alt={item.name}
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=64&h=64&fit=crop';
                                  }}
                                />
                              ) : (
                                <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">{item.brand}</div>
                              <div className="text-sm text-gray-500">${item.price}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {hasImages ? (
                            <div className="flex space-x-2">
                              {deviceImages?.imageUrls.slice(0, 3).map((url, index) => (
                                <img
                                  key={index}
                                  className="h-12 w-12 rounded object-cover border"
                                  src={url}
                                  alt={`Image ${index + 1}`}
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=48&h=48&fit=crop';
                                  }}
                                />
                              ))}
                              {imageCount > 3 && (
                                <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                  +{imageCount - 3}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">No images</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            hasImages ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {hasImages ? `${imageCount} image${imageCount !== 1 ? 's' : ''}` : 'No images'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {hasImages ? (
                              <>
                                <button
                                  onClick={() => handleEditImages(item)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteImages(item)}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded"
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleAddImages(item)}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded"
                              >
                                Add Images
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredItems.length)}</span> of{' '}
                    <span className="font-medium">{filteredItems.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDevice ? 'Edit Images' : 'Add Images'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Device</label>
                    <input
                      type="text"
                      value={formData.device}
                      onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      readOnly
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs</label>
                  <div className="space-y-4">
                    {formData.imageUrls.map((url, index) => (
                      <div key={index} className="flex space-x-4 items-center">
                        <div className="flex-1">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => updateImageUrl(index, e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        {formData.imageUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImageUrl(index)}
                            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                        {url && (
                          <div className="w-24 h-24 border rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=96&h=96&fit=crop';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addImageUrl}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add another image URL
                  </button>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({ device: '', model: '', brand: '', imageUrls: [''] });
                      setEditingDevice(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingDevice ? 'Update Images' : 'Add Images'}
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

