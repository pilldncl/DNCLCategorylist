'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  onShopClick?: () => void;
}

export default function HeroSection({ onShopClick }: HeroSectionProps) {
  const router = useRouter();

  return (
    <div className="relative bg-gradient-to-r from-primary-600 via-indigo-600 to-accent-600 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3">
            Discover Amazing Products
          </h1>
          <p className="text-lg sm:text-xl mb-6 text-primary-100">
            Best prices, quality products, fast shipping
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                if (onShopClick) {
                  onShopClick();
                } else {
                  router.push('/products');
                }
              }}
              className="px-8 py-4 bg-white text-primary-600 font-bold rounded-lg hover:bg-primary-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Shop Now
            </button>
            <button
              onClick={() => router.push('/checkout')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-primary-600 transition-all"
            >
              View Cart
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-accent-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
}

