import { supabase } from '@/lib/supabase';

// CDN Configuration
const CDN_CONFIG = {
  // Supabase CDN URL (replace with your actual CDN domain)
  baseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '.supabase.co/storage/v1/object/public'),
  // Image optimization settings
  optimization: {
    quality: 80,
    format: 'webp', // Modern format for better compression
    sizes: {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 }
    }
  },
  // Cache strategies
  cache: {
    // Browser cache duration (1 week for images)
    browserCache: 'public, max-age=604800, immutable',
    // CDN cache duration (1 day)
    cdnCache: 'public, s-maxage=86400, stale-while-revalidate=3600',
    // Local cache duration (30 minutes)
    localCache: 30 * 60 * 1000
  }
};

// Image size types
export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'original';

// Optimized image URL generator
export function generateOptimizedImageUrl(
  imageUrl: string, 
  size: ImageSize = 'medium',
  format: 'webp' | 'jpg' | 'png' = 'webp'
): string {
  if (!imageUrl) return '';
  
  // If it's already a CDN URL, optimize it
  if (imageUrl.includes('supabase.co/storage')) {
    const sizeConfig = CDN_CONFIG.optimization.sizes[size];
    if (sizeConfig && size !== 'original') {
      // Add transformation parameters for CDN optimization
      return `${imageUrl}?width=${sizeConfig.width}&height=${sizeConfig.height}&format=${format}&quality=${CDN_CONFIG.optimization.quality}`;
    }
  }
  
  return imageUrl;
}

// Progressive image loading with placeholder
export function generateProgressiveImageUrl(imageUrl: string): {
  placeholder: string;
  thumbnail: string;
  full: string;
} {
  return {
    placeholder: generateOptimizedImageUrl(imageUrl, 'thumbnail', 'webp'),
    thumbnail: generateOptimizedImageUrl(imageUrl, 'small', 'webp'),
    full: generateOptimizedImageUrl(imageUrl, 'large', 'webp')
  };
}

// Intelligent image cache with LRU strategy
class ImageCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private maxSize = 100; // Maximum cached items
  private cacheDuration = CDN_CONFIG.cache.localCache;

  set(key: string, data: any): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // Check if cache is still valid
    if (Date.now() - item.timestamp > this.cacheDuration) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

// Global image cache instance
const imageCache = new ImageCache();

// Optimized device image finder with CDN
export async function findOptimizedDeviceImage(
  productName: string, 
  brand: string,
  size: ImageSize = 'medium'
): Promise<string | null> {
  const cacheKey = `${productName}-${brand}-${size}`;
  
  // Check cache first
  const cached = imageCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Parse product SKU for device matching
    const deviceInfo = parseProductSKU(productName, brand);
    if (!deviceInfo) return null;

    // Fetch from database with optimized query
    const { data, error } = await supabase
      .from('dynamic_images')
      .select('image_urls, device, model, brand')
      .eq('device', deviceInfo.device)
      .eq('brand', deviceInfo.brand)
      .eq('model', deviceInfo.model)
      .single();

    if (error || !data || !data.image_urls || data.image_urls.length === 0) {
      return null;
    }

    // Get the first image and optimize it
    const imageUrl = data.image_urls[0];
    const optimizedUrl = generateOptimizedImageUrl(imageUrl, size);
    
    // Cache the result
    imageCache.set(cacheKey, optimizedUrl);
    
    return optimizedUrl;
  } catch (error) {
    console.error('Error finding optimized device image:', error);
    return null;
  }
}

// Get all optimized images for a product
export async function getAllOptimizedProductImages(
  productName: string, 
  brand: string,
  size: ImageSize = 'medium'
): Promise<string[]> {
  const cacheKey = `all-${productName}-${brand}-${size}`;
  
  // Check cache first
  const cached = imageCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const deviceInfo = parseProductSKU(productName, brand);
    if (!deviceInfo) return [];

    const { data, error } = await supabase
      .from('dynamic_images')
      .select('image_urls')
      .eq('device', deviceInfo.device)
      .eq('brand', deviceInfo.brand)
      .eq('model', deviceInfo.model)
      .single();

    if (error || !data || !data.image_urls) {
      return [];
    }

    // Optimize all images
    const optimizedUrls = data.image_urls.map((url: string) => 
      generateOptimizedImageUrl(url, size)
    );
    
    // Cache the result
    imageCache.set(cacheKey, optimizedUrls);
    
    return optimizedUrls;
  } catch (error) {
    console.error('Error getting all optimized product images:', error);
    return [];
  }
}

// Parse product SKU for device matching (optimized version)
function parseProductSKU(productName: string, brand: string): { device: string; model: string; brand: string } | null {
  const normalizedName = productName.toUpperCase();
  const normalizedBrand = brand.toUpperCase();
  
  // Pre-compiled regex patterns for better performance
  const patterns = {
    samsungS: /^S\d+/,
    pixel: /PIXEL(\d)/,
    iphone: /IPHONE(\d+)/,
    ipad: /IPAD/,
    macbook: /MACBOOK/
  };
  
  const skuParts = normalizedName.split('-');
  
  // Samsung S-series devices
  if (patterns.samsungS.test(normalizedName)) {
    return {
      device: skuParts[0],
      model: skuParts.length > 1 ? skuParts[1] : '',
      brand: normalizedBrand
    };
  }
  
  // Google Pixel devices
  if (patterns.pixel.test(normalizedName)) {
    const match = normalizedName.match(patterns.pixel);
    return {
      device: 'PIXEL',
      model: match ? match[1] : '',
      brand: normalizedBrand
    };
  }
  
  // Apple devices
  if (patterns.iphone.test(normalizedName)) {
    const match = normalizedName.match(patterns.iphone);
    return {
      device: 'IPHONE',
      model: match ? match[1] : '',
      brand: normalizedBrand
    };
  }
  
  if (patterns.ipad.test(normalizedName)) {
    return {
      device: 'IPAD',
      model: skuParts.length > 1 ? skuParts[1] : '',
      brand: normalizedBrand
    };
  }
  
  if (patterns.macbook.test(normalizedName)) {
    return {
      device: 'MACBOOK',
      model: skuParts.length > 1 ? skuParts[1] : '',
      brand: normalizedBrand
    };
  }
  
  // Generic handling for other devices
  if (skuParts.length >= 2) {
    return {
      device: skuParts[0],
      model: skuParts[1],
      brand: normalizedBrand
    };
  }
  
  return null;
}

// Preload critical images for better performance
export async function preloadCriticalImages(products: Array<{ name: string; brand: string }>): Promise<void> {
  const criticalProducts = products.slice(0, 10); // Preload first 10 products
  
  const preloadPromises = criticalProducts.map(async (product) => {
    try {
      const imageUrl = await findOptimizedDeviceImage(product.name, product.brand, 'thumbnail');
             if (imageUrl) {
         // Create a hidden image element to preload
         const img = new window.Image();
         img.src = imageUrl;
       }
    } catch (error) {
      // Silently fail for preloading
    }
  });
  
  // Don't await - let preloading happen in background
  Promise.allSettled(preloadPromises);
}

// Clear image cache (useful for development or when images change)
export function clearImageCache(): void {
  imageCache.clear();
}

// Get cache statistics
export function getImageCacheStats(): { size: number; maxSize: number } {
  return {
    size: imageCache.cache.size,
    maxSize: imageCache.maxSize
  };
}
