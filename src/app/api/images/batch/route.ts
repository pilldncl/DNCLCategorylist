import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateOptimizedImageUrl } from '@/utils/imageCDN';

interface BatchImageRequest {
  products: Array<{
    name: string;
    brand: string;
    size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'original';
  }>;
}

interface BatchImageResponse {
  images: Array<{
    productName: string;
    brand: string;
    imageUrl: string | null;
    optimizedUrl: string | null;
  }>;
  cacheInfo: {
    cached: number;
    total: number;
    cacheHitRate: number;
  };
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

export async function POST(request: NextRequest) {
  try {
    const body: BatchImageRequest = await request.json();
    const { products } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: products array is required' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    const maxBatchSize = 50;
    const limitedProducts = products.slice(0, maxBatchSize);

    // Parse all products to get device info
    const deviceQueries = limitedProducts.map(product => {
      const deviceInfo = parseProductSKU(product.name, product.brand);
      return {
        product,
        deviceInfo,
        size: product.size || 'medium'
      };
    }).filter(item => item.deviceInfo !== null);

    // Group by device/brand/model for efficient database queries
    const queryGroups = new Map<string, Array<{ product: Record<string, unknown>; size: string }>>();
    
    deviceQueries.forEach(item => {
      const key = `${item.deviceInfo!.device}-${item.deviceInfo!.brand}-${item.deviceInfo!.model}`;
      if (!queryGroups.has(key)) {
        queryGroups.set(key, []);
      }
      queryGroups.get(key)!.push({ product: item.product, size: item.size });
    });

    // Batch query the database
    const batchResults: BatchImageResponse['images'] = [];
    let cachedCount = 0;

    for (const [key, group] of queryGroups) {
      const [device, brand, model] = key.split('-');
      
      try {
        // Query database for this device group
        const { data, error } = await supabase
          .from('dynamic_images')
          .select('image_urls, device, model, brand')
          .eq('device', device)
          .eq('brand', brand)
          .eq('model', model)
          .single();

        if (error || !data || !data.image_urls || data.image_urls.length === 0) {
          // No images found for this device group
          group.forEach(({ product }) => {
            batchResults.push({
              productName: product.name,
              brand: product.brand,
              imageUrl: null,
              optimizedUrl: null
            });
          });
          continue;
        }

        // Process each product in this group
        group.forEach(({ product, size }) => {
          const imageUrl = data.image_urls[0]; // Get first image
          const optimizedUrl = generateOptimizedImageUrl(imageUrl, size as string);
          
          batchResults.push({
            productName: product.name,
            brand: product.brand,
            imageUrl,
            optimizedUrl
          });
        });

        cachedCount += group.length;
      } catch (error) {
        console.error(`Error querying device group ${key}:`, error);
        
        // Add null results for failed queries
        group.forEach(({ product }) => {
          batchResults.push({
            productName: product.name,
            brand: product.brand,
            imageUrl: null,
            optimizedUrl: null
          });
        });
      }
    }

    // Set cache headers for better performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'); // 5 minutes cache
    headers.set('ETag', `batch-images-${limitedProducts.length}-${Date.now()}`);

    const response: BatchImageResponse = {
      images: batchResults,
      cacheInfo: {
        cached: cachedCount,
        total: limitedProducts.length,
        cacheHitRate: (cachedCount / limitedProducts.length) * 100
      }
    };

    return NextResponse.json(response, { headers });
  } catch (error) {
    console.error('Error in batch image API:', error);
    return NextResponse.json(
      { error: 'Failed to process batch image request' },
      { status: 500 }
    );
  }
}

// GET endpoint for batch image loading with query parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productsParam = searchParams.get('products');
    
    if (!productsParam) {
      return NextResponse.json(
        { error: 'Products parameter is required' },
        { status: 400 }
      );
    }

    // Parse products from query parameter (format: "name1:brand1,name2:brand2")
    const products = productsParam.split(',').map(item => {
      const [name, brand] = item.split(':');
      return { name: decodeURIComponent(name), brand: decodeURIComponent(brand) };
    });

    // Use POST logic for processing
    const mockRequest = {
      json: async () => ({ products })
    } as NextRequest;

    return POST(mockRequest);
  } catch (error) {
    console.error('Error in batch image GET API:', error);
    return NextResponse.json(
      { error: 'Failed to process batch image request' },
      { status: 500 }
    );
  }
}

