const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env.local file.');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateData() {
  console.log('🚀 Starting migration to Supabase...');
  console.log('📊 URL:', supabaseUrl);

  try {
    // Test connection
    console.log('🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Connection successful!');

    // Migrate users
    console.log('\n👥 Migrating users...');
    const users = [
      {
        username: 'admin',
        password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: Ustvmos817
        role: 'admin'
      }
    ];

    for (const user of users) {
      const { error } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'username' });
      
      if (error) {
        console.error(`❌ Error migrating user ${user.username}:`, error.message);
      } else {
        console.log(`✅ Migrated user: ${user.username}`);
      }
    }

    // Migrate catalog items (sample data)
    console.log('\n📦 Migrating catalog items...');
    const catalogItems = [
      {
        id: 'iphone-15-128',
        name: 'IPHONE-15-128',
        brand: 'APPLE',
        description: 'iPhone 15 128GB - Latest model with advanced features',
        price: 799.99,
        sku: 'IPHONE-15-128',
        grade: 'Standard',
        min_qty: 1,
        category: 'Smartphones',
        image_url: 'https://example.com/iphone15.jpg'
      },
      {
        id: 'samsung-s24-256',
        name: 'SAMSUNG-S24-256',
        brand: 'SAMSUNG',
        description: 'Samsung Galaxy S24 256GB - Premium Android experience',
        price: 899.99,
        sku: 'SAMSUNG-S24-256',
        grade: 'Premium',
        min_qty: 1,
        category: 'Smartphones',
        image_url: 'https://example.com/s24.jpg'
      },
      {
        id: 'pixel-8-128',
        name: 'PIXEL-8-128',
        brand: 'GOOGLE',
        description: 'Google Pixel 8 128GB - Pure Android with AI features',
        price: 699.99,
        sku: 'PIXEL-8-128',
        grade: 'Standard',
        min_qty: 1,
        category: 'Smartphones',
        image_url: 'https://example.com/pixel8.jpg'
      }
    ];

    for (const item of catalogItems) {
      const { error } = await supabase
        .from('catalog_items')
        .upsert(item, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Error migrating catalog item ${item.name}:`, error.message);
      } else {
        console.log(`✅ Migrated catalog item: ${item.name}`);
      }
    }

    // Migrate system settings
    console.log('\n⚙️ Migrating system settings...');
    const systemSettings = {
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
      .upsert(systemSettings, { onConflict: 'id' });

    if (settingsError) {
      console.error('❌ Error migrating system settings:', settingsError.message);
    } else {
      console.log('✅ Migrated system settings');
    }

    // Migrate activity logs
    console.log('\n📝 Migrating activity logs...');
    const activityLogs = [
      {
        level: 'info',
        category: 'system',
        message: 'System initialized successfully',
        username: 'System',
        ip_address: '127.0.0.1'
      },
      {
        level: 'info',
        category: 'user',
        message: 'User admin logged in successfully',
        username: 'admin',
        ip_address: '192.168.1.100'
      },
      {
        level: 'warning',
        category: 'ranking',
        message: 'Trending calculation took longer than expected',
        username: 'System',
        ip_address: '127.0.0.1'
      }
    ];

    for (const log of activityLogs) {
      const { error } = await supabase
        .from('activity_logs')
        .insert(log);
      
      if (error) {
        console.error(`❌ Error migrating activity log:`, error.message);
      } else {
        console.log(`✅ Migrated activity log: ${log.message}`);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Get your Supabase anon key from the dashboard');
    console.log('2. Add it to .env.local as NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('3. Update your API routes to use Supabase');
    console.log('4. Test the system');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateData().catch(console.error);
