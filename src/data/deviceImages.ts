// Enhanced device image mapping with multiple image support
export interface DeviceImage {
  device: string;  // e.g., "PIXEL", "FOLD", "FLIP", "S23", "S24", "IPHONE"
  model: string;   // e.g., "8", "7", "3", "4", "15", "14"
  imageUrls: string[]; // Multiple image URLs for fallback and variety
  brand: string;
}

export const deviceImages: DeviceImage[] = [
  // Google Pixel Devices
  {
    device: 'PIXEL',
    model: '8',
    imageUrls: [
      'https://i.ebayimg.com/images/g/ZJsAAeSweNNonQhB/s-l1600.webp',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Google_Pixel_8_Pro.jpg/250px-Google_Pixel_8_Pro.jpg'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '7',
    imageUrls: [
      'https://i.ebayimg.com/images/g/rBgAAeSwh3tonMM5/s-l1600.webp',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Google_Pixel_7.jpg/250px-Google_Pixel_7.jpg'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '7PRO',
    imageUrls: [
      'https://i.ebayimg.com/images/g/s5AAAOSw9KRnyU1i/s-l1600.webp',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '7A',
    imageUrls: [
      'https://i.ebayimg.com/images/g/rBgAAeSwh3tonMM5/s-l1600.webp',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '6',
    imageUrls: [
      'https://i.ebayimg.com/images/g/uKwAAOSw52hnKBTr/s-l1600.webp',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '5',
    imageUrls: [
      'https://i.ebayimg.com/images/g/nOMAAOSwfa9nq9B-/s-l1600.webp',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'GOOGLE'
  },
  
  // Samsung Fold Devices
  {
    device: 'FOLD',
    model: '5',
    imageUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Samsung_Galaxy_Fold_5.jpg/250px-Samsung_Galaxy_Fold_5.jpg',
      'https://i.ebayimg.com/images/g/ZJsAAeSweNNonQhB/s-l1600.webp',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'SAMSUNG'
  },
  {
    device: 'FOLD',
    model: '4',
    imageUrls: [
      'https://i.ebayimg.com/images/g/G7EAAeSwmtFok4Fe/s-l1600.webp',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Samsung_Galaxy_Fold_5.jpg/250px-Samsung_Galaxy_Fold_5.jpg',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'SAMSUNG'
  },
  {
    device: 'FOLD',
    model: '3',
    imageUrls: [
      'https://i.ebayimg.com/images/g/eqYAAeSwKt9on0We/s-l1600.webp',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Samsung_Galaxy_Fold_5.jpg/250px-Samsung_Galaxy_Fold_5.jpg',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'SAMSUNG'
  },
  {
    device: 'FOLD',
    model: '7',
    imageUrls: [
      'https://cdn.mos.cms.futurecdn.net/azeySPAMyF3ZTc5j9nWZhf-970-80.jpg.webp',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Samsung_Galaxy_Fold_5.jpg/250px-Samsung_Galaxy_Fold_5.jpg',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'SAMSUNG'
  },
  
  // Samsung Flip Devices
  {
    device: 'FLIP',
    model: '5',
    imageUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Samsung_Galaxy_Flip_5.jpg/250px-Samsung_Galaxy_Flip_5.jpg',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'SAMSUNG'
  },
  
  // Samsung Galaxy S Series
  {
    device: 'S24',
    model: '',
    imageUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Samsung_Galaxy_S24.jpg/250px-Samsung_Galaxy_S24.jpg',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'SAMSUNG'
  },
  {
    device: 'S23',
    model: '',
    imageUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Back_of_the_Samsung_Galaxy_S23.jpg/330px-Back_of_the_Samsung_Galaxy_S23.jpg',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'SAMSUNG'
  },
];

// Function to find device image by extracting device-model from SKU with case-insensitive matching
export const findDeviceImage = (productName: string, brand: string): string | null => {
  // Convert to uppercase for consistent matching (post-processing phase)
  const normalizedName = productName.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const normalizedBrand = brand.toUpperCase();
  
  // Extract device-model pattern from SKU with case-insensitive matching
  let device = '';
  let model = '';
  
  // Pixel devices with case-insensitive matching
  if (normalizedName.includes('PIXEL')) {
    device = 'PIXEL';
    // Extract just the first digit after PIXEL
    const pixelMatch = normalizedName.match(/PIXEL(\d)/);
    if (pixelMatch) {
      model = pixelMatch[1];
    }
  } 
  // Fold devices
  else if (normalizedName.includes('FOLD')) {
    device = 'FOLD';
    const foldMatch = normalizedName.match(/FOLD(\d)/);
    model = foldMatch ? foldMatch[1] : '';
  } 
  // Flip devices
  else if (normalizedName.includes('FLIP')) {
    device = 'FLIP';
    const flipMatch = normalizedName.match(/FLIP(\d+)/);
    model = flipMatch ? flipMatch[1] : '';
  } 
  // Samsung S series
  else if (normalizedName.includes('S24')) {
    device = 'S24';
    model = '';
  } else if (normalizedName.includes('S23')) {
    device = 'S23';
    model = '';
  } 
  // iPhone devices
  else if (normalizedName.includes('IPHONE')) {
    device = 'IPHONE';
    const iphoneMatch = normalizedName.match(/IPHONE(\d+)(PRO|MAX|PLUS|MINI)?/);
    if (iphoneMatch) {
      model = iphoneMatch[1] + (iphoneMatch[2] || '');
    }
  }
  
  if (!device) return null;
  
  // Find matching device in database with case-insensitive matching
  let deviceImage = deviceImages.find(img => 
    img.device.toUpperCase() === device && 
    img.model.toUpperCase() === model.toUpperCase() && 
    img.brand.toUpperCase() === normalizedBrand
  );
  
  // If exact match not found, try partial model matching
  if (!deviceImage && model) {
    // Try matching just the base number (e.g., "7PRO" -> "7")
    const baseModel = model.replace(/PRO|A|XL|MAX|PLUS|MINI/g, '');
    deviceImage = deviceImages.find(img => 
      img.device.toUpperCase() === device && 
      (img.model.toUpperCase() === baseModel.toUpperCase() || img.model.toUpperCase() === model.toUpperCase()) && 
      img.brand.toUpperCase() === normalizedBrand
    );
  }
  
  return deviceImage ? deviceImage.imageUrls[0] : null; // Return the first image URL if found
};

// Function to get a random image from the available images for a device
export const getRandomDeviceImage = (productName: string, brand: string): string | null => {
  const deviceImage = findDeviceImage(productName, brand);
  if (!deviceImage) return null;
  
  const matchingDevice = deviceImages.find(img => 
    img.device.toUpperCase() === deviceImage.split('/').pop()?.split('.')[0]?.toUpperCase() && 
    img.brand.toUpperCase() === brand.toUpperCase()
  );
  
  if (!matchingDevice || matchingDevice.imageUrls.length === 0) return null;
  
  // Return a random image from the available URLs
  const randomIndex = Math.floor(Math.random() * matchingDevice.imageUrls.length);
  return matchingDevice.imageUrls[randomIndex];
};

// Function to get all available images for a device
export const getAllDeviceImages = (productName: string, brand: string): string[] => {
  const normalizedName = productName.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const normalizedBrand = brand.toUpperCase();
  
  let device = '';
  let model = '';
  
  // Extract device-model pattern (same logic as findDeviceImage)
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
  
  if (!device) return [];
  
  let deviceImage = deviceImages.find(img => 
    img.device.toUpperCase() === device && 
    img.model.toUpperCase() === model.toUpperCase() && 
    img.brand.toUpperCase() === normalizedBrand
  );
  
  if (!deviceImage && model) {
    const baseModel = model.replace(/PRO|A|XL|MAX|PLUS|MINI/g, '');
    deviceImage = deviceImages.find(img => 
      img.device.toUpperCase() === device && 
      (img.model.toUpperCase() === baseModel.toUpperCase() || img.model.toUpperCase() === model.toUpperCase()) && 
      img.brand.toUpperCase() === normalizedBrand
    );
  }
  
  return deviceImage ? deviceImage.imageUrls : [];
};
