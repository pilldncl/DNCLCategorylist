'use client';

import React, { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CatalogItem, CatalogFilters } from '@/types/catalog';
import { filterCatalogItems, getUniqueValues } from '@/utils/filters';
import { useDynamicImages } from '@/hooks/useDynamicImages';
import { useRanking } from '@/hooks/useRanking';
// Trending functionality removed
// import { LazyCatalogImage } from '@/components/OptimizedImage';
import Logo from '@/components/Logo';
import { CONTACT_CONFIG } from '@/config/contact';

// Lazy load heavy components
const ImageCarousel = lazy(() => import('@/components/ImageCarousel'));

// Async Image Carousel Wrapper with performance optimization
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

      // Delay loading to prioritize initial page render
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

// Enhanced Image Modal Component with Infinite Carousel
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
  // Get all images for this product
  const [allImages, setAllImages] = useState<string[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      getAllProductImages(productName, brand).then(setAllImages);
    }
  }, [isOpen, productName, brand, getAllProductImages]);
  const currentImageIndex = allImages.findIndex(img => img === imageUrl);
  const [currentIndex, setCurrentIndex] = useState(currentImageIndex >= 0 ? currentImageIndex : 0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Reset current index when modal opens with a new image
  useEffect(() => {
    if (isOpen) {
      const newIndex = allImages.findIndex(img => img === imageUrl);
      setCurrentIndex(newIndex >= 0 ? newIndex : 0);
      setSlideDirection(null);
    }
  }, [isOpen, imageUrl, allImages]);

  // Reset slide direction after animation
  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => setSlideDirection(null), 300);
      return () => clearTimeout(timer);
    }
  }, [slideDirection]);

  const goToNext = async () => {
    setSlideDirection('right');
    setCurrentIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    await onImageNavigation(productName, brand);
  };

  const goToPrevious = async () => {
    setSlideDirection('left');
    setCurrentIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
    await onImageNavigation(productName, brand);
  };

  const goToImage = async (index: number) => {
    setSlideDirection(index > currentIndex ? 'right' : 'left');
    setCurrentIndex(index);
    await onImageNavigation(productName, brand);
  };

  // Don't render anything if not open
  if (!isOpen) {
    return null;
  }

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
  const [itemsPerPage, setItemsPerPage] = useState<number>(10); // Default to 10 items per page
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [showRanking, setShowRanking] = useState<boolean>(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Pagination state
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPrevPage, setHasPrevPage] = useState<boolean>(false);
  
  // Server-side filters
  const [filters, setFilters] = useState<CatalogFilters>({
    brand: '',
    grade: '',
    search: ''
  });
  
  // Use dynamic image system
  const { getProductImage, getAllProductImages } = useDynamicImages();
  
  // Use ranking system
  const { 
    trackPageView, 
    trackProductView, 
    trackResultClick, 
    trackSearch,
    trackCategoryView,
    applyRankingToItems 
  } = useRanking(items);
  
  // Trending functionality removed
  const trendingProducts: never[] = [];
  const trendingLoading = false;
  
  // Handle modal image loading
  const handleModalImageClick = async (productName: string, brand: string) => {
    const imageUrl = await getProductImage(productName, brand);
    if (imageUrl) {
      setModalImage({ url: imageUrl, name: productName, brand });
    }
  };

  // Handle row click for dropdown
  const handleRowClick = (itemId: string) => {
    setExpandedRow(expandedRow === itemId ? null : itemId);
  };

  const handleImageNavigation = async (direction: 'prev' | 'next') => {
    if (!modalImage) return;
    
    const allImages = await getAllProductImages(modalImage.name, modalImage.brand);
    if (allImages.length <= 1) return;
    
    const currentIndex = allImages.findIndex(img => img === modalImage.url);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allImages.length - 1;
    } else {
      newIndex = currentIndex < allImages.length - 1 ? currentIndex + 1 : 0;
    }
    
    setModalImage({
      url: allImages[newIndex],
      name: modalImage.name,
      brand: modalImage.brand
    });
  };

  // Fetch catalog data with server-side pagination and filtering
  const fetchCatalogData = useCallback(async (page: number = 1, newFilters?: CatalogFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = newFilters || filters;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(currentFilters.search && { search: currentFilters.search }),
        ...(currentFilters.brand && { brand: currentFilters.brand }),
        ...(currentFilters.grade && { grade: currentFilters.grade })
      });
      
      const response = await fetch(`/api/catalog?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch catalog data');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setItems(data.items || []);
      setFilteredItems(data.items || []); // Server-side filtering means items are already filtered
      setTotalItems(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 0);
      setHasNextPage(data.pagination?.hasNextPage || false);
      setHasPrevPage(data.pagination?.hasPrevPage || false);
      setCurrentPage(page);
      
      // Track page view
      await trackPageView();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog data');
      console.error('Error fetching catalog data:', err);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, filters, trackPageView]);

  // Load initial data
  useEffect(() => {
    fetchCatalogData(1);
  }, [fetchCatalogData]);

  // Apply ranking to current items (client-side ranking for display order)
  useEffect(() => {
    if (showRanking && items.length > 0) {
      // Apply client-side ranking to the current page of items
      const rankedItems = applyRankingToItems(items);
      const sortedItems = rankedItems
        .sort((a, b) => a.rank - b.rank)
        .map(rankedItem => {
          const originalItem = items.find(item => item.id === rankedItem.productId);
          return originalItem;
        })
        .filter(Boolean) as CatalogItem[];
      
      setFilteredItems(sortedItems);
    } else {
      setFilteredItems(items);
    }
  }, [items, showRanking, applyRankingToItems]);

  // Handle filter changes with debouncing
  const handleFilterChange = useCallback(async (key: keyof CatalogFilters, value: string | number | undefined) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    setFilters(newFilters);
    
    // Reset to first page when filters change
    setCurrentPage(1);
    
    // Track search and category interactions
    if (key === 'search' && value) {
      await trackSearch(value.toString());
    } else if (key === 'brand' && value) {
      await trackCategoryView(value.toString());
    }
    
    // Fetch new data with updated filters
    fetchCatalogData(1, newFilters);
  }, [filters, trackSearch, trackCategoryView, fetchCatalogData]);

  const clearFilters = () => {
    const clearedFilters = {
      brand: '',
      grade: '',
      search: ''
    };
    setFilters(clearedFilters);
    fetchCatalogData(1, clearedFilters);
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      fetchCatalogData(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPrevPage) {
      fetchCatalogData(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchCatalogData(page);
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
      const tagLower = tag.toLowerCase();
      if (tagLower.includes('a') || tagLower.includes('excellent')) {
        return { text: tag, color: 'text-white bg-gradient-to-r from-green-500 to-green-600 shadow-md border border-green-300' };
      } else if (tagLower.includes('b') || tagLower.includes('good')) {
        return { text: tag, color: 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-md border border-blue-300' };
      } else if (tagLower.includes('c') || tagLower.includes('fair')) {
        return { text: tag, color: 'text-white bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-md border border-yellow-300' };
      } else if (tagLower.includes('d') || tagLower.includes('poor')) {
        return { text: tag, color: 'text-white bg-gradient-to-r from-red-500 to-red-600 shadow-md border border-red-300' };
      } else {
        return { text: tag, color: 'text-white bg-gradient-to-r from-gray-500 to-gray-600 shadow-md border border-gray-300' };
      }
    });
  };

  // Get unique values for filter options (from current items)
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(items.map(item => item.brand))].sort();
    return uniqueBrands;
  }, [items]);
  
  const grades = useMemo(() => {
    const allGradeTags = items.flatMap(item => {
      if (!item.grade) return [];
      return item.grade.split(/[\/\\]/).map(tag => tag.trim()).filter(tag => tag !== '');
    });
    return [...new Set(allGradeTags)].sort();
  }, [items]);

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Catalog</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchCatalogData(1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with Mobile-First Layout */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Mobile Header Row 1: Logo and Search */}
            <div className="flex items-center py-3">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                <Logo 
                  className="h-8" 
                  width={160} 
                  height={160} 
                  priority={true}
                />
              </div>

              {/* Search Box */}
              <div className="flex-1 ml-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={filters.search || ''}
                    onChange={async (e) => await handleFilterChange('search', e.target.value)}
                    placeholder="Search products..."
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Header Row 2: Title and WhatsApp Button */}
            <div className="flex items-center justify-between pb-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Wholesale Catalog</h1>
                <p className="text-xs text-gray-500">Find the best products for your business</p>
              </div>

              {/* WhatsApp Button - Mobile - Always visible */}
              <button
                onClick={() => {
                  const formattedPhone = CONTACT_CONFIG.whatsapp.phoneNumber.replace(/\D/g, '');
                  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(CONTACT_CONFIG.whatsapp.defaultMessage)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                title="Chat with us on WhatsApp"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.86 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            {/* Desktop Header Row 1: Logo and Search */}
            <div className="flex items-center py-2">
              {/* Logo */}
              <div className="flex items-center flex-shrink-0">
                <Logo 
                  className="h-12" 
                  width={160} 
                  height={160} 
                  priority={true}
                />
              </div>

              {/* Search Box */}
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
                    onChange={async (e) => await handleFilterChange('search', e.target.value)}
                    placeholder="Search products..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Header Row 2: Title and Filters */}
            <div className="flex items-center justify-between pb-2">
              {/* Title and Subtitle */}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Wholesale Catalog</h1>
                <p className="text-sm text-gray-500">Find the best products for your business</p>
              </div>

              {/* Desktop Filter Controls */}
              <div className="flex items-center space-x-2">
              {/* Brand Filter */}
              <div className="min-w-[130px]">
                <select
                  value={filters.brand || ''}
                  onChange={async (e) => await handleFilterChange('brand', e.target.value || undefined)}
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
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
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
              
              {/* WhatsApp Button - Always visible (Smart Sort always ON) */}
              <button
                onClick={() => {
                  const formattedPhone = CONTACT_CONFIG.whatsapp.phoneNumber.replace(/\D/g, '');
                  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(CONTACT_CONFIG.whatsapp.defaultMessage)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                className="px-3 py-1.5 text-sm bg-green-600 text-white border border-green-600 rounded-lg hover:bg-green-700 hover:border-green-700 transition-colors whitespace-nowrap flex items-center space-x-1"
                title="Chat with us on WhatsApp"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
          </div>
        </div>
      </header>

      {/* Mobile Filters Section - Compact Single Row */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center space-x-2">
            {/* Brand Filter - Compact */}
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
              <select
                value={filters.brand || ''}
                onChange={async (e) => await handleFilterChange('brand', e.target.value || undefined)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Grade Filter - Compact */}
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">Grade</label>
              <select
                value={filters.grade || ''}
                onChange={(e) => handleFilterChange('grade', e.target.value || undefined)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* Items Per Page - Compact */}
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-medium text-gray-600 mb-1">Per Page</label>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Clear Filters - Icon Button */}
            <div className="flex items-center">
              <button
                onClick={clearFilters}
                className="px-2 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-md transition-colors flex items-center justify-center"
                title="Clear all filters"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Pagination Controls - Top */}
        {filteredItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              {/* Results Info */}
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={!hasPrevPage}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
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
                        className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Display - Responsive Layout */}
        {filteredItems.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Brand
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Grade
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Stock Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => {
                      const stockStatus = getStockStatus(item.minQty);
                      const isExpanded = expandedRow === item.id;
                      return (
                        <React.Fragment key={item.id}>
                          <tr 
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50' : ''}`}
                            onClick={() => handleRowClick(item.id)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap w-1/2">
                            <div className="flex items-center space-x-3">
                              <div className="relative group cursor-pointer flex-shrink-0">
                                <AsyncImageCarousel
                                  productName={item.name}
                                  brand={item.brand}
                                  className="w-16 h-16"
                                  autoPlay={false}
                                  showIndicators={false}
                                  showArrows={false}
                                  showCounter={true}
                                  onClick={() => handleModalImageClick(item.name, item.brand)}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div 
                                  className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600" 
                                  title={item.name}
                                  onClick={async () => {
                                    await trackProductView(item.id);
                                    await trackResultClick(item.id, item.brand);
                                  }}
                                >
                                  {item.name}
                                </div>
                                {item.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs" title={item.description}>
                                    {item.description.length > 50 ? `${item.description.substring(0, 50)}...` : item.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap w-1/6">
                            <div className="text-sm text-gray-900 truncate" title={item.brand}>
                              {item.brand}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap w-1/6">
                            <div className="flex flex-wrap gap-1">
                              {getGradeTags(item.grade).map((tag, index) => (
                                <span key={index} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${tag.color}`}>
                                  {tag.text}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap w-1/6">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${stockStatus.color}`}>
                              {stockStatus.text}
                            </span>
                          </td>
                        </tr>
                        
                        {/* Dropdown Content */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={4} className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                              <table className="w-full">
                                <tbody>
                                  <tr>
                                    {/* Product Column - Full Description */}
                                    <td className="px-6 py-4 w-1/2">
                                      <div className="min-w-0">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h4>
                                        {item.description && (
                                          <p className="text-sm text-gray-600 leading-relaxed">
                                            {item.description}
                                          </p>
                                        )}
                                      </div>
                                    </td>
                                    
                                    {/* Brand Column - Empty */}
                                    <td className="px-6 py-4 w-1/6">
                                    </td>
                                    
                                    {/* Grade Column - Empty */}
                                    <td className="px-6 py-4 w-1/6">
                                    </td>
                                    
                                    {/* Stock Status Column - Inquiry Buttons */}
                                    <td className="px-6 py-4 w-1/6">
                                      <div className="flex space-x-4 items-center">
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const subject = `Inquiry about ${item.name}`;
                                    
                                    // Get the first product image
                                    let imageUrl = '';
                                    try {
                                      const productImages = await getAllProductImages(item.name, item.brand);
                                      if (productImages && productImages.length > 0) {
                                        imageUrl = productImages[0];
                                      }
                                    } catch (error) {
                                      console.log('Could not load product image for email');
                                    }
                                    
                                    // Build email body with image
                                    let body = `Hi! I'm interested in ${item.name} (${item.brand}).\n\nProduct Details:\n- Grade: ${item.grade}\n\nCan you provide pricing and availability information?`;
                                    
                                    // Add image URL if available
                                    if (imageUrl) {
                                      body += `\n\nProduct Image: ${imageUrl}`;
                                    }
                                    
                                    window.open(`mailto:${CONTACT_CONFIG.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                                  }}
                                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-blue-400/20 hover:shadow-blue-500/25 flex items-center justify-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                  </svg>
                                  Email Inquiry
                                </button>
                                
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const formattedPhone = CONTACT_CONFIG.whatsapp.phoneNumber.replace(/\D/g, '');
                                    
                                    // Get the first product image
                                    let imageUrl = '';
                                    try {
                                      const productImages = await getAllProductImages(item.name, item.brand);
                                      if (productImages && productImages.length > 0) {
                                        imageUrl = productImages[0];
                                      }
                                    } catch (error) {
                                      console.log('Could not load product image for WhatsApp');
                                    }
                                    
                                    // Build message with image
                                    let message = `Hi! I'm interested in ${item.name} (${item.brand}).\n\nProduct Details:\n- Grade: ${item.grade}\n\nCan you provide pricing and availability information?`;
                                    
                                    // Add image URL if available
                                    if (imageUrl) {
                                      message += `\n\nProduct Image: ${imageUrl}`;
                                    }
                                    
                                    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
                                    window.open(whatsappUrl, '_blank');
                                  }}
                                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-green-400/20 hover:shadow-green-500/25 flex items-center justify-center"
                                >
                                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                  </svg>
                                  WhatsApp Inquiry
                                </button>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
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

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item.minQty);
                const isExpanded = expandedRow === item.id;
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Main Card Content */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleRowClick(item.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <AsyncImageCarousel
                            productName={item.name}
                            brand={item.brand}
                            className="w-20 h-20"
                            autoPlay={false}
                            showIndicators={false}
                            showArrows={false}
                            showCounter={true}
                            onClick={() => handleModalImageClick(item.name, item.brand)}
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 
                                className="text-base font-semibold text-gray-900 truncate"
                                onClick={async () => {
                                  await trackProductView(item.id);
                                  await trackResultClick(item.id, item.brand);
                                }}
                              >
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{item.brand}</p>
                              {item.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            
                            {/* Stock Status Badge */}
                            <div className="ml-2 flex-shrink-0">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${stockStatus.color}`}>
                                {stockStatus.text}
                              </span>
                            </div>
                          </div>
                          
                          {/* Grade Tags */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {getGradeTags(item.grade).map((tag, index) => (
                              <span key={index} className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${tag.color}`}>
                                {tag.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Expand/Collapse Indicator */}
                      <div className="flex justify-center mt-3">
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4">
                        <div className="space-y-4">
                          {/* Full Description */}
                          {item.description && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          )}
                          
                          {/* Inquiry Buttons */}
                          <div className="flex flex-col space-y-3">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const subject = `Inquiry about ${item.name}`;
                                
                                // Get the first product image
                                let imageUrl = '';
                                try {
                                  const productImages = await getAllProductImages(item.name, item.brand);
                                  if (productImages && productImages.length > 0) {
                                    imageUrl = productImages[0];
                                  }
                                } catch (error) {
                                  console.log('Could not load product image for email');
                                }
                                
                                // Build email body with image
                                let body = `Hi! I'm interested in ${item.name} (${item.brand}).\n\nProduct Details:\n- Grade: ${item.grade}\n\nCan you provide pricing and availability information?`;
                                
                                // Add image URL if available
                                if (imageUrl) {
                                  body += `\n\nProduct Image: ${imageUrl}`;
                                }
                                
                                window.open(`mailto:${CONTACT_CONFIG.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                              }}
                              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-blue-400/20 flex items-center justify-center"
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                              </svg>
                              Email Inquiry
                            </button>
                            
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                const formattedPhone = CONTACT_CONFIG.whatsapp.phoneNumber.replace(/\D/g, '');
                                
                                // Get the first product image
                                let imageUrl = '';
                                try {
                                  const productImages = await getAllProductImages(item.name, item.brand);
                                  if (productImages && productImages.length > 0) {
                                    imageUrl = productImages[0];
                                  }
                                } catch (error) {
                                  console.log('Could not load product image for WhatsApp');
                                }
                                
                                // Build message with image
                                let message = `Hi! I'm interested in ${item.name} (${item.brand}).\n\nProduct Details:\n- Grade: ${item.grade}\n\nCan you provide pricing and availability information?`;
                                
                                // Add image URL if available
                                if (imageUrl) {
                                  message += `\n\nProduct Image: ${imageUrl}`;
                                }
                                
                                const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
                                window.open(whatsappUrl, '_blank');
                              }}
                              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-green-400/20 flex items-center justify-center"
                            >
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                              </svg>
                              WhatsApp Inquiry
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={!hasPrevPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <span className="px-2 text-sm text-gray-500">...</span>
                  )}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={!hasNextPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
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
         getAllProductImages={getAllProductImages}
                   onImageNavigation={async (_productName: string, _brand: string) => {
            // Track image navigation
            const item = items.find(item => item.name === _productName && item.brand === _brand);
           if (item) {
             await trackProductView(item.id);
           }
         }}
       />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <>
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
     
    </>
  );
}
