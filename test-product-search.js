const fetch = require('node-fetch');

async function testProductSearch() {
  try {
    console.log('🔍 Testing Product Search...');
    
    // Test catalog search
    const searchResponse = await fetch('http://localhost:3000/api/catalog/search?q=samsung&limit=3');
    const searchData = await searchResponse.json();
    
    console.log('Search Results:', searchData.items.length, 'products found');
    if (searchData.items.length > 0) {
      console.log('First product:', searchData.items[0].name, 'by', searchData.items[0].brand);
    }
    
    // Test adding a product to trending
    if (searchData.items.length > 0) {
      const testProduct = searchData.items[0];
      console.log('\n➕ Testing Add to Trending...');
      
      const addResponse = await fetch('http://localhost:3000/api/ranking/trending-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'addProduct',
          productId: testProduct.id,
          productName: testProduct.name,
          brand: testProduct.brand,
          initialScore: 100
        })
      });
      
      const addData = await addResponse.json();
      console.log('Add to Trending Response:', addData);
      
      // Check if product was added
      const trendingResponse = await fetch('http://localhost:3000/api/ranking/trending-db?force=true');
      const trendingData = await trendingResponse.json();
      
      const addedProduct = trendingData.trending.find(p => p.productId === testProduct.id);
      if (addedProduct) {
        console.log('✅ Product successfully added to trending with score:', addedProduct.trendingScore);
      } else {
        console.log('❌ Product not found in trending data');
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing product search:', error);
  }
}

testProductSearch();

