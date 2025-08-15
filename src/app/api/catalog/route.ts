import { NextResponse } from 'next/server';
import { CatalogItem } from '@/types/catalog';

export async function GET() {
  try {
    const sheetId = process.env.SHEET_ID;
    const cacheSeconds = parseInt(process.env.CACHE_SECONDS || '300'); // Default 5 minutes

    if (!sheetId) {
      return NextResponse.json(
        { error: 'SHEET_ID environment variable not configured' },
        { status: 500 }
      );
    }

    // Build the CSV URL dynamically
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    // Fetch CSV data
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }

    const csvText = await response.text();
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
