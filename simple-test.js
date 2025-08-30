// Simple test to see the actual error
const fetch = require('node-fetch');

async function simpleTest() {
  try {
    console.log('🔍 Simple test to see actual error...\n');
    
    // Test 1: Try to add a product and see the full error
    console.log('📡 Test 1: Add product with detailed error');
    const addResponse = await fetch('http://localhost:3000/api/ranking/trending-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addProduct',
        productId: 'simple-test-' + Date.now(),
        productName: 'Simple Test Product',
        brand: 'TEST',
        initialScore: 100
      })
    });
    
    const addResult = await addResponse.json();
    console.log('  📊 Full response:', JSON.stringify(addResult, null, 2));
    
    // Test 2: Check if there are any products in the database
    console.log('\n📡 Test 2: Check existing products');
    const checkResponse = await fetch('http://localhost:3000/api/ranking/trending-db?limit=100&force=true');
    const checkResult = await checkResponse.json();
    console.log('  📊 Check result:', JSON.stringify(checkResult, null, 2));
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

simpleTest();

