// Simplified device image mapping based on device-model pattern
export interface DeviceImage {
  device: string;  // e.g., "PIXEL", "FOLD", "FLIP", "S23", "S24", "IPHONE"
  model: string;   // e.g., "8", "7", "3", "4", "15", "14"
  imageUrl: string;
  brand: string;
}

export const deviceImages: DeviceImage[] = [
  // Google Pixel Devices
  {
    device: 'PIXEL',
    model: '8',
    imageUrl: 'https://i.ebayimg.com/images/g/ZJsAAeSweNNonQhB/s-l1600.webp',
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '7',
    imageUrl: 'https://i.ebayimg.com/images/g/rBgAAeSwh3tonMM5/s-l1600.webp',
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '6',
    imageUrl: 'https://i.ebayimg.com/images/g/uKwAAOSw52hnKBTr/s-l1600.webp',
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '5',
    imageUrl: 'https://i.ebayimg.com/images/g/nOMAAOSwfa9nq9B-/s-l1600.webp',
    brand: 'GOOGLE'
  },
  
  // Samsung Fold Devices
  {
    device: 'FOLD',
    model: '5',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Samsung_Galaxy_Fold_5.jpg/250px-Samsung_Galaxy_Fold_5.jpg',
    brand: 'SAMSUNG'
  },
     {
     device: 'FOLD',
     model: '4',
     imageUrl: 'https://i.ebayimg.com/images/g/G7EAAeSwmtFok4Fe/s-l1600.webp',
     brand: 'SAMSUNG'
   },
   {
     device: 'FOLD',
     model: '3',
     imageUrl: 'https://i.ebayimg.com/images/g/eqYAAeSwKt9on0We/s-l1600.webp',
     brand: 'SAMSUNG'
   },
  
  // (If you keep Fold 3 in your list, I can add a matching Wikimedia thumbnail too.)
  
  // Samsung Flip Devices
  {
    device: 'FLIP',
    model: '5',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Samsung_Galaxy_Flip_5.jpg/250px-Samsung_Galaxy_Flip_5.jpg',
    brand: 'SAMSUNG'
  },
  
  // Samsung Galaxy S Series
  {
    device: 'S24',
    model: '',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Samsung_Galaxy_S24.jpg/250px-Samsung_Galaxy_S24.jpg',
    brand: 'SAMSUNG'
  },
  {
    device: 'S23',
    model: '',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Back_of_the_Samsung_Galaxy_S23.jpg/330px-Back_of_the_Samsung_Galaxy_S23.jpg',
    brand: 'SAMSUNG'
  },
];

// Function to find device image by extracting device-model from SKU
export const findDeviceImage = (productName: string, brand: string): string | null => {
  const normalizedName = productName.toUpperCase();
  const normalizedBrand = brand.toUpperCase();
  
  // Debug logging
  console.log('🔍 Image lookup:', { productName, brand, normalizedName, normalizedBrand });
  
  // Extract device-model pattern from SKU
  // Examples: PIXEL-8-128 -> device: PIXEL, model: 8
  //           FOLD3-256 -> device: FOLD, model: 3
  //           S23-128 -> device: S23, model: (empty)
  
  let device = '';
  let model = '';
  
  if (normalizedName.includes('PIXEL-')) {
    device = 'PIXEL';
    const match = normalizedName.match(/PIXEL-(\d+)/);
    model = match ? match[1] : '';
  } else if (normalizedName.includes('FOLD')) {
    device = 'FOLD';
    const match = normalizedName.match(/FOLD-?(\d+)/);
    model = match ? match[1] : '';
  } else if (normalizedName.includes('FLIP')) {
    device = 'FLIP';
    const match = normalizedName.match(/FLIP(\d+)/);
    model = match ? match[1] : '';
  } else if (normalizedName.includes('S24')) {
    device = 'S24';
    model = '';
  } else if (normalizedName.includes('S23')) {
    device = 'S23';
    model = '';
  } else if (normalizedName.includes('IPHONE-')) {
    device = 'IPHONE';
    const match = normalizedName.match(/IPHONE-(\d+)/);
    model = match ? match[1] : '';
  }
  
  if (!device) return null;
  
  // Debug logging
  console.log('📱 Device extraction:', { device, model, normalizedBrand });
  
  // Find matching device in database
  const deviceImage = deviceImages.find(img => 
    img.device === device && 
    img.model === model && 
    img.brand === normalizedBrand
  );
  
  console.log('🎯 Match result:', deviceImage ? 'FOUND' : 'NOT FOUND', deviceImage?.imageUrl);
  
  return deviceImage ? deviceImage.imageUrl : null;
};
