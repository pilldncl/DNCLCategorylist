'use client';

import React, { useState } from 'react';
import { CatalogFilters } from '@/types/catalog';

interface AdvancedFiltersProps {
  filters: CatalogFilters;
  onFilterChange: (key: keyof CatalogFilters, value: string | number | undefined) => void;
  onClearFilters: () => void;
  brands: string[];
  grades: string[];
  categories?: string[];
  priceRange?: { min: number; max: number };
  onPriceRangeChange?: (min: number, max: number) => void;
}

export default function AdvancedFilters({
  filters,
  onFilterChange,
  onClearFilters,
  brands,
  grades,
  categories = [],
  priceRange,
  onPriceRangeChange
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState({
    min: priceRange?.min || 0,
    max: priceRange?.max || 10000
  });

  const activeFiltersCount = [
    filters.brand,
    filters.grade,
    filters.search,
    priceRange && (priceRange.min > 0 || priceRange.max < 10000)
  ].filter(Boolean).length;

  const handlePriceRangeApply = () => {
    if (onPriceRangeChange) {
      onPriceRangeChange(localPriceRange.min, localPriceRange.max);
    }
  };

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="font-medium">Filters</span>
        {activeFiltersCount > 0 && (
          <span className="bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute lg:relative top-full left-0 mt-2 lg:mt-0 w-full lg:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Price Range */}
              {onPriceRangeChange && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={localPriceRange.min || ''}
                        onChange={(e) => setLocalPriceRange({ ...localPriceRange, min: parseFloat(e.target.value) || 0 })}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={localPriceRange.max || ''}
                        onChange={(e) => setLocalPriceRange({ ...localPriceRange, max: parseFloat(e.target.value) || 10000 })}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={handlePriceRangeApply}
                      className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
                    >
                      Apply Price Range
                    </button>
                  </div>
                </div>
              )}

              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brand
                </label>
                <select
                  value={filters.brand || ''}
                  onChange={(e) => onFilterChange('brand', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Grade Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grade
                </label>
                <select
                  value={filters.grade || ''}
                  onChange={(e) => onFilterChange('grade', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Grades</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter (if available) */}
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => onFilterChange('category', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active Filters ({activeFiltersCount})
                    </span>
                    <button
                      onClick={onClearFilters}
                      className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filters.brand && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm">
                        Brand: {filters.brand}
                        <button
                          onClick={() => onFilterChange('brand', undefined)}
                          className="hover:text-primary-600"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.grade && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm">
                        Grade: {filters.grade}
                        <button
                          onClick={() => onFilterChange('grade', undefined)}
                          className="hover:text-primary-600"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

