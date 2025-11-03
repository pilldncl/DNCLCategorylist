'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { CatalogItem } from '@/types/catalog';
import { useDynamicImages } from '@/hooks/useDynamicImages';

interface ProductCardProps {
  item: CatalogItem;
  onImageClick?: (item: CatalogItem) => void;
  onInquiry?: (type: 'email' | 'whatsapp', item: CatalogItem) => void;
}

export default function ProductCard({ item, onImageClick, onInquiry }: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { getProductImage } = useDynamicImages();
  const [imageUrl, setImageUrl] = useState<string>('');

  // Load image on mount
  React.useEffect(() => {
    const loadImage = async () => {
      try {
        const img = await getProductImage(item.name, item.brand);
        setImageUrl(img);
        setImageError(false);
      } catch (error) {
        setImageError(true);
      } finally {
        setImageLoading(false);
      }
    };
    loadImage();
  }, [item.name, item.brand, getProductImage]);

  const getStockStatus = (minQty: number) => {
    if (minQty < 1) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
    if (minQty < 20) return { text: 'Limited Stock', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (minQty >= 20 && minQty <= 74) return { text: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' };
    return { text: 'Available', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  const getGradeBadges = (grade: string) => {
    if (!grade) return [];
    const tags = grade.split(/[\/\\]/).filter(tag => tag.trim() !== '');
    
    return tags.slice(0, 2).map((tag, index) => {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes('new') || tagLower.includes('a')) {
        return { text: tag, color: 'bg-green-500 text-white' };
      } else if (tagLower.includes('b')) {
        return { text: tag, color: 'bg-blue-500 text-white' };
      } else if (tagLower.includes('c')) {
        return { text: tag, color: 'bg-yellow-500 text-white' };
      } else if (tagLower.includes('d') || tagLower.includes('used')) {
        return { text: tag, color: 'bg-gray-500 text-white' };
      }
      return { text: tag, color: 'bg-gray-400 text-white' };
    });
  };

  const stockStatus = getStockStatus(item.minQty);
  const gradeBadges = getGradeBadges(item.grade);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Image Container */}
      <div 
        className="relative w-full aspect-square bg-gray-100 overflow-hidden cursor-pointer"
        onClick={() => onImageClick?.(item)}
      >
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {!imageError && imageUrl && (
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onLoad={() => setImageLoading(false)}
            onError={() => setImageError(true)}
          />
        )}
        
        {imageError && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Quick View Badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Quick View
          </span>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${stockStatus.color}`}>
            {stockStatus.text}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 truncate">
          {item.brand}
        </div>
        
        {/* Product Name */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {item.name}
        </h3>

        {/* Grade Badges */}
        {gradeBadges.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {gradeBadges.map((badge, index) => (
              <span
                key={index}
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`}
              >
                {badge.text}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        {item.price !== undefined && item.price > 0 && (
          <div className="mb-3">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              ${item.price.toFixed(2)}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onInquiry?.('email', item)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </button>
          
          <button
            onClick={() => onInquiry?.('whatsapp', item)}
            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

