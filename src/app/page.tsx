'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CatalogItem, CatalogFilters } from '@/types/catalog';
import { filterCatalogItems, getUniqueValues } from '@/utils/filters';
import { getProductImage, getAllProductImages } from '@/utils/imageMapping';
import ImageCarousel from '@/components/ImageCarousel';
import Logo from '@/components/Logo';

// Enhanced Image Modal Component with Infinite Carousel
const ImageModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  productName, 
  brand 
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  productName: string;
  brand: string;
}) => {
  // Get all images for this product
  const allImages = getAllProductImages(productName, brand);
  const currentImageIndex = allImages.findIndex(img => img === imageUrl);
  const [currentIndex, setCurrentIndex] = useState(currentImageIndex >= 0 ? currentImageIndex : 0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Auto-play functionality - disabled for better performance
  // useEffect(() => {
  //   if (allImages.length <= 1) return;
    
  //   const interval = setInterval(() => {
  //     setSlideDirection('right');
  //     setCurrentIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  //   }, 4000);

  //   return () => clearInterval(interval);
  // }, [allImages.length]);

  // Reset slide direction after animation
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => setSlideDirection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

    const goToNext = () => {
    setSlideDirection('right');
    setCurrentIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const goToPrevious = () => {
    setSlideDirection('left');
    setCurrentIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
  };

  const goToImage = (index: number) => {
    setSlideDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={onClose}
    >
             <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
        >
          ×
        </button>
        
        <div className="relative overflow-hidden rounded-lg">
          <div 
            className={`transition-transform duration-300 ease-in-out ${
              slideDirection === 'left' ? 'translate-x-full' : 
              slideDirection === 'right' ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
                         <div className="flex items-center justify-center w-full h-full">
               <Image 
                 src={allImages[currentIndex] || imageUrl} 
                 alt={`${productName} - Image ${currentIndex + 1}`}
                 width={600}
                 height={600}
                 className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg"
                 onClick={(e) => e.stopPropagation()}
               />
             </div>
          </div>
          
          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-4 transition-all duration-200 hover:scale-110"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white rounded-full p-4 transition-all duration-200 hover:scale-110"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        <div className="text-center mt-4">
          <p className="text-lg font-semibold text-gray-800 mb-3">{productName}</p>
          
          {/* Image Indicators */}
          {allImages.length > 1 && (
            <div className="flex justify-center space-x-3 mb-3">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); goToImage(index); }}
                  className={`w-4 h-4 rounded-full transition-all duration-200 hover:scale-125 ${
                    index === currentIndex 
                      ? 'bg-blue-600 scale-125 shadow-lg' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
                     {/* Image Counter */}
           {allImages.length > 1 && (
             <div className="flex items-center justify-center space-x-4">
               <p className="text-sm text-gray-600 font-medium">
                 {currentIndex + 1} of {allImages.length}
               </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

function CatalogContent() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ url: string; name: string; brand: string } | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Initialize filters without useSearchParams to avoid SSR issues
  const [filters, setFilters] = useState<CatalogFilters>({
    brand: '',
    grade: '',
    search: ''
  });
  
  const router = useRouter();

  // Initialize filters from URL params using useEffect to avoid SSR issues
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setFilters({
      brand: searchParams.get('brand') || '',
      grade: searchParams.get('grade') || '',
      search: searchParams.get('search') || ''
    });
  }, []);

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, itemsPerPage]);

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
      search: ''
    });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStockStatus = (minQty: number) => {
    if (minQty < 1) {
      return { text: 'OUT OF STOCK', color: 'text-white bg-gradient-to-r from-red-500 to-red-600 shadow-md border border-red-300' };
    } else if (minQty < 20) {
      return { text: 'LIMITED STOCK', color: 'text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-md border border-orange-300' };
    } else if (minQty >= 20 && minQty <= 74) {
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
      {/* Enhanced Header with Grid Layout */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* First Row: Logo and Search */}
          <div className="flex items-center py-2">
            {/* Logo - Made Much Bigger */}
            <div className="flex items-center flex-shrink-0">
              <Logo 
                className="h-20 sm:h-24 lg:h-32" 
                width={160} 
                height={160} 
                priority={true}
              />
            </div>

            {/* Search Box - Full Width */}
            <div className="flex-1 ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
            </div>
          </div>

          {/* Second Row: Title/Subtitle and Filters */}
          <div className="flex items-center justify-between pb-2">
            {/* Title and Subtitle - Smaller than Logo */}
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Wholesale Catalog</h1>
                <p className="text-xs sm:text-sm text-gray-500">Find the best products for your business</p>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Brand Filter */}
              <div className="min-w-[130px]">
                <select
                  value={filters.brand || ''}
                  onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Grade Filter */}
              <div className="min-w-[130px]">
                <select
                  value={filters.grade || ''}
                  onChange={(e) => handleFilterChange('grade', e.target.value || undefined)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Items Per Page */}
              <div className="min-w-[110px]">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors whitespace-nowrap"
              >
                Clear filters
              </button>
            </div>

            {/* Mobile Search Toggle */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                {showFilters ? 'Hide' : 'Filters'}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden mb-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Top Pagination - Desktop */}
        {totalPages > 1 && (
          <div className="hidden lg:flex justify-end mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Mobile Collapsible Filters */}
        {showFilters && (
          <div className="lg:hidden bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="space-y-3">
              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  value={filters.brand || ''}
                  onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Items Per Page */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Show Items
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
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
                {paginatedItems.map((item) => {
                  const stockStatus = getStockStatus(item.minQty);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="relative group cursor-pointer">
                            <ImageCarousel
                              images={getAllProductImages(item.name, item.brand)}
                              productName={item.name}
                              className="w-16 h-16"
                              autoPlay={false}
                              showIndicators={false}
                              showArrows={false}
                              showCounter={true}
                              onClick={() => setModalImage({
                                url: getProductImage(item.name, item.brand) || '',
                                name: item.name,
                                brand: item.brand
                              })}
                            />
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

          {/* Mobile Cards */}
          <div className="sm:hidden">
            {paginatedItems.map((item) => {
              const stockStatus = getStockStatus(item.minQty);
              return (
                <div key={item.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="relative group cursor-pointer flex-shrink-0">
                      <ImageCarousel
                        images={getAllProductImages(item.name, item.brand)}
                        productName={item.name}
                        className="w-20 h-20"
                        autoPlay={false}
                        showIndicators={false}
                        showArrows={false}
                        showCounter={true}
                        onClick={() => setModalImage({
                          url: getProductImage(item.name, item.brand) || '',
                          name: item.name,
                          brand: item.brand
                        })}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 mb-1">{item.name}</div>
                      <div className="text-sm text-gray-500 mb-2">{item.brand}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</div>
                      )}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {getGradeTags(item.grade).map((tag, index) => (
                          <span key={index} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${tag.color}`}>
                            {tag.text}
                          </span>
                        ))}
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {paginatedItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No items found matching your filters.</p>
            </div>
          )}
        </div>

        {/* Bottom Pagination */}
        {filteredItems.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Image Modal */}
      <ImageModal 
        isOpen={modalImage !== null}
        onClose={() => setModalImage(null)}
        imageUrl={modalImage?.url || ''}
        productName={modalImage?.name || ''}
        brand={modalImage?.brand || ''}
      />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading catalog...</p>
        </div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
