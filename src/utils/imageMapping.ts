import { findDeviceImage } from '@/data/deviceImages';

// Stock image mapping for products
export const getProductImage = (productName: string, brand: string): string => {
  // First try to find exact match in local database
  const exactMatch = findDeviceImage(productName, brand);
  if (exactMatch) {
    return exactMatch;
  }
  
  // Fallback to generic images based on brand and product type
  const name = productName.toLowerCase();
  
  // Samsung devices
  if (brand.toLowerCase() === 'samsung') {
    if (name.includes('fold')) {
      return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop';
    }
    if (name.includes('galaxy') || name.includes('s23') || name.includes('s24')) {
      return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop';
    }
  }
  
  // Google Pixel devices
  if (brand.toLowerCase() === 'google') {
    if (name.includes('pixel')) {
      return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop';
    }
  }
  
  // Apple devices
  if (brand.toLowerCase() === 'apple') {
    if (name.includes('iphone')) {
      return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop';
    }
  }
  
  // Default mobile phone image
  return 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop';
};
