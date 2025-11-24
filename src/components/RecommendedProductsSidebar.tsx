'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CatalogItem } from '@/types/catalog';
import { useDynamicImages } from '@/hooks/useDynamicImages';

interface RecommendedProductsSidebarProps {
  currentProducts?: CatalogItem[];
  allProducts?: CatalogItem[];
  maxItems?: number;
}

export default function RecommendedProductsSidebar({
  currentProducts = [],
  allProducts = [],
  maxItems = 5
}: RecommendedProductsSidebarProps) {
  const router = useRouter();
  const { getProductImage } = useDynamicImages();
  const [recommendedProducts, setRecommendedProducts] = useState<CatalogItem[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

  // Generate recommendations based on current products
  useEffect(() => {
    if (allProducts.length === 0) return;

    const recommendations: CatalogItem[] = [];
    const currentProductIds = new Set(currentProducts.map(p => p.id));
    
    // Strategy 1: Get products from same brand (if current products have brands)
    const currentBrands = [...new Set(currentProducts.map(p => p.brand).filter(Boolean))];
    if (currentBrands.length > 0) {
      const sameBrandProducts = allProducts
        .filter(p => 
          !currentProductIds.has(p.id) && 
          currentBrands.includes(p.brand) &&
          p.minQty > 0 // Only in-stock items
        )
        .slice(0, maxItems);
      recommendations.push(...sameBrandProducts);
    }

    // Strategy 2: Get products from same category
    const currentCategories = [...new Set(currentProducts.map(p => p.category).filter(Boolean))];
    if (recommendations.length < maxItems && currentCategories.length > 0) {
      const sameCategoryProducts = allProducts
        .filter(p => 
          !currentProductIds.has(p.id) &&
          !recommendations.some(r => r.id === p.id) &&
          currentCategories.includes(p.category || '') &&
          p.minQty > 0
        )
        .slice(0, maxItems - recommendations.length);
      recommendations.push(...sameCategoryProducts);
    }

    // Strategy 3: Get popular/featured products (by price or grade)
    if (recommendations.length < maxItems) {
      const popularProducts = allProducts
        .filter(p => 
          !currentProductIds.has(p.id) &&
          !recommendations.some(r => r.id === p.id) &&
          p.minQty > 0
        )
        .sort((a, b) => {
          // Prioritize "New" grade, then by price (lower first)
          if (a.grade === 'New' && b.grade !== 'New') return -1;
          if (b.grade === 'New' && a.grade !== 'New') return 1;
          return (a.price || 0) - (b.price || 0);
        })
        .slice(0, maxItems - recommendations.length);
      recommendations.push(...popularProducts);
    }

    setRecommendedProducts(recommendations.slice(0, maxItems));
  }, [currentProducts, allProducts, maxItems]);

  // Load images for recommended products
  useEffect(() => {
    const loadImages = async () => {
      for (const product of recommendedProducts) {
        try {
          setImageLoading(prev => ({ ...prev, [product.id]: true }));
          const imageUrl = await getProductImage(product.name, product.brand);
          setProductImages(prev => ({ ...prev, [product.id]: imageUrl }));
        } catch (error) {
          console.error(`Error loading image for ${product.name}:`, error);
        } finally {
          setImageLoading(prev => ({ ...prev, [product.id]: false }));
        }
      }
    };

    if (recommendedProducts.length > 0) {
      loadImages();
    }
  }, [recommendedProducts, getProductImage]);

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-5 sticky top-24">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
          Recommended For You
        </h3>
        <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 sidebar-scroll">
          {recommendedProducts.map((product) => {
            const imageUrl = productImages[product.id];
            const isLoading = imageLoading[product.id];

            return (
              <div
                key={product.id}
                onClick={() => router.push(`/products/${product.id}`)}
                className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md"
              >
                {/* Product Image - Larger */}
                <div className="w-24 h-24 xl:w-28 xl:h-28 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  ) : imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1280px) 96px, 112px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {product.brand}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    {product.minQty > 0 ? (
                      <span className="text-xs px-2.5 py-1 bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-300 rounded-full font-medium">
                        In Stock
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 bg-error-100 dark:bg-error-900/30 text-error-800 dark:text-error-300 rounded-full font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => router.push('/products')}
            className="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-center"
          >
            View All Products →
          </button>
        </div>
      </div>
    </div>
  );
}

