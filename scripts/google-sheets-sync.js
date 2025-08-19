// Google Apps Script to sync Google Sheets with Supabase
// Add this script to your Google Sheet: Extensions > Apps Script

// Supabase configuration
const SUPABASE_URL = 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const SUPABASE_SERVICE_KEY = 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

// Function to sync all data from Google Sheets to Supabase
function syncToSupabase() {
  try {
    console.log('🔄 Starting sync from Google Sheets to Supabase...');
    
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      console.log('❌ No data found in sheet');
      return;
    }
    
    // Get headers (first row)
    const headers = data[0].map(h => h.toString().toLowerCase().trim());
    console.log('📋 Headers:', headers);
    
    // Process data rows (skip header row)
    const catalogItems = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const item = {};
      
      // Map row data to headers
      headers.forEach((header, index) => {
        item[header] = row[index] ? row[index].toString().trim() : '';
      });
      
      // Validate required fields
      const hasBrand = item.brand && item.brand !== '';
      const hasDescription = (item['product description'] && item['product description'] !== '') ||
                            (item['productdescription'] && item['productdescription'] !== '');
      const hasSku = item.sku && item.sku !== '';
      
      if (hasBrand && hasDescription && hasSku) {
        // Create catalog item
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
        
        catalogItems.push(catalogItem);
      }
    }
    
    console.log(`📦 Found ${catalogItems.length} valid catalog items`);
    
    // Sync to Supabase
    if (catalogItems.length > 0) {
      syncCatalogItems(catalogItems);
    }
    
    console.log('✅ Sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error.message);
  }
}

// Function to sync catalog items to Supabase
function syncCatalogItems(items) {
  const url = `${SUPABASE_URL}/rest/v1/catalog_items`;
  
  items.forEach((item, index) => {
    try {
      // Use upsert to update existing items or insert new ones
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'apikey': SUPABASE_SERVICE_KEY,
          'Prefer': 'resolution=merge-duplicates'
        },
        payload: JSON.stringify(item)
      };
      
      const response = UrlFetchApp.fetch(url, options);
      
      if (response.getResponseCode() === 201 || response.getResponseCode() === 200) {
        console.log(`✅ Synced item ${index + 1}/${items.length}: ${item.name}`);
      } else {
        console.error(`❌ Failed to sync item ${item.name}:`, response.getContentText());
      }
      
      // Add small delay to avoid rate limiting
      Utilities.sleep(100);
      
    } catch (error) {
      console.error(`❌ Error syncing item ${item.name}:`, error.message);
    }
  });
}

// Function to set up automatic sync triggers
function setupAutoSync() {
  // Delete existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'syncToSupabase') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger to run every hour
  ScriptApp.newTrigger('syncToSupabase')
    .timeBased()
    .everyHours(1)
    .create();
  
  console.log('⏰ Auto-sync trigger set up (runs every hour)');
}

// Function to sync on edit (can be called manually)
function onEdit() {
  // Add a small delay to ensure the edit is complete
  Utilities.sleep(2000);
  syncToSupabase();
}

// Function to test connection
function testSupabaseConnection() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/catalog_items?select=count`;
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      }
    };
    
    const response = UrlFetchApp.fetch(url, options);
    console.log('✅ Supabase connection successful');
    console.log('Response:', response.getContentText());
    
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
  }
}

// Manual sync function (can be called from menu)
function manualSync() {
  syncToSupabase();
}

// Add custom menu to Google Sheets
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Supabase Sync')
    .addItem('Manual Sync', 'manualSync')
    .addItem('Setup Auto Sync', 'setupAutoSync')
    .addItem('Test Connection', 'testSupabaseConnection')
    .addToUi();
}
