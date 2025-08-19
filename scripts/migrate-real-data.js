const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Direct configuration for testing (New API Keys)
const supabaseUrl = 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseServiceKey = 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

console.log('🚀 Starting Real Data Migration to Supabase...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? '✅ Present' : '❌ Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to parse CSV data (same as your existing catalog API)
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const items = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < headers.length) continue;
    
    const item = {};
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
      const catalogItem = {
        id: `${item.brand}-${item.sku}`.toLowerCase().replace(/\s+/g, '-'),
        brand: item.brand, // Keep original case
        name: item.sku,    // Keep original case (e.g., "PIXEL-8-128")
        grade: item.grade || 'Standard',
        min_qty: parseInt(item.qty || '1') || 1,
        price: parseFloat(item['wholesale price']?.replace('$', '').replace(',', '') || '0') || 0,
        description: item['product description'] || item['productdescription'] || '',
        category: item.category || '',
        image_url: null // We'll handle images separately
      };
      
      items.push(catalogItem);
    }
  }
  
  return items;
}

function parseCSVLine(line) {
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

async function migrateRealData() {
  try {
    console.log('\n🔌 Testing Supabase connection...');
    
    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    console.log('✅ Connection successful!');

    // 1. Ensure admin user exists
    console.log('\n👥 Ensuring admin user exists...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('Ustvmos817', 10);
      const { error: createError } = await supabase
        .from('users')
        .insert({
          username: 'admin',
          password_hash: hashedPassword,
          role: 'admin',
          created_by: null
        });

      if (createError) {
        console.error('❌ Error creating admin user:', createError.message);
      } else {
        console.log('✅ Admin user created');
      }
    } else {
      console.log('⏭️ Admin user already exists');
    }

    // 2. Fetch real catalog data from Google Sheets
    console.log('\n📦 Fetching real catalog data from Google Sheets...');
    const csvUrl = process.env.SHEET_CSV_URL || "https://docs.google.com/spreadsheets/d/1RPFvawAx_c7_3gmjumNW3gV0t2dSA5eu7alwztwileY/export?format=csv";
    
    console.log('Fetching from:', csvUrl);
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();
    
    const catalogItems = parseCSV(csvText);
    console.log(`✅ Fetched ${catalogItems.length} real catalog items from Google Sheets`);

    // 3. Migrate catalog items to Supabase
    console.log('\n📦 Migrating catalog items to Supabase...');
    let migratedCount = 0;
    let skippedCount = 0;

    for (const item of catalogItems) {
      // Check if item already exists
      const { data: existingItem } = await supabase
        .from('catalog_items')
        .select('id')
        .eq('id', item.id)
        .single();

      if (existingItem) {
        console.log(`⏭️ Item ${item.name} already exists, skipping...`);
        skippedCount++;
        continue;
      }

      const { error } = await supabase
        .from('catalog_items')
        .insert(item);

      if (error) {
        console.error(`❌ Error migrating catalog item ${item.name}:`, error.message);
      } else {
        console.log(`✅ Migrated catalog item: ${item.name} (${item.brand}) - $${item.price}`);
        migratedCount++;
      }
    }

    // 4. Create system settings if they don't exist
    console.log('\n⚙️ Ensuring system settings exist...');
    const { data: existingSettings } = await supabase
      .from('system_settings')
      .select('id')
      .eq('id', 'default')
      .single();

    if (!existingSettings) {
      const defaultSettings = {
        id: 'default',
        settings: {
          ranking: {
            pageViewWeight: 1.0,
            categoryViewWeight: 2.0,
            productViewWeight: 3.0,
            resultClickWeight: 5.0,
            searchWeight: 1.5,
            recencyWeight: 2.0
          },
          trending: {
            cacheDuration: 300,
            maxTrendingItems: 10,
            updateInterval: 60
          },
          analytics: {
            retentionDays: 30,
            autoCleanup: true,
            detailedLogging: false
          },
          security: {
            sessionTimeout: 3600,
            maxLoginAttempts: 5,
            requirePasswordChange: false
          }
        }
      };

      const { error: settingsError } = await supabase
        .from('system_settings')
        .insert(defaultSettings);

      if (settingsError) {
        console.error('❌ Error creating system settings:', settingsError.message);
      } else {
        console.log('✅ System settings created');
      }
    } else {
      console.log('⏭️ System settings already exist');
    }

    // 5. Add migration log
    console.log('\n📝 Adding migration log...');
    const { error: logError } = await supabase
      .from('activity_logs')
      .insert({
        level: 'info',
        category: 'migration',
        message: `Real data migration completed: ${migratedCount} items migrated, ${skippedCount} skipped`,
        username: 'System',
        ip_address: '127.0.0.1'
      });

    if (logError) {
      console.error('❌ Error adding migration log:', logError.message);
    } else {
      console.log('✅ Migration log added');
    }

    console.log('\n🎉 Real data migration completed successfully!');
    console.log('\n📋 Migration Summary:');
    console.log(`- Total items in Google Sheets: ${catalogItems.length}`);
    console.log(`- Items migrated: ${migratedCount}`);
    console.log(`- Items skipped (already exist): ${skippedCount}`);
    console.log(`- Admin user: ✅ Ready`);
    console.log(`- System settings: ✅ Ready`);

    console.log('\n🔗 Next steps:');
    console.log('1. Test the admin interface at http://localhost:3000/admin/login');
    console.log('2. Verify catalog data in admin/catalog');
    console.log('3. Update catalog API to use Supabase instead of Google Sheets');
    console.log('4. Continue with updating other APIs to use Supabase');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateRealData().catch(console.error);
