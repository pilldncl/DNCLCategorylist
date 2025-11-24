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
  const { getProductImage, getAllProductImages } = useDynamicImages();
  const { addToCart, isInCart } = useCart();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (product && isOpen) {
      const loadImages = async () => {
        try {
          const allImages = await getAllProductImages(product.name, product.brand);
          if (allImages.length > 0) {
            setImages(allImages);
            setImageUrl(allImages[0]);
          } else {
            const singleImage = await getProductImage(product.name, product.brand);
            if (singleImage) {
              setImageUrl(singleImage);
              setImages([singleImage]);
            }
          }
        } catch (error) {
          console.error('Error loading images:', error);
        }
      };
      loadImages();
      setQuantity(1);
      setSelectedImageIndex(0);
    }
  }, [product, isOpen, getProductImage, getAllProductImages]);

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
    if (product.minQty <= 0) return;
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

  const stockStatus = product.minQty < 1 
    ? { text: 'OUT OF STOCK', color: 'bg-red-500 text-white' }
    : product.minQty < 20 
    ? { text: 'LIMITED STOCK', color: 'bg-orange-500 text-white' }
    : { text: 'IN STOCK', color: 'bg-green-500 text-white' };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Image Section */}
            <div className="space-y-4">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setImageUrl(img);
                        setSelectedImageIndex(index);
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index
                          ? 'border-primary-600 dark:border-primary-400'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - View ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 25vw, 12.5vw"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {product.brand}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 mb-2">
                  {product.name}
                </h2>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${stockStatus.color}`}>
                  {stockStatus.text}
                </span>
              </div>

              {product.price && product.price > 0 && (
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  ${product.price.toFixed(2)}
                </div>
              )}

              {product.description && (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              )}

              {product.grade && (
                <div className="flex flex-wrap gap-2">
                  {product.grade.split(/[\/\\]/).filter(tag => tag.trim() !== '').map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm font-medium rounded-full"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Quantity & Actions */}
              {product.minQty > 0 ? (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <label className="font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center border-0 focus:ring-0 focus:outline-none bg-transparent text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className={`flex-1 py-3 px-6 rounded-lg font-bold text-lg transition-all ${
                        isInCart(product.id)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {addingToCart ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </span>
                      ) : isInCart(product.id) ? (
                        'In Cart - Add More'
                      ) : (
                        'Add to Cart'
                      )}
                    </button>
                    <button
                      onClick={handleViewFullDetails}
                      className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-300 font-medium">This product is currently out of stock.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

