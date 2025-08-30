import React from 'react';
import Image from 'next/image';
import { useLazyImage, useProgressiveImage } from '@/hooks/useLazyLoad';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'empty',
  blurDataURL,
  onClick,
  onLoad,
  onError
}) => {
  // Generate placeholder URL if not provided
  const placeholderUrl = blurDataURL || `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">
        Loading...
      </text>
    </svg>
  `)}`;

  // Use progressive loading for non-priority images
  if (!priority) {
    const { ref, currentSrc, isFullLoaded, isVisible } = useProgressiveImage(
      placeholderUrl,
      src,
      { threshold: 0.1, rootMargin: '100px' }
    );

    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`relative overflow-hidden ${className}`}
        style={{ width, height }}
        onClick={onClick}
      >
        {isVisible && (
          <Image
            src={currentSrc}
            alt={alt}
            width={width}
            height={height}
            className={`transition-opacity duration-300 ${
              isFullLoaded ? 'opacity-100' : 'opacity-70'
            }`}
            sizes={sizes}
            onLoad={onLoad}
            onError={onError}
            style={{ objectFit: 'cover' }}
          />
        )}
        {!isVisible && (
          <div 
            className="bg-gray-200 animate-pulse flex items-center justify-center"
            style={{ width, height }}
          >
            <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    );
  }

  // Use regular Next.js Image for priority images (above the fold)
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onClick={onClick}
      onLoad={onLoad}
      onError={onError}
      style={{ objectFit: 'cover' }}
    />
  );
};

// Specialized component for product images
interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = '',
  onClick,
  priority = false
}) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={300}
      height={300}
      className={`w-full h-48 object-cover rounded-t-lg ${className}`}
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      onClick={onClick}
    />
  );
};

// Component for thumbnail images
interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
  src,
  alt,
  className = '',
  onClick
}) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={80}
      height={80}
      className={`w-16 h-16 object-cover rounded-md ${className}`}
      priority={false}
      sizes="64px"
      onClick={onClick}
    />
  );
};

// Component for modal/full-size images
interface FullSizeImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const FullSizeImage: React.FC<FullSizeImageProps> = ({
  src,
  alt,
  className = '',
  onClick
}) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={600}
      height={600}
      className={`max-w-full max-h-full object-contain ${className}`}
      priority={true}
      sizes="(max-width: 768px) 100vw, 600px"
      onClick={onClick}
    />
  );
};
