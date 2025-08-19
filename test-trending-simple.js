#!/usr/bin/env node

const fetch = require('node-fetch');

async function testTrendingSystem() {
  console.log('🧪 Testing Trending System...');
  
  try {
    // Test 1: Send an interaction
    console.log('📊 Sending test interaction...');
    const interactionResponse = await fetch('http://localhost:3000/api/ranking/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'product_view',
        productId: 'PIXEL-8',
        brand: 'GOOGLE',
        sessionId: 'test-session-' + Date.now()
      })
    });
    
    const interactionResult = await interactionResponse.json();
    console.log('✅ Interaction result:', interactionResult);
    
    // Wait a moment for processing
    console.log('⏳ Waiting for processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Check trending API
    console.log('📈 Checking trending API...');
    const trendingResponse = await fetch('http://localhost:3000/api/ranking/trending-db?limit=5');
    const trendingResult = await trendingResponse.json();
    console.log('✅ Trending result:', JSON.stringify(trendingResult, null, 2));
    
    // Test 3: Check database directly
    console.log('🗄️ Checking database directly...');
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://tvzcqwdnsyqjglmwklkk.supabase.co',
      'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp'
    );
    
    const { data: trendingProducts, error } = await supabase
      .from('trending_products')
      .select('*');
    
    if (error) {
      console.error('❌ Database error:', error);
    } else {
      console.log('✅ Database products:', JSON.stringify(trendingProducts, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTrendingSystem();
