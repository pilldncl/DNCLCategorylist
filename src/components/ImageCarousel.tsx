'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
  images: string[];
  productName: string;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onClick?: () => void;
  showIndicators?: boolean;
  showCounter?: boolean;
  showArrows?: boolean;
}

export default function ImageCarousel({ 
  images, 
  productName, 
  className = '', 
  autoPlay = false, // Changed default to false
  autoPlayInterval = 3000,
  onClick,
  showIndicators = true,
  showCounter = true,
  showArrows = true
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  // Auto-play functionality - only if explicitly enabled
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length, autoPlayInterval]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(autoPlay);

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToImage = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(index);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  // If only one image, render simple image
  if (images.length <= 1) {
    return (
      <div className={`relative ${className} ${onClick ? 'cursor-pointer' : ''}`}>
        <div className="w-full h-full aspect-square overflow-hidden rounded-lg border border-gray-200">
                      <Image
              src={images[0] || '/dncl-logo.png'}
              alt={`${productName} - Image`}
              width={80}
              height={80}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-125 hover:shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/dncl-logo.png';
            }}
            onClick={handleImageClick}
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative group ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Image Container - Fixed aspect ratio */}
      <div className="relative w-full h-full aspect-square overflow-hidden rounded-lg border border-gray-200">
        <Image
          src={images[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          width={80}
          height={80}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-125 group-hover:shadow-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/dncl-logo.png';
          }}
          onClick={handleImageClick}
        />
        
        {/* Navigation Arrows - Only show if showArrows is true and image is large enough */}
        {showArrows && images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              aria-label="Previous image"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              aria-label="Next image"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Image Indicators - Only show if showIndicators is true */}
      {showIndicators && images.length > 1 && (
        <div className="flex justify-center mt-1 space-x-0.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => goToImage(index, e)}
              className={`w-1 h-1 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-blue-600 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter - Only show if showCounter is true */}
      {showCounter && images.length > 1 && (
        <div className="absolute bottom-1.5 right-1.5 flex space-x-0.5 z-10 pointer-events-none">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white shadow-sm scale-125' 
                  : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator - Only show if auto-play is actually enabled */}
      {isAutoPlaying && autoPlay && images.length > 1 && (
        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded animate-pulse z-10 pointer-events-none">
          Auto
        </div>
      )}
    </div>
  );
}
