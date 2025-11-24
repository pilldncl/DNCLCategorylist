'use client';

import React from 'react';

export default function DealsBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-8 sm:py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
            BEST PRICE GUARANTEED
          </h2>
          <p className="text-xl sm:text-2xl mb-6 text-blue-100">
            Shop the latest tech at unbeatable prices
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl text-lg"
            >
              Shop Now
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-blue-600 transition-all flex items-center justify-center gap-2 text-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Limited Time Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

