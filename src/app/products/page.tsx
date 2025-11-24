'use client';

import React, { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CatalogItem, CatalogFilters } from '@/types/catalog';
import { filterCatalogItems, getUniqueValues } from '@/utils/filters';
import { useDynamicImages } from '@/hooks/useDynamicImages';
import { useRanking } from '@/hooks/useRanking';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import Logo from '@/components/Logo';
import { CONTACT_CONFIG } from '@/config/contact';
import { trackWhatsAppClick, trackContactFormSubmission } from '@/utils/contactTracking';
import ProductGrid from '@/components/ProductGrid';
import ThemeToggle from '@/components/ThemeToggle';
import ShoppingCart from '@/components/ShoppingCart';
import CartIcon from '@/components/CartIcon';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import QuickViewModal from '@/components/QuickViewModal';
import AdvancedFilters from '@/components/AdvancedFilters';
import ModernHeader from '@/components/ModernHeader';
import LiveChat from '@/components/LiveChat';
import RecommendedProductsSidebar from '@/components/RecommendedProductsSidebar';

// Lazy load heavy components
const ImageCarousel = lazy(() => import('@/components/ImageCarousel'));

// Async Image Carousel Wrapper
const AsyncImageCarousel = ({ 
  productName, 
  brand, 
  className, 
  autoPlay, 
  showIndicators, 
  showArrows, 
  showCounter, 
  onClick 
}: {
  productName: string;
  brand: string;
  className: string;
  autoPlay: boolean;
  showIndicators: boolean;
  showArrows: boolean;
  showCounter: boolean;
  onClick: () => void;
}) => {
  const { getAllProductImages } = useDynamicImages();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadImages = async () => {
      try {
        const imgs = await getAllProductImages(productName, brand);
        if (mounted) {
          setImages(imgs);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(loadImages, 200);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [productName, brand, getAllProductImages]);

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse rounded-lg flex items-center justify-center`}>
        <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className={`${className} bg-gray-200 animate-pulse rounded-lg flex items-center justify-center`}>
        <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    }>
      <ImageCarousel
        images={images}
        productName={productName}
        brand={brand}
        className={className}
        autoPlay={autoPlay}
        showIndicators={showIndicators}
        showArrows={showArrows}
        showCounter={showCounter}
        onClick={onClick}
      />
    </Suspense>
  );
};

// Image Modal Component
const ImageModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  productName, 
  brand,
  getAllProductImages,
  onImageNavigation
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  productName: string;
  brand: string;
  getAllProductImages: (productName: string, brand: string) => Promise<string[]>;
  onImageNavigation: (productName: string, brand: string) => Promise<void>;
}) => {
  const [allImages, setAllImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    if (isOpen && imageUrl) {
      const loadImages = async () => {
        try {
          const images = await getAllProductImages(productName, brand);
          setAllImages(images);
          const index = images.findIndex(img => img === imageUrl);
          setCurrentIndex(index >= 0 ? index : 0);
        } catch (error) {
          console.error('Error loading images:', error);
        }
      };
      loadImages();
    }
  }, [isOpen, imageUrl, productName, brand, getAllProductImages]);

  const goToPrevious = async () => {
    if (currentIndex > 0) {
      setSlideDirection('right');
      setCurrentIndex(currentIndex - 1);
    } else if (allImages.length > 0) {
      setSlideDirection('right');
      setCurrentIndex(allImages.length - 1);
    }
    await onImageNavigation(productName, brand);
  };

  const goToNext = async () => {
    if (currentIndex < allImages.length - 1) {
      setSlideDirection('left');
      setCurrentIndex(currentIndex + 1);
    } else if (allImages.length > 0) {
      setSlideDirection('left');
      setCurrentIndex(0);
    }
    await onImageNavigation(productName, brand);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {allImages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        <div className="bg-white rounded-lg overflow-hidden">
          <img
            src={allImages[currentIndex] || imageUrl}
            alt={productName}
            className="w-full h-auto max-h-[90vh] object-contain"
          />
        </div>
        
        {allImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
    </div>
  );
};

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [modalImage, setModalImage] = useState<{ url: string; name: string; brand: string } | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<CatalogItem | null>(null);
  
  const [filters, setFilters] = useState<CatalogFilters>({
    brand: searchParams.get('brand') || '',
    grade: searchParams.get('grade') || '',
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  });
  
  const [filterOptions, setFilterOptions] = useState<{
    brands: string[];
    grades: string[];
  }>({ brands: [], grades: [] });
  
  // All products for recommendations (not paginated)
  const [allProductsForRecommendations, setAllProductsForRecommendations] = useState<CatalogItem[]>([]);
  
  const { getProductImage, getAllProductImages } = useDynamicImages();
  const { 
    trackPageView, 
    trackProductView, 
    trackResultClick, 
    trackSearch,
    trackCategoryView
  } = useAnalyticsTracking();
  const { applyRankingToItems } = useRanking(items);

  // Fetch catalog data
  const fetchCatalogData = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.brand && { brand: filters.brand }),
        ...(filters.grade && { grade: filters.grade }),
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      });

      const response = await fetch(`/api/catalog?${params}`);
      if (!response.ok) throw new Error('Failed to fetch catalog');
      
      const data = await response.json();
      setItems(data.items || []);
      
      await trackPageView();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, filters, trackPageView]);

  // Fetch filter options and all products for recommendations
  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/catalog?limit=1000');
      if (response.ok) {
        const data = await response.json();
        if (data.items) {
          const brands = getUniqueValues(data.items, 'brand');
          const grades = getUniqueValues(data.items, 'grade');
          setFilterOptions({ brands, grades });
          setAllProductsForRecommendations(data.items);
        }
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []);

  useEffect(() => {
    fetchCatalogData(currentPage);
    fetchFilterOptions();
  }, [currentPage, itemsPerPage, filters, fetchCatalogData, fetchFilterOptions]);

  // Get unique values for filters
  const brands = useMemo(() => getUniqueValues(items, 'brand'), [items]);
  const grades = useMemo(() => getUniqueValues(items, 'grade'), [items]);
  const categories = useMemo(() => getUniqueValues(items, 'category').filter(Boolean), [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return filterCatalogItems(items, filters);
  }, [items, filters]);

  // Pagination
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      goToPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPrevPage) {
      goToPage(currentPage - 1);
    }
  };

  // Filter handlers
  const handleFilterChange = (key: keyof CatalogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    
    if (key === 'search' && value) {
      trackSearch(value);
    }
    if (key === 'category' && value) {
      trackCategoryView(value);
    }
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      grade: '',
      search: '',
      category: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    setCurrentPage(1);
  };

  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

  const handlePriceRangeChange = (range: [number, number] | null) => {
    setPriceRange(range);
    if (range) {
      setFilters(prev => ({
        ...prev,
        minPrice: range[0],
        maxPrice: range[1]
      }));
    } else {
      setFilters(prev => {
        const { minPrice, maxPrice, ...rest } = prev;
        return rest;
      });
    }
    setCurrentPage(1);
  };

  const handleRowClick = (itemId: string) => {
    setExpandedRow(expandedRow === itemId ? null : itemId);
  };

  const handleQuickView = (item: CatalogItem) => {
    setQuickViewProduct(item);
  };

  const handleInquiry = async (type: 'email' | 'whatsapp', item: CatalogItem) => {
    if (type === 'email') {
      await trackContactFormSubmission(item.id, {
        productName: item.name,
        brand: item.brand,
        grade: item.grade,
        contactMethod: 'email'
      });
    } else {
      await trackWhatsAppClick(item.id, CONTACT_CONFIG.whatsapp.phoneNumber);
    }
  };

  const getStockStatus = (minQty: number) => {
    if (minQty === 0) {
      return { text: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };
    } else if (minQty <= 5) {
      return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' };
    } else {
      return { text: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' };
    }
  };

  const getGradeTags = (grade: string) => {
    const gradeMap: Record<string, { text: string; color: string }> = {
      'A': { text: 'Grade A', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      'B': { text: 'Grade B', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      'C': { text: 'Grade C', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
      'New': { text: 'New', color: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300' },
      'Refurbished': { text: 'Refurbished', color: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-300' },
    };
    
    const normalizedGrade = grade.trim();
    if (gradeMap[normalizedGrade]) {
      return [gradeMap[normalizedGrade]];
    }
    
    return [{ text: grade, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }];
  };

  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchCatalogData(currentPage)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Modern Header */}
      <ModernHeader
        searchValue={filters.search || ''}
        onSearchChange={(value) => handleFilterChange('search', value)}
        onSearch={(query) => handleFilterChange('search', query)}
        onCartClick={() => setCartOpen(true)}
      />

      {/* Filters & Sort Bar */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <AdvancedFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                brands={brands}
                grades={grades}
                categories={categories}
                priceRange={priceRange || undefined}
                onPriceRangeChange={handlePriceRangeChange}
              />
              {Object.values(filters).filter(Boolean).length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={`${filters.sortBy || 'created_at'}-${filters.sortOrder || 'desc'}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy' as keyof CatalogFilters, sortBy);
                  handleFilterChange('sortOrder' as keyof CatalogFilters, sortOrder);
                }}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
              
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={8}>8 per page</option>
                <option value={16}>16 per page</option>
                <option value={24}>24 per page</option>
                <option value={32}>32 per page</option>
              </select>

              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 dark:bg-primary-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'table'
                      ? 'bg-primary-600 dark:bg-primary-500 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Products Content */}
          <div id="products-section" className="flex-1 min-w-0">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {filteredItems.length > 0 ? (
          <>
            <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} products
            </div>

            {viewMode === 'grid' && (
              <div className="mb-8">
                <ProductGrid
                  items={filteredItems}
                  onImageClick={(item) => handleQuickView(item)}
                  onInquiry={handleInquiry}
                />
              </div>
            )}

            {viewMode === 'table' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Brand</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredItems.map((item) => {
                        const stockStatus = getStockStatus(item.minQty);
                        const isExpanded = expandedRow === item.id;
                        return (
                          <React.Fragment key={item.id}>
                            <tr 
                              className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${isExpanded ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                              onClick={() => handleRowClick(item.id)}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <AsyncImageCarousel
                                    productName={item.name}
                                    brand={item.brand}
                                    className="w-16 h-16"
                                    autoPlay={false}
                                    showIndicators={false}
                                    showArrows={false}
                                    showCounter={true}
                                    onClick={() => handleQuickView(item)}
                                  />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                                    {item.description && (
                                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                        {item.description.length > 50 ? `${item.description.substring(0, 50)}...` : item.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.brand}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {getGradeTags(item.grade).map((tag, index) => (
                                    <span key={index} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase ${tag.color}`}>
                                      {tag.text}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase ${stockStatus.color}`}>
                                  {stockStatus.text}
                                </span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={4} className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
                                  <div className="space-y-4">
                                    {item.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                                    )}
                                    <div className="flex space-x-4">
                                      <button
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          await handleInquiry('email', item);
                                          const subject = `Inquiry about ${item.name}`;
                                          window.open(`mailto:${CONTACT_CONFIG.contact.email}?subject=${encodeURIComponent(subject)}`);
                                        }}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                      >
                                        Email Inquiry
                                      </button>
                                      <button
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          await handleInquiry('whatsapp', item);
                                          const formattedPhone = CONTACT_CONFIG.whatsapp.phoneNumber.replace(/\D/g, '');
                                          const message = `Hi! I'm interested in ${item.name} (${item.brand}).`;
                                          window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                      >
                                        WhatsApp Inquiry
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={!hasPrevPage}
                      className="px-3 py-1 text-sm text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-1">
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
                            className={`px-3 py-1 text-sm rounded-md ${
                              currentPage === pageNum
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={goToNextPage}
                      disabled={!hasNextPage}
                      className="px-3 py-1 text-sm text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search terms.</p>
          </div>
        )}
          </div>

          {/* Recommended Products Sidebar - Desktop Only */}
          <div className="hidden lg:block">
            <RecommendedProductsSidebar
              currentProducts={filteredItems}
              allProducts={allProductsForRecommendations}
              maxItems={5}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ImageModal 
        isOpen={modalImage !== null}
        onClose={() => setModalImage(null)}
        imageUrl={modalImage?.url || ''}
        productName={modalImage?.name || ''}
        brand={modalImage?.brand || ''}
        getAllProductImages={getAllProductImages}
        onImageNavigation={async (productName: string, brand: string) => {
          const item = items.find(item => item.name === productName && item.brand === brand);
          if (item) {
            await trackProductView(item.id);
          }
        }}
      />
      
      <ShoppingCart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      
      <QuickViewModal
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
      />

      <LiveChat />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading products...</p>
          </div>
        </div>
      }>
        <ProductsContent />
      </Suspense>
      <ThemeToggle />
    </>
  );
}

