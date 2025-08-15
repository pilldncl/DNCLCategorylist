import { NextResponse } from 'next/server';
import { CatalogItem } from '@/types/catalog';

export async function GET() {
  try {
    const csvUrl = process.env.SHEET_CSV_URL;
    const cacheSeconds = parseInt(process.env.CACHE_SECONDS || '300'); // Default 5 minutes

    let csvText: string;

    if (!csvUrl) {
      // Fallback to sample data for local development
      console.log('No SHEET_CSV_URL found, using sample data');
      csvText = `brand,name,grade,minQty,price,description,category
Apple,iPhone 15 Pro,Premium,1,999.99,Latest iPhone with titanium design,Electronics
Samsung,Galaxy S24,Standard,1,799.99,Android flagship with AI features,Electronics
Google,PIXEL-8-128,Standard,1,699.99,Google Pixel 8 with advanced camera,Electronics
Google,PIXEL-7PRO,Standard,1,599.99,Google Pixel 7 Pro with telephoto lens,Electronics
Sony,WH-1000XM5,Premium,1,349.99,Noise-cancelling wireless headphones,Audio
Bose,QuietComfort 45,Standard,1,329.99,Comfortable noise-cancelling headphones,Audio
Nike,Air Max 270,Standard,10,150.00,Comfortable running shoes,Footwear
Adidas,Ultraboost 22,Premium,5,180.00,High-performance running shoes,Footwear
Coca-Cola,Classic 12oz,Standard,24,0.50,Refreshing carbonated beverage,Beverages
Pepsi,Max 16oz,Standard,24,0.60,Zero-sugar carbonated drink,Beverages`;
    } else {
      // Fetch CSV data from the configured URL
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }
      csvText = await response.text();
    }

    const items = parseCSV(csvText);

    // Set cache headers
    const headers = new Headers();
    headers.set('Cache-Control', `public, s-maxage=${cacheSeconds}, stale-while-revalidate`);

    return NextResponse.json({ items }, { headers });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalog data' },
      { status: 500 }
    );
  }
}

function parseCSV(csvText: string): CatalogItem[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const items: CatalogItem[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;
    
    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      item[header] = values[index]?.trim() || '';
    });
    
    // Normalize and validate required fields
    if (item.brand && item['product description']) {
      items.push({
        id: `${item.brand}-${item.sku}`.toLowerCase().replace(/\s+/g, '-'),
        brand: item.brand,
        name: item.sku,
        grade: item.grade || 'Standard',
        minQty: parseInt(item.qty || '1') || 1,
        price: parseFloat(item['wholesale price']?.replace('$', '').replace(',', '') || '0') || 0,
        description: item['product description'],
        category: item.category,
        image: item.image
      });
    }
  }
  
  return items;
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result.map(s => s.replace(/^"|"$/g, ''));
}
