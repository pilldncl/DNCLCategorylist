const fetch = require('node-fetch');

async function testCatalogAPI() {
  console.log('🔍 Testing Catalog API...\n');

  try {
    // Test 1: Default limit (should be 20)
    console.log('1️⃣ Testing default limit...');
    const response1 = await fetch('http://localhost:3000/api/catalog');
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`✅ Default limit returned ${data1.items?.length || 0} products`);
      console.log(`📊 Total products available: ${data1.pagination?.total || 0}`);
    } else {
      console.log(`❌ API error: ${response1.status}`);
    }

    // Test 2: High limit (should get all products)
    console.log('\n2️⃣ Testing high limit...');
    const response2 = await fetch('http://localhost:3000/api/catalog?limit=1000');
    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`✅ High limit returned ${data2.items?.length || 0} products`);
      console.log(`📊 Total products available: ${data2.pagination?.total || 0}`);
    } else {
      console.log(`❌ API error: ${response2.status}`);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('💡 Make sure the server is running: npm run dev');
  }
}

// Run the test
testCatalogAPI().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.log('❌ Test failed:', error);
  process.exit(1);
});
