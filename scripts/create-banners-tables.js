const { createClient } = require('@supabase/supabase-js');

// Use the SAME credentials as your app
const supabaseUrl = 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseServiceKey = 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

console.log('🚀 Creating banners tables in correct Supabase project...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  try {
    // Test connection first
    console.log('\n📡 Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (testError && !testError.message.includes('relation "users" does not exist')) {
      console.error('❌ Connection error:', testError);
      return;
    }
    console.log('✅ Connected to Supabase!');

    // Create banners table
    console.log('\n📋 Creating banners table...');
    const { error: bannersError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS banners (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          image_url TEXT NOT NULL,
          link_url TEXT,
          link_text VARCHAR(100),
          is_active BOOLEAN DEFAULT true,
          display_order INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    // If RPC doesn't work, try direct query
    if (bannersError) {
      console.log('RPC not available, trying with direct table access...');
      // Actually, we can't execute DDL through PostgREST, need to use SQL editor
      console.log('\n⚠️  Cannot create tables via API. You need to run SQL manually.');
      console.log('\n📝 Go to: https://supabase.com/dashboard/project/tvzcqwdnsyqjglmwklkk/sql');
      console.log('\nThen run this SQL:\n');
      console.log(`
CREATE TABLE IF NOT EXISTS banners (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS featured_products (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('new', 'featured')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, type)
);

CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON banners(display_order);
CREATE INDEX IF NOT EXISTS idx_featured_products_active ON featured_products(is_active);
CREATE INDEX IF NOT EXISTS idx_featured_products_display_order ON featured_products(display_order);
CREATE INDEX IF NOT EXISTS idx_featured_products_product_id ON featured_products(product_id);

INSERT INTO banners (id, title, description, image_url, link_url, link_text, is_active, display_order) VALUES
  ('banner-1', 'Welcome to DNCL Wholesale', 'Premium quality tech products at wholesale prices', '/dncl-logo.png', '/', 'Shop Now', true, 1),
  ('banner-2', 'DNCL-TECHZONE', 'Your banner description', 'https://i.imgur.com/U6r3MSi.jpeg', '/', 'Shop Now', true, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO featured_products (id, product_id, type, is_active, display_order) VALUES
  ('featured-1', 'samsung-s25-ultra-512-blk-new', 'new', true, 1),
  ('featured-2', 'google-pixel-7-128-lock', 'featured', true, 2),
  ('featured-3', 'apple-ip-14-128-blk', 'featured', true, 3)
ON CONFLICT (id) DO NOTHING;
      `);
      return;
    }

    console.log('✅ Tables created via RPC!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTables();

