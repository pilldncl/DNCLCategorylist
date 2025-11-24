'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CatalogItem } from '@/types/catalog';
import { useDynamicImages } from '@/hooks/useDynamicImages';
import { useCart } from '@/contexts/CartContext';
import Logo from '@/components/Logo';
import { CONTACT_CONFIG } from '@/config/contact';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const { getProductImage, getAllProductImages } = useDynamicImages();
  const { addToCart, isInCart, getCartItemQuantity } = useCart();
  
  const [images, setImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/catalog?limit=1000`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        const foundProduct = data.items.find((item: CatalogItem) => item.id === productId);
        
        if (!foundProduct) {
          setError('Product not found');
          return;
        }
        
        setProduct(foundProduct);
        
        // Load images
        const allImages = await getAllProductImages(foundProduct.name, foundProduct.brand);
        setImages(allImages);
        if (allImages.length > 0) {
          setMainImage(allImages[0]);
        } else {
          const singleImage = await getProductImage(foundProduct.name, foundProduct.brand);
          if (singleImage) {
            setMainImage(singleImage);
            setImages([singleImage]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, getProductImage, getAllProductImages]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    addToCart(product, quantity);
    setTimeout(() => setAddingToCart(false), 500);
  };

  const getStockStatus = (minQty: number) => {
    if (minQty < 1) return { text: 'OUT OF STOCK', color: 'bg-red-500 text-white' };
    if (minQty < 20) return { text: 'LIMITED STOCK', color: 'bg-orange-500 text-white' };
    if (minQty >= 20 && minQty <= 74) return { text: 'IN STOCK', color: 'bg-green-500 text-white' };
    return { text: 'AVAILABLE', color: 'bg-primary-500 text-white' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.minQty);
  const cartQuantity = getCartItemQuantity(product.id);
  const inCart = isInCart(product.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo className="h-10" width={160} height={160} priority={true} />
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
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
                      setMainImage(img);
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

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Stock Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {product.brand}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${stockStatus.color}`}>
                {stockStatus.text}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {product.name}
            </h1>

            {/* Price */}
            {product.price !== undefined && product.price > 0 && (
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${product.price.toFixed(2)}
                </span>
                {product.minQty > 1 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    (Min. Qty: {product.minQty})
                  </span>
                )}
              </div>
            )}

            {/* Grade Badges */}
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

            {/* Description */}
            {product.description && (
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {product.minQty > 0 ? (
                <>
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</label>
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

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
                      inCart
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {addingToCart ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding to Cart...
                      </span>
                    ) : inCart ? (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {cartQuantity > 0 ? `${cartQuantity} in Cart - Add More` : 'In Cart'}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add to Cart
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-300 font-medium">This product is currently out of stock.</p>
                </div>
              )}

              {/* Contact Options */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    const subject = `Inquiry about ${product.name}`;
                    const body = `Hi! I'm interested in ${product.name} (${product.brand}).\n\nProduct Details:\n- Grade: ${product.grade}\n- Price: $${product.price}\n\nCan you provide more information?`;
                    window.open(`mailto:${CONTACT_CONFIG.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Inquiry
                </button>
                <button
                  onClick={() => {
                    const formattedPhone = CONTACT_CONFIG.whatsapp.phoneNumber.replace(/\D/g, '');
                    const message = `Hi! I'm interested in ${product.name} (${product.brand}).\n\nProduct Details:\n- Grade: ${product.grade}\n- Price: $${product.price}\n\nCan you provide more information?`;
                    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

