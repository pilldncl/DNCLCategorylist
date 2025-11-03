'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CatalogItem } from '@/types/catalog';
import { useDynamicImages } from '@/hooks/useDynamicImages';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

interface FeaturedProduct {
  id: string;
  productId: string;
  type: 'new' | 'featured';
  isActive: boolean;
  displayOrder: number;
}

interface FeaturedProductsProps {
  featuredList: FeaturedProduct[];
  products: CatalogItem[];
  onImageClick?: (item: CatalogItem) => void;
  onInquiry?: (type: 'email' | 'whatsapp', item: CatalogItem) => void;
  className?: string;
}

export default function FeaturedProducts({
  featuredList,
  products,
  onImageClick,
  onInquiry,
  className = ''
}: FeaturedProductsProps) {
  const { getProductImage } = useDynamicImages();
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [images, setImages] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { trackProductView } = useAnalyticsTracking();

  // Load images for featured products
  useEffect(() => {
    const loadImages = async () => {
      for (const featured of featuredList) {
        const product = products.find(p => p.id === featured.productId);
        if (product) {
          try {
            setImageLoading(prev => ({ ...prev, [featured.productId]: true }));
            const imageUrl = await getProductImage(product.name, product.brand);
            setImages(prev => ({ ...prev, [featured.productId]: imageUrl }));
            setImageErrors(prev => ({ ...prev, [featured.productId]: false }));
          } catch (error) {
            setImageErrors(prev => ({ ...prev, [featured.productId]: true }));
          } finally {
            setImageLoading(prev => ({ ...prev, [featured.productId]: false }));
          }
        }
      }
    };
    
    if (featuredList.length > 0 && products.length > 0) {
      loadImages();
    }
  }, [featuredList, products, getProductImage]);

  // Get the actual product data for each featured item
  const featuredProducts = featuredList
    .map(featured => {
      const product = products.find(p => p.id === featured.productId);
      return product ? { ...featured, product } : null;
    })
    .filter(Boolean) as (FeaturedProduct & { product: CatalogItem })[];

  // Auto-play functionality
  useEffect(() => {
    if (featuredProducts.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredProducts.length, isPaused]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredProducts.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + featuredProducts.length) % featuredProducts.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  if (featuredProducts.length === 0) {
    return null;
  }

  const getStockStatus = (minQty: number) => {
    if (minQty < 1) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
    if (minQty < 20) return { text: 'Limited Stock', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (minQty >= 20 && minQty <= 74) return { text: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' };
    return { text: 'Available', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  const currentProduct = featuredProducts[currentIndex];

  return (
    <div className={className}>
      {/* Section Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Featured Products</h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">Handpicked items you don't want to miss</p>
          </div>
        </div>
      </div>

      {/* Featured Product Carousel */}
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {currentProduct && (() => {
          const { product, type } = currentProduct;
          const stockStatus = getStockStatus(product.minQty);
          const imageUrl = images[product.id];
          const isLoading = imageLoading[product.id];
          const hasError = imageErrors[product.id];

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Image Section - Smaller */}
              <div className="relative w-full aspect-square bg-gray-100 overflow-hidden cursor-pointer group" onClick={() => onImageClick?.(product)}>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {!hasError && imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform duration-700 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}

                {hasError && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Type & Stock Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide shadow-lg ${
                      type === 'new'
                        ? 'bg-green-500 text-white'
                        : 'bg-orange-500 text-white'
                    }`}
                  >
                    {type === 'new' ? '🆕 New' : '⭐ Featured'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${stockStatus.color} bg-white backdrop-blur-sm`}>
                    {stockStatus.text}
                  </span>
                </div>
              </div>

              {/* Info & Buttons Section - Larger */}
              <div className="relative overflow-hidden flex flex-col justify-center p-8 md:p-12">
                {/* Multi-layer Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
                <div className="absolute inset-0 bg-gradient-radial from-blue-50/30 via-transparent to-transparent dark:from-blue-900/20"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-50/20 via-transparent to-transparent dark:from-purple-900/20"></div>
                {/* Content */}
                <div className="relative z-10">
                {/* Brand */}
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {product.brand}
                </div>

                {/* Product Name */}
                <h3 
                  className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => onImageClick?.(product)}
                >
                  {product.name}
                </h3>

                {/* Price */}
                {product.price !== undefined && product.price > 0 && (
                  <div className="text-3xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-8">
                    ${product.price.toFixed(2)}
                  </div>
                )}

                {/* Action Buttons - Hero Style */}
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => onInquiry?.('email', product)}
                    className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center justify-center hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Email Inquiry
                  </button>

                  <button
                    onClick={() => onInquiry?.('whatsapp', product)}
                    className="w-full px-6 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center justify-center hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                    Chat on WhatsApp
                  </button>
                </div>
                </div>
              </div>
            </div>
          );
        })()}
        
        {/* Navigation Arrows */}
        {featuredProducts.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 md:p-4 transition-all duration-200 hover:scale-110 z-10"
              aria-label="Previous featured product"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 md:p-4 transition-all duration-200 hover:scale-110 z-10"
              aria-label="Next featured product"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Indicators */}
        {featuredProducts.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {featuredProducts.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 10000);
                }}
                className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 md:w-12 bg-white' 
                    : 'w-2 md:w-3 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to featured product ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

