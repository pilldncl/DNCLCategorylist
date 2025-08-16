import { NextResponse } from 'next/server';
import { CatalogItem } from '@/types/catalog';
import { getProductImage } from '@/utils/imageMapping';

export async function GET() {
  try {
    console.log('🔧 Environment check:');
    console.log('SHEET_CSV_URL:', process.env.SHEET_CSV_URL);
    console.log('CACHE_SECONDS:', process.env.CACHE_SECONDS);
    
    // Use environment variable or fallback to hardcoded URL for development
    const csvUrl = process.env.SHEET_CSV_URL || "https://docs.google.com/spreadsheets/d/1RPFvawAx_c7_3gmjumNW3gV0t2dSA5eu7alwztwileY/export?format=csv";
    const cacheSeconds = parseInt(process.env.CACHE_SECONDS || '30'); // Default 30 seconds

    let csvText: string;

    console.log('🔧 Using Google Sheets URL:', csvUrl ? 'from env' : 'hardcoded fallback');
    
    // Fetch CSV data from the configured URL
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    csvText = await response.text();

    console.log('📊 Raw CSV data (first 500 chars):', csvText.substring(0, 500));
    
    const items = parseCSV(csvText);
    
    console.log('🔍 Parsed items count:', items.length);
    console.log('📋 First few items:', items.slice(0, 3));

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
  
  console.log('📋 CSV Headers:', headers);
  console.log('📊 Total lines:', lines.length);
  
  const items: CatalogItem[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;
    
    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      item[header] = values[index]?.trim() || '';
    });
    
    // Debug: Log the first few items to see field names
    if (i <= 3) {
      console.log(`📋 Item ${i}:`, item);
    }
    
    // Validate required fields - keep original case for parsing
    const hasBrand = item.brand && item.brand.trim() !== '';
    const hasDescription = (item['product description'] && item['product description'].trim() !== '') ||
                          (item['productdescription'] && item['productdescription'].trim() !== '');
    const hasSku = item.sku && item.sku.trim() !== '';
    
    if (hasBrand && hasDescription && hasSku) {
      // Create item with original case preserved
      const catalogItem: CatalogItem = {
        id: `${item.brand}-${item.sku}`.toLowerCase().replace(/\s+/g, '-'),
        brand: item.brand, // Keep original case
        name: item.sku,    // Keep original case (e.g., "PIXEL-8-128")
        grade: item.grade || 'Standard',
        minQty: parseInt(item.qty || '1') || 1,
        price: parseFloat(item['wholesale price']?.replace('$', '').replace(',', '') || '0') || 0,
        description: item['product description'] || item['productdescription'] || '',
        category: item.category,
        image: getProductImage(item.sku, item.brand) // Apply image mapping
      };
      
      items.push(catalogItem);
    } else {
      // Debug: Log why items are being skipped
      if (i <= 5) {
        console.log(`❌ Skipping item ${i}:`, {
          hasBrand,
          hasDescription,
          hasSku,
          brand: item.brand,
          description: item['product description'] || item['productdescription'],
          sku: item.sku
        });
      }
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
