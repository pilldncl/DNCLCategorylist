'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CatalogItem, CatalogFilters } from '@/types/catalog';
import { filterCatalogItems, getUniqueValues } from '@/utils/filters';
import { getProductImage } from '@/utils/imageMapping';

// Image Modal Component
const ImageModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  productName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  imageUrl: string; 
  productName: string; 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="bg-white rounded-lg p-4 max-w-2xl max-h-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        <img 
          src={imageUrl} 
          alt={productName}
          className="w-full h-auto object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        <p className="text-center mt-2 text-sm text-gray-600">{productName}</p>
      </div>
    </div>
  );
};

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ url: string; name: string } | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<CatalogFilters>({
    brand: searchParams.get('brand') || '',
    grade: searchParams.get('grade') || '',
    minQty: searchParams.get('minQty') ? parseInt(searchParams.get('minQty')!) : undefined,
    search: searchParams.get('search') || ''
  });

  // Fetch catalog data
  useEffect(() => {
    async function fetchCatalog() {
      try {
        const response = await fetch('/api/catalog');
        if (!response.ok) {
          throw new Error('Failed to fetch catalog');
        }
        const data = await response.json();
        setItems(data.items);
        setFilteredItems(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load catalog');
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, value.toString());
      }
    });
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/';
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Filter items when filters or items change
  useEffect(() => {
    const filtered = filterCatalogItems(items, filters);
    setFilteredItems(filtered);
  }, [items, filters]);

  // Get unique values for filter options
  const brands = getUniqueValues(items, 'brand');
  
  // Get unique grade tags (split by / or \)
  const allGradeTags = items.flatMap(item => {
    if (!item.grade) return [];
    return item.grade.split(/[\/\\]/).map(tag => tag.trim()).filter(tag => tag !== '');
  });
  const grades = [...new Set(allGradeTags)].sort();

  const handleFilterChange = (key: keyof CatalogFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      grade: '',
      minQty: undefined,
      search: ''
    });
  };

  const getStockStatus = (minQty: number) => {
    if (minQty === 0) {
      return { text: 'OUT OF STOCK', color: 'text-white bg-gradient-to-r from-red-500 to-red-600 shadow-md border border-red-300' };
    } else if (minQty < 20) {
      return { text: 'LIMITED STOCK', color: 'text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-md border border-orange-300' };
    } else if (minQty > 50) {
      return { text: 'IN STOCK', color: 'text-white bg-gradient-to-r from-green-500 to-green-600 shadow-md border border-green-300' };
    } else {
      return { text: 'AVAILABLE', color: 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-md border border-blue-300' };
    }
  };

  const getGradeTags = (grade: string) => {
    if (!grade) return [];
    
    // Split by both / and \ and filter out empty strings
    const tags = grade.split(/[\/\\]/).filter(tag => tag.trim() !== '');
    
    return tags.map(tag => {
      const trimmedTag = tag.trim();
      if (trimmedTag === 'CPO') {
        return { 
          text: trimmedTag, 
          color: 'text-white bg-gradient-to-r from-purple-500 to-purple-600 shadow-md border border-purple-300' 
        };
      } else if (trimmedTag === 'A') {
        return { 
          text: trimmedTag, 
          color: 'text-white bg-gradient-to-r from-green-500 to-green-600 shadow-md border border-green-300' 
        };
      } else if (trimmedTag === 'B') {
        return { 
          text: trimmedTag, 
          color: 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-md border border-blue-300' 
        };
      } else if (trimmedTag === 'C') {
        return { 
          text: trimmedTag, 
          color: 'text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-md border border-orange-300' 
        };
      } else {
        return { 
          text: trimmedTag, 
          color: 'text-white bg-gradient-to-r from-gray-500 to-gray-600 shadow-md border border-gray-300' 
        };
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Wholesale Catalog</h1>
          <p className="text-gray-600">
            {filteredItems.length} of {items.length} items
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <select
                value={filters.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <select
                value={filters.grade || ''}
                onChange={(e) => handleFilterChange('grade', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Grades</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* Min Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Quantity
              </label>
              <input
                type="number"
                value={filters.minQty || ''}
                onChange={(e) => handleFilterChange('minQty', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Min Qty"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear all filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item.minQty);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="relative group cursor-pointer">
                            <img 
                              src={`${item.image || getProductImage(item.name, item.brand)}?v=${Date.now()}`}
                              alt={item.name}
                              className="w-12 h-12 object-cover border border-gray-200 group-hover:scale-150 group-hover:shadow-lg transition-all duration-200 z-10 relative"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                              onClick={() => setModalImage({
                                url: item.image || getProductImage(item.name, item.brand) || '',
                                name: item.name
                              })}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200"></div>
                          </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">{item.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.brand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {getGradeTags(item.grade).map((tag, index) => (
                            <span key={index} className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${tag.color} hover:scale-105 transition-transform duration-200`}>
                              {tag.text}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${stockStatus.color} hover:scale-105 transition-transform duration-200`}>
                          {stockStatus.text}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No items found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Image Modal */}
      <ImageModal 
        isOpen={modalImage !== null}
        onClose={() => setModalImage(null)}
        imageUrl={modalImage?.url || ''}
        productName={modalImage?.name || ''}
      />
    </div>
  );
}
