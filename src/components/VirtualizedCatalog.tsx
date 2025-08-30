import React, { useState, useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { CatalogItem } from '@/types/catalog';
import { ProductImage } from './OptimizedImage';

interface VirtualizedCatalogProps {
  items: CatalogItem[];
  itemHeight?: number;
  containerHeight?: number;
  onItemClick?: (item: CatalogItem) => void;
  onImageClick?: (item: CatalogItem) => void;
  className?: string;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: CatalogItem[];
    onItemClick?: (item: CatalogItem) => void;
    onImageClick?: (item: CatalogItem) => void;
  };
}

const CatalogRow: React.FC<RowProps> = ({ index, style, data }) => {
  const { items, onItemClick, onImageClick } = data;
  const item = items[index];

  if (!item) return null;

  const getStockStatus = (minQty: number) => {
    if (minQty < 1) {
      return { text: 'OUT OF STOCK', color: 'text-white bg-gradient-to-r from-red-500 to-red-600' };
    } else if (minQty < 20) {
      return { text: 'LIMITED STOCK', color: 'text-white bg-gradient-to-r from-orange-500 to-orange-600' };
    } else if (minQty >= 20 && minQty <= 74) {
      return { text: 'IN STOCK', color: 'text-white bg-gradient-to-r from-green-500 to-green-600' };
    } else {
      return { text: 'AVAILABLE', color: 'text-white bg-gradient-to-r from-blue-500 to-blue-600' };
    }
  };

  const getGradeTags = (grade: string) => {
    if (!grade) return [];
    
    const tags = grade.split(/[\/\\]/).filter(tag => tag.trim() !== '');
    
    return tags.map(tag => {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes('a') || tagLower.includes('excellent')) {
        return { text: tag, color: 'text-white bg-gradient-to-r from-green-500 to-green-600' };
      } else if (tagLower.includes('b') || tagLower.includes('good')) {
        return { text: tag, color: 'text-white bg-gradient-to-r from-blue-500 to-blue-600' };
      } else if (tagLower.includes('c') || tagLower.includes('fair')) {
        return { text: tag, color: 'text-white bg-gradient-to-r from-yellow-500 to-yellow-600' };
      } else if (tagLower.includes('d') || tagLower.includes('poor')) {
        return { text: tag, color: 'text-white bg-gradient-to-r from-red-500 to-red-600' };
      } else {
        return { text: tag, color: 'text-white bg-gradient-to-r from-gray-500 to-gray-600' };
      }
    });
  };

  const stockStatus = getStockStatus(item.minQty);

  return (
    <div style={style} className="px-2">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-4">
        <div className="flex items-start space-x-4">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <ProductImage
              src={item.image || ''}
              alt={item.name}
              className="w-20 h-20 rounded-lg"
              onClick={() => onImageClick?.(item)}
            />
          </div>
          
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                  onClick={() => onItemClick?.(item)}
                  title={item.name}
                >
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 truncate" title={item.brand}>
                  {item.brand}
                </p>
              </div>
              
              {/* Price and Stock */}
              <div className="text-right ml-2">
                <p className="text-sm font-bold text-gray-900">
                  ${item.price?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500">
                  Min: {item.minQty}
                </p>
              </div>
            </div>
            
            {/* Grade Tags */}
            {item.grade && (
              <div className="flex flex-wrap gap-1 mt-2">
                {getGradeTags(item.grade).map((tag, tagIndex) => (
                  <span 
                    key={tagIndex} 
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${tag.color}`}
                  >
                    {tag.text}
                  </span>
                ))}
              </div>
            )}
            
            {/* Stock Status */}
            <div className="mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>
            
            {/* Description */}
            {item.description && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2" title={item.description}>
                {item.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const VirtualizedCatalog: React.FC<VirtualizedCatalogProps> = ({
  items,
  itemHeight = 140,
  containerHeight = 600,
  onItemClick,
  onImageClick,
  className = ''
}) => {
  const [listRef, setListRef] = useState<List | null>(null);

  const itemData = useMemo(() => ({
    items,
    onItemClick,
    onImageClick
  }), [items, onItemClick, onImageClick]);

  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    // Optional: Add scroll tracking or infinite loading logic here
  }, []);

  const scrollToItem = useCallback((index: number) => {
    if (listRef) {
      listRef.scrollToItem(index, 'center');
    }
  }, [listRef]);

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        ref={setListRef}
        height={containerHeight}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
        onScroll={handleScroll}
        overscanCount={5} // Render 5 items outside the visible area for smooth scrolling
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {CatalogRow}
      </List>
    </div>
  );
};

// Infinite loading version for very large datasets
interface InfiniteVirtualizedCatalogProps extends VirtualizedCatalogProps {
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  loadNextPage: () => void;
}

export const InfiniteVirtualizedCatalog: React.FC<InfiniteVirtualizedCatalogProps> = ({
  items,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  ...props
}) => {
  const handleScroll = useCallback(({ scrollOffset, scrollUpdateWasRequested }: { 
    scrollOffset: number; 
    scrollUpdateWasRequested: boolean;
  }) => {
    if (!scrollUpdateWasRequested && hasNextPage && !isNextPageLoading) {
      // Load next page when user scrolls near the bottom
      const threshold = 1000; // pixels from bottom
      const maxScrollOffset = (items.length * (props.itemHeight || 140)) - (props.containerHeight || 600);
      
      if (scrollOffset > maxScrollOffset - threshold) {
        loadNextPage();
      }
    }
  }, [hasNextPage, isNextPageLoading, loadNextPage, items.length, props.itemHeight, props.containerHeight]);

  return (
    <VirtualizedCatalog
      {...props}
      items={items}
      onScroll={handleScroll}
    />
  );
};
