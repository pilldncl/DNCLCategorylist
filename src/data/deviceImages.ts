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
      'https://i.ebayimg.com/images/g/Z58AAeSwVAtonQhB/s-l1600.webp',
      'https://i.ebayimg.com/images/g/2J8AAeSwXCFonQhC/s-l500.webp'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '7',
    imageUrls: [
      'https://i.ebayimg.com/images/g/rBgAAeSwh3tonMM5/s-l1600.webp',
      'https://i.ebayimg.com/images/g/v78AAeSw6A5onNlR/s-l1600.webp',
      'https://i.ebayimg.com/images/g/2J8AAeSwXCFonQhC/s-l500.webp'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '7-PRO',
    imageUrls: [
      'https://i.ebayimg.com/images/g/s5AAAOSw9KRnyU1i/s-l1600.webp',
      'https://i.ebayimg.com/images/g/goEAAeSwev1ob3Dz/s-l1600.webp',
      'https://i.ebayimg.com/images/g/elYAAeSwGH5ohXu8/s-l1600.webp'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '6',
    imageUrls: [
      'https://i.ebayimg.com/images/g/uKwAAOSw52hnKBTr/s-l1600.webp',
      'https://i.ebayimg.com/images/g/Yh0AAOSwPRJnKBZr/s-l1600.webp',
      'https://i.ebayimg.com/images/g/2J8AAeSwXCFonQhC/s-l500.webp'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '5',
    imageUrls: [
      'https://i.ebayimg.com/images/g/nOMAAOSwfa9nq9B-/s-l1600.webp',
      'https://i.ebayimg.com/images/g/iS8AAOSwrG5nq9Bv/s-l500.webp',
      'https://i.ebayimg.com/images/g/2J8AAeSwXCFonQhC/s-l500.webp'
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
      'https://i.ebayimg.com/images/g/OwQAAeSwXkVolj5R/s-l1600.webp',
      'https://i.ebayimg.com/images/g/lRwAAeSwM1Volj5S/s-l500.webp'
    ],
    brand: 'SAMSUNG'
  },
  {
    device: 'FOLD',
    model: '3',
    imageUrls: [
      'https://i.ebayimg.com/images/g/eqYAAeSwKt9on0We/s-l1600.webp',
      'https://i.ebayimg.com/images/g/dFYAAeSwYdNojicB/s-l1600.webp',
      'https://i.ebayimg.com/images/g/FFAAAeSwvpdom2AX/s-l1600.webp'
    ],
    brand: 'SAMSUNG'
  },
  {
    device: 'FOLD',
    model: '7',
    imageUrls: [
      'https://i.ebayimg.com/images/g/gCIAAeSwALBoiIhd/s-l1600.webp',
       'https://i.ebayimg.com/images/g/dQAAAeSwJGdoiIhg/s-l1600.webp',
       'https://cdn.mos.cms.futurecdn.net/azeySPAMyF3ZTc5j9nWZhf-970-80.jpg.webp'
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
  // Convert to uppercase for consistent matching
  const normalizedName = productName.toUpperCase();
  const normalizedBrand = brand.toUpperCase();
  
  // Parse SKU format: <DEVICE>-<MODEL>-<STORAGE>-<OPTIONAL_SUFFIX>
  let device = '';
  let model = '';
  
  // Split by hyphens to parse the SKU structure
  const skuParts = normalizedName.split('-');
  
  if (skuParts.length >= 3) {
    // First part is the device
    device = skuParts[0];
    
    // Second part is the model number
    const modelNumber = skuParts[1];
    
    // Third part could be model variant (PRO, A, etc.) or storage
    const thirdPart = skuParts[2];
    
    // Check if third part is a storage capacity
    const storagePatterns = ['128', '256', '512', '1TB', '2TB'];
    const isStorage = storagePatterns.some(pattern => thirdPart.includes(pattern));
    
    if (isStorage) {
      // Format: PIXEL-7-PRO-128 -> model = "7-PRO"
      model = `${modelNumber}-${skuParts[1] === modelNumber ? '' : skuParts[1]}`.replace(/^-/, '');
    } else {
      // Format: PIXEL-7-PRO-128 -> model = "7-PRO"
      model = `${modelNumber}-${thirdPart}`;
    }
  } else {
    // Fallback to old logic for backward compatibility
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
  
  // Find matching device in database with case-insensitive matching
  let deviceImage = deviceImages.find(img => 
    img.device.toUpperCase() === device && 
    img.model.toUpperCase() === model.toUpperCase() && 
    img.brand.toUpperCase() === normalizedBrand
  );
  
  // If exact match not found, try partial model matching
  if (!deviceImage && model) {
    // Try matching just the base number (e.g., "7-PRO" -> "7")
    const baseModel = model.split('-')[0];
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
  const normalizedName = productName.toUpperCase();
  const normalizedBrand = brand.toUpperCase();
  
  let device = '';
  let model = '';
  
  // Parse SKU format: <DEVICE>-<MODEL>-<STORAGE>-<OPTIONAL_SUFFIX>
  const skuParts = normalizedName.split('-');
  
  if (skuParts.length >= 3) {
    // First part is the device
    device = skuParts[0];
    
    // Second part is the model number
    const modelNumber = skuParts[1];
    
    // Third part could be model variant (PRO, A, etc.) or storage
    const thirdPart = skuParts[2];
    
    // Check if third part is a storage capacity
    const storagePatterns = ['128', '256', '512', '1TB', '2TB'];
    const isStorage = storagePatterns.some(pattern => thirdPart.includes(pattern));
    
    if (isStorage) {
      // Format: PIXEL-7-PRO-128 -> model = "7-PRO"
      model = `${modelNumber}-${skuParts[1] === modelNumber ? '' : skuParts[1]}`.replace(/^-/, '');
    } else {
      // Format: PIXEL-7-PRO-128 -> model = "7-PRO"
      model = `${modelNumber}-${thirdPart}`;
    }
  } else {
    // Fallback to old logic for backward compatibility
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
  
  let deviceImage = deviceImages.find(img => 
    img.device.toUpperCase() === device && 
    img.model.toUpperCase() === model.toUpperCase() && 
    img.brand.toUpperCase() === normalizedBrand
  );
  
  if (!deviceImage && model) {
    const baseModel = model.split('-')[0];
    deviceImage = deviceImages.find(img => 
      img.device.toUpperCase() === device && 
      (img.model.toUpperCase() === baseModel.toUpperCase() || img.model.toUpperCase() === model.toUpperCase()) && 
      img.brand.toUpperCase() === normalizedBrand
    );
  }
  
  return deviceImage ? deviceImage.imageUrls : [];
};
