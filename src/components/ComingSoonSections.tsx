'use client';

import React from 'react';
import { CatalogItem } from '@/types/catalog';
import { useDynamicImages } from '@/hooks/useDynamicImages';
import Image from 'next/image';

// Staging data for customer reviews
const stagingReviews = [
  {
    id: 1,
    customerName: 'Sarah M.',
    rating: 5,
    date: '2 days ago',
    product: 'iPhone 15 Pro Max',
    review: 'Excellent condition! The phone looks brand new and works perfectly. Fast shipping and great packaging. Highly recommend!',
    verified: true,
  },
  {
    id: 2,
    customerName: 'James K.',
    rating: 5,
    date: '1 week ago',
    product: 'Samsung Galaxy S24 Ultra',
    review: 'Amazing deal for a premium device. The grade A condition is spot on - no scratches or issues. Customer service was responsive too.',
    verified: true,
  },
  {
    id: 3,
    customerName: 'Maria L.',
    rating: 4,
    date: '2 weeks ago',
    product: 'Google Pixel 8 Pro',
    review: 'Great phone at a reasonable price. Minor wear on the back but screen is perfect. Would buy again!',
    verified: true,
  },
  {
    id: 4,
    customerName: 'David R.',
    rating: 5,
    date: '3 weeks ago',
    product: 'OnePlus 12',
    review: 'Outstanding quality and value. The device exceeded my expectations. Quick delivery and excellent communication throughout.',
    verified: true,
  },
];


export function ReviewsComingSoon() {
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Customer Reviews
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            See what our customers are saying
          </p>
        </div>

        {/* Staging Reviews Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stagingReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {review.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {review.customerName}
                      </span>
                      {review.verified && (
                        <span className="text-primary-600 dark:text-primary-400" title="Verified Purchase">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{review.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">{review.product}</span>
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {review.review}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

interface RecommendationsComingSoonProps {
  featuredProducts?: CatalogItem[];
}

const recommendationReasons = [
  'Similar to your recent views',
  'Popular in your area',
  'Best value for money',
  'Trending now',
  'Recommended for you',
  'Top seller',
];

export function RecommendationsComingSoon({ featuredProducts = [] }: RecommendationsComingSoonProps) {
  const { getProductImage } = useDynamicImages();
  const [productImages, setProductImages] = React.useState<Record<string, string>>({});
  const [imageLoading, setImageLoading] = React.useState<Record<string, boolean>>({});

  // Load images for recommended products
  React.useEffect(() => {
    const loadImages = async () => {
      for (const product of featuredProducts.slice(0, 4)) {
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

    if (featuredProducts.length > 0) {
      loadImages();
    }
  }, [featuredProducts, getProductImage]);

  // Use featured products or fallback to empty
  const recommendations = featuredProducts.slice(0, 4);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Recommended For You
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Products you might like
          </p>
        </div>

        {/* Recommendations Display - Modal Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((product, index) => {
            const imageUrl = productImages[product.id];
            const isLoading = imageLoading[product.id];
            const reason = recommendationReasons[index % recommendationReasons.length];

            return (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Recommendation Badge */}
                <div className="mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                    {reason}
                  </span>
                </div>

                {/* Product Image */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden relative">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {product.brand}
                  </p>
                  {product.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 mb-3">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-center pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={() => {
                      // Navigate to product or open quick view
                      window.location.href = `/products/${product.id}`;
                    }}
                    className="w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// This is now replaced by LiveChat component, but keeping for backward compatibility
export function LiveChatComingSoon() {
  return null;
}

