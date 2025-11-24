'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  name: string;
  icon: string;
  href?: string;
  subcategories?: string[];
}

const categories: Category[] = [
  { name: 'Mobile Phones', icon: '📱', subcategories: ['Apple iPhone', 'Samsung', 'Google Pixel', 'LG', 'Other Android'] },
  { name: 'Computers', icon: '💻', subcategories: ['Apple', 'Microsoft Surface', 'Windows Laptop', 'Chromebook', 'Gaming'] },
  { name: 'Tablets', icon: '📱', subcategories: ['Apple iPad', 'Samsung Tablets'] },
  { name: 'Accessories', icon: '🎧', subcategories: ['Headsets', 'Speakers', 'Watches', 'Gaming Consoles'] },
];

export default function CategoryNavigation() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const router = useRouter();

  const handleCategoryClick = (category: Category) => {
    if (category.href) {
      router.push(category.href);
    } else {
      // Filter by category name - navigate to products page
      const params = new URLSearchParams({ category: category.name });
      router.push(`/products?${params.toString()}`);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            {categories.map((category) => (
              <div
                key={category.name}
                className="relative"
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <button
                  onClick={() => handleCategoryClick(category)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <span className="text-xl">{category.icon}</span>
                  <span>{category.name}</span>
                  {category.subcategories && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>

                {/* Dropdown Menu */}
                {hoveredCategory === category.name && category.subcategories && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 py-2">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory}
                        onClick={() => {
                          const params = new URLSearchParams({ brand: subcategory });
                          router.push(`/products?${params.toString()}`);
                          setHoveredCategory(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {subcategory}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

