import { findDeviceImage, getAllDeviceImages } from '@/data/deviceImages';

interface DeviceImage {
  device: string;
  model: string;
  brand: string;
  imageUrls: string[];
  lastUpdated: string;
}

// Cache for dynamic images to avoid repeated API calls
let dynamicImageCache: DeviceImage[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch dynamic images from API
async function fetchDynamicImages() {
  try {
    const response = await fetch('/api/images', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dynamic images');
    }
    
    const data = await response.json();
    return data.devices || [];
  } catch (error) {
    console.error('Error fetching dynamic images:', error);
    return [];
  }
}

// Get dynamic images with caching
async function getDynamicImages() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (dynamicImageCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return dynamicImageCache;
  }
  
  // Fetch fresh data
  dynamicImageCache = await fetchDynamicImages();
  cacheTimestamp = now;
  
  return dynamicImageCache;
}

// Find device image in dynamic storage
async function findDynamicDeviceImage(productName: string, brand: string): Promise<string | null> {
  try {
    const dynamicDevices = await getDynamicImages();
    
    // Convert to uppercase for consistent matching
    const normalizedName = productName.toUpperCase();
    const normalizedBrand = brand.toUpperCase();
    
    // Parse SKU format: <DEVICE>-<MODEL>-<STORAGE>-<OPTIONAL_SUFFIX>
    let device = '';
    let model = '';
    
    // Split by hyphens to parse the SKU structure
    const skuParts = normalizedName.split('-');
    
    // Handle Samsung S-series devices (S22, S23, S24, etc.)
    if (normalizedName.match(/^S\d+/)) {
      device = skuParts[0]; // S22, S23, S24, etc.
      model = skuParts.length > 1 ? skuParts[1] : ''; // 128, 256, etc.
    }
    // Handle 3+ part SKUs
    else if (skuParts.length >= 3) {
      device = skuParts[0];
      const modelNumber = skuParts[1];
      const thirdPart = skuParts[2];
      
      // Check if third part is a storage capacity
      const storagePatterns = ['128', '256', '512', '1TB', '2TB'];
      const isStorage = storagePatterns.some(pattern => thirdPart.includes(pattern));
      
      if (isStorage) {
        model = `${modelNumber}-${skuParts[1] === modelNumber ? '' : skuParts[1]}`.replace(/^-/, '');
      } else {
        model = `${modelNumber}-${thirdPart}`;
      }
    }
    // Handle 2-part SKUs
    else if (skuParts.length === 2) {
      device = skuParts[0];
      model = skuParts[1];
    }
    // Fallback to old logic for backward compatibility
    else {
      if (normalizedName.includes('PIXEL')) {
        device = 'PIXEL';
        const pixelMatch = normalizedName.match(/PIXEL(\d)/);
        if (pixelMatch) {
          model = pixelMatch[1];
        }
      } else if (normalizedName.includes('FOLD')) {
        device = 'FOLD';
        const foldMatch = normalizedName.match(/FOLD(\d)/);
        model = foldMatch ? foldMatch[1] : '';
      } else if (normalizedName.includes('FLIP')) {
        device = 'FLIP';
        const flipMatch = normalizedName.match(/FLIP(\d+)/);
        model = flipMatch ? flipMatch[1] : '';
      } else if (normalizedName.includes('S24')) {
        device = 'S24';
        model = '';
      } else if (normalizedName.includes('S23')) {
        device = 'S23';
        model = '';
      } else if (normalizedName.includes('IPHONE')) {
        device = 'IPHONE';
        const iphoneMatch = normalizedName.match(/IPHONE(\d+)(PRO|MAX|PLUS|MINI)?/);
        if (iphoneMatch) {
          model = iphoneMatch[1] + (iphoneMatch[2] || '');
        }
      }
    }
    
    if (!device) return null;
    
    // Find matching device in dynamic database
    let deviceImage = dynamicDevices?.find((img: DeviceImage) => 
      img.device.toUpperCase() === device && 
      img.model.toUpperCase() === model.toUpperCase() && 
      img.brand.toUpperCase() === normalizedBrand
    );
    
    // If exact match not found, try partial model matching
    if (!deviceImage && model && dynamicDevices) {
      const baseModel = model.split('-')[0];
      deviceImage = dynamicDevices.find((img: DeviceImage) => 
        img.device.toUpperCase() === device && 
        (img.model.toUpperCase() === baseModel.toUpperCase() || img.model.toUpperCase() === model.toUpperCase()) && 
        img.brand.toUpperCase() === normalizedBrand
      );
    }
    
    return deviceImage ? deviceImage.imageUrls[0] : null;
  } catch (error) {
    console.error('Error finding dynamic device image:', error);
    return null;
  }
}

