#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function testDatabaseInsert() {
  console.log('🧪 Testing Database Insert...');
  
  const supabase = createClient(
    'https://tvzcqwdnsyqjglmwklkk.supabase.co',
    'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp'
  );
  
  try {
    // Test direct database insert
    const testProduct = {
      product_id: 'TEST-PRODUCT-123',
      brand: 'TEST',
      name: 'Test Product',
      total_views: 1,
      total_clicks: 0,
      total_searches: 0,
      trending_score: 3,
      last_interaction: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Inserting test product:', testProduct);
    
    const { data, error } = await supabase
      .from('trending_products')
      .insert(testProduct);
    
    if (error) {
      console.error('❌ Insert error:', error);
    } else {
      console.log('✅ Insert successful:', data);
    }
    
    // Check if it was inserted
    const { data: products, error: fetchError } = await supabase
      .from('trending_products')
      .select('*')
      .eq('product_id', 'TEST-PRODUCT-123');
    
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
    } else {
      console.log('✅ Found products:', products);
    }
    
    // Clean up
    await supabase
      .from('trending_products')
      .delete()
      .eq('product_id', 'TEST-PRODUCT-123');
    
    console.log('🧹 Cleaned up test data');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDatabaseInsert();
