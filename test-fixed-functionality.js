const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFixedFunctionality() {
  console.log('🧪 Testing Fixed Interaction, Trending, and Brand Analytics Systems...\n');

  try {
    // Test 1: Send a test interaction
    console.log('1️⃣ Testing interaction tracking...');
    const testInteraction = {
      type: 'product_view',
      productId: 'test-fixed-product-123',
      brand: 'APPLE',
      sessionId: `test-fixed-session-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    const interactionResponse = await fetch('http://localhost:3000/api/ranking/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testInteraction)
    });

    if (interactionResponse.ok) {
      console.log('✅ Interaction tracking working');
      const result = await interactionResponse.json();
      console.log('📊 Interaction result:', result);
    } else {
      console.log('❌ Interaction tracking failed:', await interactionResponse.text());
    }

    // Test 2: Test trending API
    console.log('\n2️⃣ Testing trending API...');
    const trendingResponse = await fetch('http://localhost:3000/api/ranking/trending-db');
    
    if (trendingResponse.ok) {
      const trendingData = await trendingResponse.json();
      console.log('✅ Trending API working');
      console.log(`📊 Found ${trendingData.trending?.length || 0} trending products`);
      if (trendingData.trending && trendingData.trending.length > 0) {
        console.log('📊 Sample trending product:', trendingData.trending[0]);
      }
    } else {
      console.log('❌ Trending API failed:', await trendingResponse.text());
    }

    // Test 3: Test brand analytics API
    console.log('\n3️⃣ Testing brand analytics API...');
    const brandsResponse = await fetch('http://localhost:3000/api/ranking/brands');
    
    if (brandsResponse.ok) {
      const brandsData = await brandsResponse.json();
      console.log('✅ Brand analytics API working');
      console.log(`📊 Found ${brandsData.brands?.length || 0} brands`);
      console.log(`📊 Total interactions: ${brandsData.summary?.totalInteractions || 0}`);
      if (brandsData.brands && brandsData.brands.length > 0) {
        console.log('📊 Top brand:', brandsData.brands[0]);
      }
    } else {
      console.log('❌ Brand analytics API failed:', await brandsResponse.text());
    }

    // Test 4: Test specific brand analytics
    console.log('\n4️⃣ Testing specific brand analytics...');
    const appleBrandResponse = await fetch('http://localhost:3000/api/ranking/brands?brand=APPLE');
    
    if (appleBrandResponse.ok) {
      const appleData = await appleBrandResponse.json();
      console.log('✅ Specific brand analytics working');
      console.log('📊 APPLE brand analytics:', {
        totalInteractions: appleData.brand?.totalInteractions,
        brandScore: appleData.brand?.brandScore,
        productCount: appleData.brand?.productCount
      });
    } else {
      console.log('❌ Specific brand analytics failed:', await appleBrandResponse.text());
    }

    // Test 5: Check database state
    console.log('\n5️⃣ Checking database state...');
    
    const { count: interactionsCount } = await supabase
      .from('user_interactions')
      .select('*', { count: 'exact', head: true });

    const { count: trendingCount } = await supabase
      .from('trending_products')
      .select('*', { count: 'exact', head: true });

    const { count: fireBadgesCount } = await supabase
      .from('fire_badges')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Database Summary:`);
    console.log(`   - User Interactions: ${interactionsCount}`);
    console.log(`   - Trending Products: ${trendingCount}`);
    console.log(`   - Fire Badges: ${fireBadgesCount}`);

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Wait for server to start
setTimeout(testFixedFunctionality, 3000);