// Enhanced product image mapping with dynamic support
export const getDynamicProductImage = async (productName: string, brand: string): Promise<string> => {
  try {
    // First try to find exact match in dynamic database
    const dynamicMatch = await findDynamicDeviceImage(productName, brand);
    if (dynamicMatch) {
      return dynamicMatch;
    }
    
    // Fallback to static database
    const staticMatch = findDeviceImage(productName, brand);
    if (staticMatch) {
      return staticMatch;
    }
    
    // Fallback to generic images based on brand and product type
    const name = productName.toLowerCase();
    const brandLower = brand.toLowerCase();
    
    // Samsung devices
    if (brandLower === 'samsung') {
      if (name.includes('fold')) {
        return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop';
      }
      if (name.includes('galaxy') || name.includes('s23') || name.includes('s24')) {
        return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop';
      }
    }
    
    // Google Pixel devices
    if (brandLower === 'google') {
      if (name.includes('pixel')) {
        return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop';
      }
    }
    
    // Apple devices
    if (brandLower === 'apple') {
      if (name.includes('iphone')) {
        return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop';
      }
    }
    
    // Default mobile phone image
    return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop';
  } catch (error) {
    console.error('Error getting dynamic product image:', error);
    // Fallback to static method
    return findDeviceImage(productName, brand) || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop';
  }
};

// Get all available images for a product (dynamic + static)
export const getAllDynamicProductImages = async (productName: string, brand: string): Promise<string[]> => {
  try {
    const dynamicDevices = await getDynamicImages();
    
    // Convert to uppercase for consistent matching
    const normalizedName = productName.toUpperCase();
    const normalizedBrand = brand.toUpperCase();
    
    let device = '';
    let model = '';
    
    // Parse SKU format (same logic as above)
    const skuParts = normalizedName.split('-');
    
    // Handle Samsung S-series devices (S22, S23, S24, etc.)
    if (normalizedName.match(/^S\d+/)) {
      device = skuParts[0]; // S22, S23, S24, etc.
      model = skuParts.length > 1 ? skuParts[1] : ''; // 128, 256, etc.
    }
    // Handle 3+ part SKUs
    else if (skuParts.length >= 3) {
      device = skuParts[0];
      const modelNumber = skuParts[1];
      const thirdPart = skuParts[2];
      
      const storagePatterns = ['128', '256', '512', '1TB', '2TB'];
      const isStorage = storagePatterns.some(pattern => thirdPart.includes(pattern));
      
      if (isStorage) {
        model = `${modelNumber}-${skuParts[1] === modelNumber ? '' : skuParts[1]}`.replace(/^-/, '');
      } else {
        model = `${modelNumber}-${thirdPart}`;
      }
    }
    // Handle 2-part SKUs
    else if (skuParts.length === 2) {
      device = skuParts[0];
      model = skuParts[1];
    }
    // Fallback parsing logic
    else {
      if (normalizedName.includes('PIXEL')) {
        device = 'PIXEL';
        const pixelMatch = normalizedName.match(/PIXEL(\d)/);
        if (pixelMatch) {
          model = pixelMatch[1];
        }
      } else if (normalizedName.includes('FOLD')) {
        device = 'FOLD';
        const foldMatch = normalizedName.match(/FOLD(\d)/);
        model = foldMatch ? foldMatch[1] : '';
      } else if (normalizedName.includes('FLIP')) {
        device = 'FLIP';
        const flipMatch = normalizedName.match(/FLIP(\d+)/);
        model = flipMatch ? flipMatch[1] : '';
      } else if (normalizedName.includes('S24')) {
        device = 'S24';
        model = '';
      } else if (normalizedName.includes('S23')) {
        device = 'S23';
        model = '';
      } else if (normalizedName.includes('IPHONE')) {
        device = 'IPHONE';
        const iphoneMatch = normalizedName.match(/IPHONE(\d+)(PRO|MAX|PLUS|MINI)?/);
        if (iphoneMatch) {
          model = iphoneMatch[1] + (iphoneMatch[2] || '');
        }
      }
    }
    
    if (!device) return [];
    
    // Find matching device in dynamic database
    let deviceImage = dynamicDevices?.find((img: DeviceImage) => 
      img.device.toUpperCase() === device && 
      img.model.toUpperCase() === model.toUpperCase() && 
      img.brand.toUpperCase() === normalizedBrand
    );
    
    if (!deviceImage && model && dynamicDevices) {
      const baseModel = model.split('-')[0];
      deviceImage = dynamicDevices.find((img: DeviceImage) => 
        img.device.toUpperCase() === device && 
        (img.model.toUpperCase() === baseModel.toUpperCase() || img.model.toUpperCase() === model.toUpperCase()) && 
        img.brand.toUpperCase() === normalizedBrand
      );
    }
    
    if (deviceImage && deviceImage.imageUrls.length > 0) {
      return deviceImage.imageUrls;
    }
    
    // Fallback to static database
    const staticImages = getAllDeviceImages(productName, brand);
    if (staticImages.length > 0) {
      return staticImages;
    }
    
    // Return fallback image as array
    return [await getDynamicProductImage(productName, brand)];
  } catch (error) {
    console.error('Error getting all dynamic product images:', error);
    // Fallback to static method
    return getAllDeviceImages(productName, brand);
  }
};

// Clear cache (useful for testing or manual cache invalidation)
export const clearDynamicImageCache = () => {
  dynamicImageCache = null;
  cacheTimestamp = 0;
  console.log('Dynamic image cache cleared');
};
