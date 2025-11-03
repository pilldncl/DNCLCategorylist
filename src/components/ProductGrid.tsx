'use client';

import React from 'react';
import { CatalogItem } from '@/types/catalog';
import ProductCard from './ProductCard';

interface ProductGridProps {
  items: CatalogItem[];
  onImageClick?: (item: CatalogItem) => void;
  onInquiry?: (type: 'email' | 'whatsapp', item: CatalogItem) => void;
  className?: string;
}

export default function ProductGrid({ 
  items, 
  onImageClick, 
  onInquiry,
  className = '' 
}: ProductGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ${className}`}>
      {items.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          onImageClick={onImageClick}
          onInquiry={onInquiry}
        />
      ))}
    </div>
  );
}

