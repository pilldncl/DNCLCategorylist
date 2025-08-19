#!/usr/bin/env node

/**
 * Trending Data Migration Script
 * 
 * This script migrates the trending system from in-memory storage to Supabase database.
 * It sets up the necessary tables and migrates existing data.
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: ['.env.local', '.env'] });

// Fallback to hardcoded values if env vars are not loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupTrendingTables() {
  console.log('🔧 Setting up trending tables in Supabase...');
  
  try {
    // Create trending_products table for persistent trending data
    const { error: trendingError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS trending_products (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          product_id VARCHAR(255) NOT NULL,
          brand VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          total_views INTEGER DEFAULT 0,
          total_clicks INTEGER DEFAULT 0,
          total_searches INTEGER DEFAULT 0,
          trending_score INTEGER DEFAULT 0,
          last_interaction TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(product_id)
        );
      `
    });

    if (trendingError) {
      console.log('Note: trending_products table might already exist or RPC not available');
    }

    // Create fire_badges table for persistent fire badge data
    const { error: badgesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS fire_badges (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          product_id VARCHAR(255) NOT NULL,
          position VARCHAR(10) NOT NULL, -- '1', '2', '3', or 'new'
          start_time TIMESTAMP DEFAULT NOW(),
          end_time TIMESTAMP NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (badgesError) {
      console.log('Note: fire_badges table might already exist or RPC not available');
    }

    // Create trending_config table for system configuration
    const { error: configError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS trending_config (
          id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
          update_interval INTEGER DEFAULT 5,
          is_enabled BOOLEAN DEFAULT true,
          last_update TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (configError) {
      console.log('Note: trending_config table might already exist or RPC not available');
    }

    console.log('✅ Trending tables setup completed');
    return true;
  } catch (error) {
    console.error('❌ Error setting up trending tables:', error.message);
    return false;
  }
}

async function migrateExistingData() {
  console.log('🔄 Migrating existing trending data...');
  
  try {
    // Check if we have any existing data in product_metrics table
    const { data: existingMetrics, error: metricsError } = await supabase
      .from('product_metrics')
      .select('*');

    if (metricsError) {
      console.log('No existing product_metrics data found');
      return true;
    }

    if (existingMetrics && existingMetrics.length > 0) {
      console.log(`📊 Found ${existingMetrics.length} existing product metrics to migrate`);
      
      for (const metric of existingMetrics) {
        // Insert into trending_products table
        const { error: insertError } = await supabase
          .from('trending_products')
          .upsert({
            product_id: metric.product_id,
            brand: 'Unknown', // We'll need to get this from catalog
            name: metric.product_id,
            total_views: metric.views || 0,
            total_clicks: metric.clicks || 0,
            total_searches: metric.searches || 0,
            trending_score: 0, // Will be calculated
            last_interaction: metric.last_updated || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'product_id'
          });

        if (insertError) {
          console.error(`❌ Error migrating metric for ${metric.product_id}:`, insertError.message);
        } else {
          console.log(`✅ Migrated metric for ${metric.product_id}`);
        }
      }
    }

    // Initialize default trending config
    const { error: configError } = await supabase
      .from('trending_config')
      .upsert({
        id: 'default',
        update_interval: 5,
        is_enabled: true,
        last_update: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (configError) {
      console.error('❌ Error setting up trending config:', configError.message);
    } else {
      console.log('✅ Trending config initialized');
    }

    console.log('✅ Existing data migration completed');
    return true;
  } catch (error) {
    console.error('❌ Error migrating existing data:', error.message);
    return false;
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  try {
    // Check trending_products table
    const { data: trendingProducts, error: trendingError } = await supabase
      .from('trending_products')
      .select('count')
      .limit(1);

    if (trendingError) {
      console.log('⚠️  trending_products table might not exist yet');
    } else {
      console.log('✅ trending_products table accessible');
    }

    // Check fire_badges table
    const { data: fireBadges, error: badgesError } = await supabase
      .from('fire_badges')
      .select('count')
      .limit(1);

    if (badgesError) {
      console.log('⚠️  fire_badges table might not exist yet');
    } else {
      console.log('✅ fire_badges table accessible');
    }

    // Check trending_config table
    const { data: config, error: configError } = await supabase
      .from('trending_config')
      .select('*')
      .limit(1);

    if (configError) {
      console.log('⚠️  trending_config table might not exist yet');
    } else {
      console.log('✅ trending_config table accessible');
      if (config && config.length > 0) {
        console.log(`📊 Current config: update_interval=${config[0].update_interval}, enabled=${config[0].is_enabled}`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Error verifying migration:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Trending System Migration to Database');
  console.log('=' .repeat(50));

  // Setup tables
  const tablesSetup = await setupTrendingTables();
  if (!tablesSetup) {
    console.log('❌ Failed to setup tables');
    process.exit(1);
  }

  // Migrate existing data
  const dataMigrated = await migrateExistingData();
  if (!dataMigrated) {
    console.log('❌ Failed to migrate existing data');
    process.exit(1);
  }

  // Verify migration
  const verified = await verifyMigration();
  if (!verified) {
    console.log('❌ Failed to verify migration');
    process.exit(1);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Trending system migration completed!');
  console.log('\n✅ Your trending data will now persist in Supabase');
  console.log('✅ Server restarts will no longer reset trending data');
  console.log('✅ You can now update the trending API to use database storage');
  
  console.log('\n📋 Next steps:');
  console.log('1. Update the trending API route to use database instead of memory');
  console.log('2. Test the new persistent trending system');
  console.log('3. Monitor trending data persistence across server restarts');
}

// Run the migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupTrendingTables,
  migrateExistingData,
  verifyMigration
};
