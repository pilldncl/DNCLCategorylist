// Simple test to check if trending_products table has data
const fetch = require('node-fetch');

async function testTrendingData() {
  try {
    console.log('🔍 Testing trending data through API...\n');
    
    // Test 1: Check if API is working at all
    console.log('📡 Test 1: Basic API connectivity');
    const response = await fetch('http://localhost:3000/api/ranking/trending-db?force=true');
    const data = await response.json();
    
    console.log('📊 API Response:');
    console.log('  Status:', response.status);
    console.log('  Trending products count:', data.trending?.length || 0);
    console.log('  Total products:', data.totalProducts);
    console.log('  Config enabled:', data.config?.isEnabled);
    
    if (data.trending && data.trending.length > 0) {
      console.log('  Sample product:', data.trending[0]);
    } else {
      console.log('❌ No trending products returned');
    }
    
    // Test 2: Check if we can manually add some data
    console.log('\n📡 Test 2: Try to add a test product to trending');
    const addResponse = await fetch('http://localhost:3000/api/ranking/trending-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addProduct',
        productId: 'test-product-123',
        productName: 'Test Product',
        brand: 'TEST',
        initialScore: 100
      })
    });
    
    const addResult = await addResponse.json();
    console.log('  Add product response:', addResult);
    
    // Test 3: Check data again
    console.log('\n📡 Test 3: Check data after adding test product');
    const response2 = await fetch('http://localhost:3000/api/ranking/trending-db?force=true');
    const data2 = await response2.json();
    
    console.log('📊 Updated API Response:');
    console.log('  Trending products count:', data2.trending?.length || 0);
    console.log('  Total products:', data2.totalProducts);
    
    if (data2.trending && data2.trending.length > 0) {
      console.log('  Products:');
      data2.trending.forEach((product, index) => {
        console.log(`    ${index + 1}. ${product.name} (Score: ${product.trendingScore}, Admin: ${product.adminScore || 0})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testTrendingData();

