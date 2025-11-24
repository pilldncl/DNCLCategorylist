# Quick Start: Top 3 UX Features (1 Week, $0)

## 🎯 Goal
Implement the 3 highest-impact UX features that modern retail sites have, with zero cost and minimal effort.

---

## Feature 1: Search Autocomplete (2-3 days)

### What It Does
- Shows search suggestions as you type
- Recent searches
- Popular searches
- Keyboard navigation

### Implementation Steps

#### 1. Create Search API Endpoint
```typescript
// src/app/api/search/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  
  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  // Search products
  const { data } = await supabaseAdmin
    .from('catalog_items')
    .select('id, name, brand')
    .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
    .limit(5);

  return NextResponse.json({ 
    suggestions: data || [] 
  });
}
```

#### 2. Create Autocomplete Component
```typescript
// src/components/SearchAutocomplete.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
}

export default function SearchAutocomplete({
  value,
  onChange,
  onSearch
}: SearchAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(value)}`);
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleSelect = (suggestion: any) => {
    onChange(suggestion.name);
    setShowSuggestions(false);
    onSearch(suggestion.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Search products..."
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSelect(suggestion)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-medium text-gray-900">{suggestion.name}</div>
              <div className="text-sm text-gray-500">{suggestion.brand}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 3. Integrate into Homepage
```typescript
// In src/app/page.tsx, replace the search input with:
<SearchAutocomplete
  value={filters.search || ''}
  onChange={(value) => handleFilterChange('search', value)}
  onSearch={(query) => handleFilterChange('search', query)}
/>
```

---

## Feature 2: Quick View Modal (1-2 days)

### What It Does
- Click product card → opens modal with product details
- Add to cart from modal
- No page navigation needed

### Implementation Steps

#### 1. Create QuickView Component
```typescript
// src/components/QuickViewModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CatalogItem } from '@/types/catalog';
import { useDynamicImages } from '@/hooks/useDynamicImages';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

interface QuickViewModalProps {
  product: CatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose
}: QuickViewModalProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { getProductImage } = useDynamicImages();
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (product && isOpen) {
      getProductImage(product.name, product.brand).then(setImageUrl);
      setQuantity(1);
    }
  }, [product, isOpen, getProductImage]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleAddToCart = async () => {
    setAddingToCart(true);
    addToCart(product, quantity);
    setTimeout(() => {
      setAddingToCart(false);
      onClose();
    }, 500);
  };

  const handleViewFullDetails = () => {
    onClose();
    router.push(`/products/${product.id}`);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {product.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{product.brand}</p>
              </div>

              {product.price > 0 && (
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ${product.price.toFixed(2)}
                </div>
              )}

              {product.description && (
                <p className="text-gray-700 dark:text-gray-300">
                  {product.description}
                </p>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-0"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.minQty <= 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleViewFullDetails}
                  className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

#### 2. Add to ProductCard
```typescript
// In src/components/ProductCard.tsx
const [quickViewOpen, setQuickViewOpen] = useState(false);

// Add onClick to card:
onClick={() => setQuickViewOpen(true)}

// Add modal:
<QuickViewModal
  product={item}
  isOpen={quickViewOpen}
  onClose={() => setQuickViewOpen(false)}
/>
```

---

## Feature 3: Wishlist (2-3 days)

### What It Does
- Heart icon on products
- Save products for later
- Wishlist page
- Move to cart

### Implementation Steps

#### 1. Create Wishlist Context
```typescript
// src/contexts/WishlistContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CatalogItem } from '@/types/catalog';

interface WishlistContextType {
  wishlist: CatalogItem[];
  addToWishlist: (product: CatalogItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const WISHLIST_STORAGE_KEY = 'retail-wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<CatalogItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      setWishlist(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product: CatalogItem) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}
```

#### 2. Add to Layout
```typescript
// In src/app/layout.tsx
import { WishlistProvider } from '@/contexts/WishlistContext';

// Wrap with WishlistProvider:
<CartProvider>
  <WishlistProvider>
    {children}
  </WishlistProvider>
</CartProvider>
```

#### 3. Add Heart Icon to ProductCard
```typescript
// In src/components/ProductCard.tsx
import { useWishlist } from '@/contexts/WishlistContext';

const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

// Add heart button:
<button
  onClick={(e) => {
    e.stopPropagation();
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  }}
  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
>
  <svg
    className={`w-5 h-5 ${
      isInWishlist(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
    }`}
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
</button>
```

#### 4. Create Wishlist Page
```typescript
// src/app/wishlist/page.tsx
'use client';

import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import ProductGrid from '@/components/ProductGrid';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          {wishlist.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Your wishlist is empty</p>
          </div>
        ) : (
          <ProductGrid
            items={wishlist}
            onInquiry={() => {}}
          />
        )}
      </div>
    </div>
  );
}
```

---

## 🎉 Summary

**Time Investment:** ~1 week  
**Cost:** $0  
**Impact:** Massive UX improvement  
**Difficulty:** Medium

These 3 features will make your shop feel like a modern retail site!

