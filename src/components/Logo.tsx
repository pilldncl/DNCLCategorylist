'use client';

import Image from 'next/image';
import { useState } from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function Logo({ 
  className = '', 
  width = 80, 
  height = 80, 
  priority = false 
}: LogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    // Fallback to text-based logo
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm">D</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-wider">
          DNCL-TECHZONE
        </h1>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/dncl-logo.png"
        alt="DNCL-TECHZONE Logo"
        width={width}
        height={height}
        className="h-auto w-auto object-contain"
        priority={priority}
        quality={95}
        onError={() => setImageError(true)}
        onLoad={(e) => {
          // Ensure the image is properly sized
          const img = e.target as HTMLImageElement;
          img.style.height = 'auto';
          img.style.width = 'auto';
        }}
      />
    </div>
  );
}
