'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  linkText?: string;
  isActive: boolean;
  displayOrder: number;
}

interface BannerCarouselProps {
  banners?: Banner[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export default function BannerCarousel({ 
  banners = [], 
  autoPlay = true, 
  autoPlayInterval = 5000,
  className = '' 
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { trackProductView } = useAnalyticsTracking();
  const [isClient, setIsClient] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter active banners and sort by displayOrder
  const activeBanners = banners.filter(b => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || activeBanners.length <= 1 || isPaused || !isClient) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeBanners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, activeBanners.length, isPaused, isClient]);

  // Don't render if no active banners
  if (!isClient || activeBanners.length === 0) {
    return null;
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + activeBanners.length) % activeBanners.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % activeBanners.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const handleBannerClick = async (banner: Banner) => {
    if (banner.linkUrl) {
      // Track banner click if it's an external link
      if (banner.linkUrl.startsWith('http')) {
        await trackProductView(banner.id, 'banner');
      }
      window.open(banner.linkUrl, banner.linkUrl.startsWith('http') ? '_blank' : '_self');
    }
  };

  const currentBanner = activeBanners[currentIndex];

  return (
    <div 
      className={`relative w-full rounded-lg overflow-hidden shadow-lg ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Image */}
      <div className="relative w-full aspect-[16/6] md:aspect-[16/5] bg-gradient-to-r from-blue-600 to-purple-600">
        {currentBanner && (
          <>
            <Image
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              fill
              className="object-cover"
              priority={currentIndex === 0}
              sizes="100vw"
              onError={(e) => {
                // Fallback to gradient background if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            
            {/* Banner Content - Button Only */}
            {currentBanner.linkUrl && currentBanner.linkText && (
              <div className="absolute inset-0 flex items-end justify-start px-4 md:px-12 lg:px-16 pb-4 md:pb-6">
                <button
                  onClick={() => handleBannerClick(currentBanner)}
                  className="px-6 py-3 md:px-8 md:py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {currentBanner.linkText}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 md:p-3 transition-all duration-200 hover:scale-110 z-10"
            aria-label="Previous banner"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 md:p-3 transition-all duration-200 hover:scale-110 z-10"
            aria-label="Next banner"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicators */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 md:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 md:w-12 bg-white' 
                  : 'w-2 md:w-3 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

