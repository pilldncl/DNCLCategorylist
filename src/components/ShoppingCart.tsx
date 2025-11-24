'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDynamicImages } from '@/hooks/useDynamicImages';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const router = useRouter();
  const { getProductImage } = useDynamicImages();
  const [imageCache, setImageCache] = React.useState<Record<string, string>>({});

  // Load images for cart items
  React.useEffect(() => {
    if (isOpen) {
      cart.items.forEach(async (item) => {
        const cacheKey = `${item.product.id}`;
        if (!imageCache[cacheKey]) {
          try {
            const imageUrl = await getProductImage(item.product.name, item.product.brand);
            setImageCache((prev) => ({ ...prev, [cacheKey]: imageUrl }));
          } catch (error) {
            console.error('Error loading cart item image:', error);
          }
        }
      });
    }
  }, [isOpen, cart.items, getProductImage, imageCache]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Shopping Cart ({cart.itemCount})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => {
                const imageUrl = imageCache[item.product.id] || '/placeholder.png';
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded">
                      {imageUrl && imageUrl !== '/placeholder.png' ? (
                        <Image
                          src={imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.product.brand}</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                        ${(item.product.price || 0).toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-700 self-start"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ${cart.total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm py-2"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}

