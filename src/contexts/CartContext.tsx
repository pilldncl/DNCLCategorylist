'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Cart } from '@/types/cart';
import { CatalogItem } from '@/types/catalog';

interface CartContextType {
  cart: Cart;
  addToCart: (product: CatalogItem, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getCartItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'retail-cart';

function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.product.price || 0) * item.quantity;
  }, 0);
}

function calculateItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    total: 0,
    itemCount: 0
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsedCart = JSON.parse(stored);
        setCart({
          items: parsedCart.items || [],
          total: calculateCartTotal(parsedCart.items || []),
          itemCount: calculateItemCount(parsedCart.items || [])
        });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = useCallback((product: CatalogItem, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.product.id === product.id
      );

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...prevCart.items, { product, quantity }];
      }

      return {
        items: newItems,
        total: calculateCartTotal(newItems),
        itemCount: calculateItemCount(newItems)
      };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.product.id !== productId);
      return {
        items: newItems,
        total: calculateCartTotal(newItems),
        itemCount: calculateItemCount(newItems)
      };
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      return {
        items: newItems,
        total: calculateCartTotal(newItems),
        itemCount: calculateItemCount(newItems)
      };
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0
    });
  }, []);

  const isInCart = useCallback((productId: string): boolean => {
    return cart.items.some((item) => item.product.id === productId);
  }, [cart.items]);

  const getCartItemQuantity = useCallback((productId: string): number => {
    const item = cart.items.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  }, [cart.items]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getCartItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

