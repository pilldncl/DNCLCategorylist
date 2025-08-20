import { supabase } from '@/lib/supabase';

// Simple cache for image URLs
const imageCache = new Map<string, string[]>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cacheTimestamp = 0;

// Get all existing images from the database
export async function getAllExistingImages(): Promise<Array<{
  device: string;
  model: string;
  brand: string;
  imageUrls: string[];
}>> {
  const now = Date.now();
  
  // Check cache first
  if (imageCache.size > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    const cachedData = Array.from(imageCache.entries()).map(([key, urls]) => {
      const [device, model, brand] = key.split('|');
      return { device, model, brand, imageUrls: urls };
    });
    return cachedData;
  }

  try {
    const { data, error } = await supabase
      .from('dynamic_images')
      .select('device, model, brand, image_urls')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching existing images:', error);
      return [];
    }

    // Update cache
    imageCache.clear();
    cacheTimestamp = now;
    
    const images = (data || []).map(item => ({
      device: item.device,
      model: item.model,
      brand: item.brand,
      imageUrls: item.image_urls || []
    }));

    // Cache the results
    images.forEach(img => {
      const key = `${img.device}|${img.model}|${img.brand}`;
      imageCache.set(key, img.imageUrls);
    });

    return images;
  } catch (error) {
    console.error('Error in getAllExistingImages:', error);
    return [];
  }
}

// Find images for a specific product using existing sources
export async function findExistingProductImages(
  productName: string, 
  brand: string
): Promise<string[]> {
  const allImages = await getAllExistingImages();
  
  // Parse product name to match device/model
  const normalizedName = productName.toUpperCase();
  const normalizedBrand = brand.toUpperCase();
  
  // Try to find matching images
  for (const imageData of allImages) {
    const deviceMatch = normalizedName.includes(imageData.device.toUpperCase());
    const brandMatch = normalizedBrand.includes(imageData.brand.toUpperCase()) || 
                      imageData.brand.toUpperCase().includes(normalizedBrand);
    
    if (deviceMatch && brandMatch) {
      return imageData.imageUrls;
    }
  }
  
  return [];
}

// Get the first available image for a product
export async function getFirstProductImage(
  productName: string, 
  brand: string
): Promise<string | null> {
  const images = await findExistingProductImages(productName, brand);
  return images.length > 0 ? images[0] : null;
}

// Preload critical images (first 10 products)
export async function preloadCriticalImages(products: Array<{ name: string; brand: string }>): Promise<void> {
  const criticalProducts = products.slice(0, 10);
  
  const preloadPromises = criticalProducts.map(async (product) => {
    try {
      const imageUrl = await getFirstProductImage(product.name, product.brand);
      if (imageUrl && typeof window !== 'undefined') {
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

// Get cache statistics
export function getImageCacheStats(): { size: number; timestamp: number } {
  return {
    size: imageCache.size,
    timestamp: cacheTimestamp
  };
}

// Clear cache
export function clearImageCache(): void {
  imageCache.clear();
  cacheTimestamp = 0;
}
