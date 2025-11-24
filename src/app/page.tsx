'use client';

import React, { Suspense } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import HomePageContent from './home-page-content';

export default function HomePage() {
  return (
    <>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      }>
        <HomePageContent />
      </Suspense>
      <ThemeToggle />
    </>
  );
}
