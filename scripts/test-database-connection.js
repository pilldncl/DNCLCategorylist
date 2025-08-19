#!/usr/bin/env node

/**
 * Database Connection Test Script
 * 
 * This script tests the Supabase database connection for the image system.
 * It's a lightweight test that doesn't require existing data.
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: ['.env.local', '.env'] });

// Fallback to hardcoded values if env vars are not loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

console.log('🔍 Testing Supabase Database Connection');
console.log('=' .repeat(50));

// Check environment variables
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  console.log('💡 Please add it to your .env.local file');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
  console.log('💡 Please add it to your .env.local file');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`📡 Supabase URL: ${supabaseUrl}`);
console.log(`🔑 Service Key: ${supabaseServiceKey.substring(0, 20)}...`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('\n🔄 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('dynamic_images')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      
      if (error.message.includes('relation "dynamic_images" does not exist')) {
        console.log('\n💡 The dynamic_images table does not exist.');
        console.log('   Please run the SQL schema setup in your Supabase dashboard:');
        console.log('\n   CREATE TABLE dynamic_images (');
        console.log('     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,');
        console.log('     device VARCHAR(255) NOT NULL,');
        console.log('     model VARCHAR(255) NOT NULL,');
        console.log('     brand VARCHAR(255) NOT NULL,');
        console.log('     image_urls TEXT[] NOT NULL,');
        console.log('     created_at TIMESTAMP DEFAULT NOW(),');
        console.log('     updated_at TIMESTAMP DEFAULT NOW(),');
        console.log('     UNIQUE(device, model, brand)');
        console.log('   );');
      }
      
      return false;
    }
    
    console.log('✅ Database connection successful!');
    
    // Test table structure
    console.log('\n🔍 Checking table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('dynamic_images')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table structure error:', tableError.message);
      return false;
    }
    
    console.log('✅ Table structure is correct');
    
    // Test insert/update operations
    console.log('\n🧪 Testing write operations...');
    
    const testData = {
      device: 'TEST',
      model: 'CONNECTION',
      brand: 'SUPABASE',
      image_urls: ['https://example.com/test.jpg'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Try to insert test data
    const { error: insertError } = await supabase
      .from('dynamic_images')
      .insert(testData);
    
    if (insertError) {
      console.error('❌ Insert operation failed:', insertError.message);
      return false;
    }
    
    console.log('✅ Insert operation successful');
    
    // Clean up test data
    const { error: deleteError } = await supabase
      .from('dynamic_images')
      .delete()
      .eq('device', 'TEST')
      .eq('model', 'CONNECTION')
      .eq('brand', 'SUPABASE');
    
    if (deleteError) {
      console.warn('⚠️  Could not clean up test data:', deleteError.message);
    } else {
      console.log('✅ Delete operation successful');
    }
    
    // Get current data count
    const { count, error: countError } = await supabase
      .from('dynamic_images')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.warn('⚠️  Could not get record count:', countError.message);
    } else {
      console.log(`📊 Current records in database: ${count}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function main() {
  const success = await testConnection();
  
  console.log('\n' + '=' .repeat(50));
  
  if (success) {
    console.log('🎉 Database connection test PASSED!');
    console.log('\n✅ Your Supabase setup is working correctly');
    console.log('✅ You can now run: npm run migrate-images');
    console.log('✅ And use the admin interface at /admin/images');
  } else {
    console.log('❌ Database connection test FAILED');
    console.log('\n💡 Please check:');
    console.log('   1. Your .env.local file has correct values');
    console.log('   2. Your Supabase project is active');
    console.log('   3. The dynamic_images table exists');
    console.log('   4. Your service role key has proper permissions');
  }
  
  console.log('\n📖 For setup help, see: SUPABASE_SETUP_GUIDE.md');
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testConnection
};
