import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Function to parse CSV data (same as your existing catalog API)
function parseCSV(csvText: string) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const items: Array<{
    id: string;
    brand: string;
    name: string;
    grade: string;
    min_qty: number;
    price: number;
    description: string;
    category: string;
    image_url: string | null;
  }> = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;
    
    const item: Record<string, string> = {};
    headers.forEach((header, index) => {
      item[header] = values[index]?.trim() || '';
    });
    
    // Validate required fields
    const hasBrand = item.brand && item.brand.trim() !== '';
    const hasDescription = (item['product description'] && item['product description'].trim() !== '') ||
                          (item['productdescription'] && item['productdescription'].trim() !== '');
    const hasSku = item.sku && item.sku.trim() !== '';
    
    if (hasBrand && hasDescription && hasSku) {
      const catalogItem = {
        id: `${item.brand}-${item.sku}`.toLowerCase().replace(/\s+/g, '-'),
        brand: item.brand,
        name: item.sku,
        grade: item.grade || 'Standard',
        min_qty: parseInt(item.qty || '1') || 1,
        price: parseFloat(item['wholesale price']?.replace('$', '').replace(',', '') || '0') || 0,
        description: item['product description'] || item['productdescription'] || '',
        category: item.category || '',
        image_url: null
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'sync-from-sheets') {
      console.log('🔄 Starting sync from Google Sheets to Supabase...');
      
      // Fetch data from Google Sheets
      const csvUrl = process.env.SHEET_CSV_URL || "https://docs.google.com/spreadsheets/d/1RPFvawAx_c7_3gmjumNW3gV0t2dSA5eu7alwztwileY/export?format=csv";
      
      console.log('📡 Using CSV URL:', csvUrl.substring(0, 80) + '...');
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        console.error('❌ Failed to fetch CSV:', response.status, response.statusText);
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log('📄 CSV received, length:', csvText.length);
      
      const catalogItems = parseCSV(csvText);
      
      console.log(`📦 Found ${catalogItems.length} items in Google Sheets`);
      
      // Sync to Supabase
      let syncedCount = 0;
      let errorCount = 0;
      
      console.log('🔌 Connecting to Supabase...');
      
      for (const item of catalogItems) {
        try {
          // Use upsert to update existing or insert new
          const { data, error } = await supabaseAdmin
            .from('catalog_items')
            .upsert(item, { onConflict: 'id' })
            .select()
            .single();
          
          if (error) {
            console.error(`❌ Error syncing item ${item.name}:`, error.message);
            errorCount++;
          } else {
            console.log(`✅ Synced item: ${item.name} (${item.brand}) - $${item.price}`);
            syncedCount++;
          }
        } catch (error) {
          console.error(`❌ Error syncing item ${item.name}:`, error);
          errorCount++;
        }
      }
      
      console.log(`📊 Sync complete: ${syncedCount} success, ${errorCount} errors`);
      
      // Add sync log
      await supabaseAdmin
        .from('activity_logs')
        .insert({
          level: 'info',
          category: 'sync',
          message: `Google Sheets sync completed: ${syncedCount} items synced, ${errorCount} errors`,
          username: 'System',
          ip_address: '127.0.0.1'
        });
      
      return NextResponse.json({
        success: true,
        message: 'Sync completed successfully',
        stats: {
          totalItems: catalogItems.length,
          syncedCount,
          errorCount
        }
      });
      
    } else if (action === 'sync-to-sheets') {
      // This would sync from Supabase back to Google Sheets
      // (More complex - would need Google Sheets API)
      return NextResponse.json({
        success: false,
        error: 'Sync to Google Sheets not implemented yet'
      });
      
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "sync-from-sheets" or "sync-to-sheets"' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error details:', errorMessage);
    return NextResponse.json(
      { success: false, error: `Sync failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get sync status and recent sync logs
    const { data: logs, error } = await supabaseAdmin
      .from('activity_logs')
      .select('*')
      .eq('category', 'sync')
      .order('timestamp', { ascending: false })
      .limit(10);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      recentSyncs: logs || []
    });
    
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sync status' },
      { status: 500 }
    );
  }
}
