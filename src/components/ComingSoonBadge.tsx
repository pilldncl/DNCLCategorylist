'use client';

import React from 'react';

interface ComingSoonBadgeProps {
  feature: string;
  className?: string;
}

export default function ComingSoonBadge({ feature, className = '' }: ComingSoonBadgeProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 animate-pulse rounded-lg"></div>
      <div className="relative bg-white dark:bg-gray-800 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg p-6 text-center">
        <div className="mb-3">
          <svg className="w-12 h-12 mx-auto text-blue-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Coming Soon</p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          In Development
        </div>
      </div>
    </div>
  );
}

