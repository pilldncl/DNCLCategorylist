'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';

interface CartIconProps {
  onClick: () => void;
}

export default function CartIcon({ onClick }: CartIconProps) {
  const { cart } = useCart();

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      aria-label="Shopping cart"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {cart.itemCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {cart.itemCount > 99 ? '99+' : cart.itemCount}
        </span>
      )}
    </button>
  );
}

