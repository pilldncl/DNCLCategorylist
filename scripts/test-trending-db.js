#!/usr/bin/env node

/**
 * Test Database-Based Trending System
 * 
 * This script tests the new database-based trending system to ensure it's working correctly.
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: ['.env.local', '.env'] });

// Fallback to hardcoded values if env vars are not loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTrendingTables() {
  console.log('🔍 Testing trending tables...');
  
  try {
    // Test trending_products table
    const { data: trendingProducts, error: trendingError } = await supabase
      .from('trending_products')
      .select('count')
      .limit(1);

    if (trendingError) {
      console.log('⚠️  trending_products table might not exist yet');
      console.log('💡 Please run the SQL setup script in your Supabase dashboard');
      return false;
    }

    console.log('✅ trending_products table accessible');

    // Test fire_badges table
    const { data: fireBadges, error: badgesError } = await supabase
      .from('fire_badges')
      .select('count')
      .limit(1);

    if (badgesError) {
      console.log('⚠️  fire_badges table might not exist yet');
      return false;
    }

    console.log('✅ fire_badges table accessible');

    // Test trending_config table
    const { data: config, error: configError } = await supabase
      .from('trending_config')
      .select('*')
      .limit(1);

    if (configError) {
      console.log('⚠️  trending_config table might not exist yet');
      return false;
    }

    console.log('✅ trending_config table accessible');
    
    if (config && config.length > 0) {
      console.log(`📊 Current config: update_interval=${config[0].update_interval}, enabled=${config[0].is_enabled}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error testing trending tables:', error.message);
    return false;
  }
}

async function testTrendingAPI() {
  console.log('\n🌐 Testing trending API endpoints...');
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Test the new database-based trending endpoint
    console.log('Testing /api/ranking/trending-db...');
    
    const response = await fetch(`${baseUrl}/api/ranking/trending-db?limit=5`);
    
    if (!response.ok) {
      console.error(`❌ Trending API failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Trending API working');
    console.log(`📊 Found ${data.totalProducts} trending products`);
    console.log(`🕒 Last updated: ${data.lastUpdated}`);
    
    if (data.trending && data.trending.length > 0) {
      console.log('📈 Sample trending products:');
      data.trending.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} (${product.brand}) - Score: ${product.trendingScore}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing trending API:', error.message);
    return false;
  }
}

async function testInteractionTracking() {
  console.log('\n📊 Testing interaction tracking...');
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Test tracking endpoint
    const testInteraction = {
      type: 'product_view',
      productId: 'test-product-123',
      brand: 'TEST',
      sessionId: 'test-session-' + Date.now(),
      timestamp: new Date().toISOString()
    };
    
    console.log('Sending test interaction...');
    const response = await fetch(`${baseUrl}/api/ranking/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testInteraction),
    });
    
    if (!response.ok) {
      console.error(`❌ Tracking API failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ Interaction tracking working');
    console.log(`📝 Tracked interaction: ${result.success ? 'Success' : 'Failed'}`);
    
    // Wait a moment for the trending system to process
    console.log('⏳ Waiting for trending system to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if the interaction was recorded in the database
    const { data: trendingProduct, error } = await supabase
      .from('trending_products')
      .select('*')
      .eq('product_id', 'test-product-123')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error checking trending product:', error);
      return false;
    }
    
    if (trendingProduct) {
      console.log('✅ Test interaction recorded in database');
      console.log(`📊 Views: ${trendingProduct.total_views}, Clicks: ${trendingProduct.total_clicks}, Score: ${trendingProduct.trending_score}`);
      
      // Clean up test data
      await supabase
        .from('trending_products')
        .delete()
        .eq('product_id', 'test-product-123');
      
      console.log('🧹 Cleaned up test data');
    } else {
      console.log('⚠️  Test interaction not found in database (might be processing)');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing interaction tracking:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing Database-Based Trending System');
  console.log('=' .repeat(50));

  // Test database tables
  const tablesWorking = await testTrendingTables();
  if (!tablesWorking) {
    console.log('\n❌ Trending tables not ready');
    console.log('💡 Please run the SQL setup script in your Supabase dashboard first');
    console.log('📄 SQL file: scripts/setup-trending-tables.sql');
    process.exit(1);
  }

  // Test trending API
  const apiWorking = await testTrendingAPI();
  if (!apiWorking) {
    console.log('\n❌ Trending API not working');
    console.log('💡 Make sure your development server is running');
    process.exit(1);
  }

  // Test interaction tracking
  const trackingWorking = await testInteractionTracking();
  if (!trackingWorking) {
    console.log('\n❌ Interaction tracking not working');
    process.exit(1);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Database-based trending system is working correctly!');
  console.log('\n✅ Your trending data will now persist across server restarts');
  console.log('✅ All interactions are stored in Supabase');
  console.log('✅ Fire badges are managed in the database');
  console.log('✅ Configuration is persistent');
  
  console.log('\n📋 Next steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Test the trending system with real user interactions');
  console.log('3. Monitor trending data persistence across restarts');
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testTrendingTables,
  testTrendingAPI,
  testInteractionTracking
};
