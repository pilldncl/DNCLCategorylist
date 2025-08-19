import { CatalogItem } from '@/types/catalog';
import { getProductImage } from '@/utils/imageMapping';

export async function fetchCatalogData(): Promise<{ items: CatalogItem[] }> {
  try {
    // Use environment variable or fallback to hardcoded URL for development
    const csvUrl = process.env.SHEET_CSV_URL || "https://docs.google.com/spreadsheets/d/1RPFvawAx_c7_3gmjumNW3gV0t2dSA5eu7alwztwileY/export?format=csv";
    
    // Fetch CSV data from the configured URL
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    
    const items = parseCSV(csvText);
    return { items };
  } catch (error) {
    console.error('Error fetching catalog:', error);
    throw new Error('Failed to fetch catalog data');
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
