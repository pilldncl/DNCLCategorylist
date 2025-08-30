// Test database structure to see what columns exist
const fetch = require('node-fetch');

async function testDatabaseStructure() {
  try {
    console.log('🔍 Testing database structure...\n');
    
    // Test 1: Try to add a product without admin_score
    console.log('📡 Test 1: Add product without admin_score');
    const addResponse = await fetch('http://localhost:3000/api/ranking/trending-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addProduct',
        productId: 'test-product-' + Date.now(),
        productName: 'Test Product',
        brand: 'TEST',
        initialScore: 100
      })
    });
    
    const addResult = await addResponse.json();
    console.log('  📊 Add product result:', addResult);
    
    // Test 2: Check if we can get any data from the base table
    console.log('\n📡 Test 2: Check base table data');
    const baseResponse = await fetch('http://localhost:3000/api/ranking/trending-db?limit=1&force=true');
    const baseData = await baseResponse.json();
    console.log('  📊 Base table response:', baseData);
    
    // Test 3: Try to get config to see if database connection works
    console.log('\n📡 Test 3: Check config');
    const configResponse = await fetch('http://localhost:3000/api/ranking/trending-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getConfig'
      })
    });
    
    const configResult = await configResponse.json();
    console.log('  📊 Config result:', configResult);
    
    // Test 4: Try to manually sync some interactions
    console.log('\n📡 Test 4: Try to sync interactions');
    const syncResponse = await fetch('http://localhost:3000/api/ranking/trending-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sync',
        interactions: [{
          type: 'product_view',
          productId: 'test-product-123',
          brand: 'TEST'
        }]
      })
    });
    
    const syncResult = await syncResponse.json();
    console.log('  📊 Sync result:', syncResult);
    
    console.log('\n🔍 Database Structure Analysis:');
    if (addResult.error) {
      console.log('  ❌ Cannot add products - likely missing admin_score column');
      console.log('  💡 Need to run the admin_score migration first');
    } else {
      console.log('  ✅ Can add products successfully');
    }
    
    if (configResult.success) {
      console.log('  ✅ Database connection works');
      console.log('  📊 Metrics count:', configResult.metricsCount);
    } else {
      console.log('  ❌ Database connection issues');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testDatabaseStructure();

