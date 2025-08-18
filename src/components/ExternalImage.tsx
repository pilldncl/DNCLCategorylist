'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ExternalImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallbackSrc?: string;
}

export default function ExternalImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
}: ExternalImageProps) {
  const [useFallback, setUseFallback] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    if (!imageError) {
      setImageError(true);
      setUseFallback(true);
    }
  };

  const imageSrc = useFallback ? fallbackSrc : src;

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className={className}
        unoptimized={true}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized={true}
      onError={handleError}
    />
  );
}
