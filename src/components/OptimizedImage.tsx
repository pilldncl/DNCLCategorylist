'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { generateProgressiveImageUrl, ImageSize } from '@/utils/imageCDN';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  size?: ImageSize;
  onClick?: () => void;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width = 300,
  height = 300,
  className = '',
  priority = false,
  size = 'medium',
  onClick,
  fallbackSrc = '/api/placeholder'
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    // Generate progressive image URLs
    const progressiveUrls = generateProgressiveImageUrl(src);
    
    // Start with placeholder
    setCurrentSrc(progressiveUrls.placeholder);
    setIsLoading(true);
    setHasError(false);
    setIsLoaded(false);

    // Load thumbnail first using browser's native Image constructor
    const thumbnailImg = new window.Image();
    thumbnailImg.onload = () => {
      setCurrentSrc(progressiveUrls.thumbnail);
      
      // Then load full image
      const fullImg = new window.Image();
      fullImg.onload = () => {
        setCurrentSrc(progressiveUrls.full);
        setIsLoaded(true);
        setIsLoading(false);
      };
      fullImg.onerror = () => {
        setHasError(true);
        setCurrentSrc(fallbackSrc);
        setIsLoading(false);
      };
      fullImg.src = progressiveUrls.full;
    };
    thumbnailImg.onerror = () => {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      setIsLoading(false);
    };
    thumbnailImg.src = progressiveUrls.thumbnail;
  }, [src, fallbackSrc]);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      style={{ width, height }}
    >
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}

      {/* Optimized image */}
      {currentSrc && !hasError && (
        <Image
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-75'
          } ${onClick ? 'cursor-pointer hover:opacity-90' : ''}`}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setCurrentSrc(fallbackSrc);
          }}
        />
      )}

      {/* Loading indicator */}
      {isLoading && !hasError && (
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Loading...
        </div>
      )}
    </div>
  );
}

// Lazy loading image component for catalog items
export function LazyCatalogImage({
  productName,
  brand,
  width = 300,
  height = 300,
  className = '',
  onClick
}: {
  productName: string;
  brand: string;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadImage = async () => {
      try {
        // Import dynamically to avoid loading the heavy image utility on initial page load
        const { findOptimizedDeviceImage } = await import('@/utils/imageCDN');
        const url = await findOptimizedDeviceImage(productName, brand, 'medium');
        
        if (mounted) {
          setImageUrl(url);
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Delay loading to prioritize initial page render
    const timer = setTimeout(loadImage, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [productName, brand]);

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <OptimizedImage
      src={imageUrl || ''}
      alt={`${productName} - ${brand}`}
      width={width}
      height={height}
      className={className}
      onClick={onClick}
      priority={false}
      size="medium"
    />
  );
}
