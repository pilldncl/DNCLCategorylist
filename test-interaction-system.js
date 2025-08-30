const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInteractionSystem() {
  console.log('🧪 Testing Interaction, Trending, and Brand Analytics Systems...\n');

  try {
    // Test 1: Check if user_interactions table has data
    console.log('1️⃣ Checking user_interactions table...');
    const { data: interactions, error: interactionsError } = await supabase
      .from('user_interactions')
      .select('*')
      .limit(5);

    if (interactionsError) {
      console.log('❌ Error fetching interactions:', interactionsError);
    } else {
      console.log(`✅ Found ${interactions.length} interactions in database`);
      if (interactions.length > 0) {
        console.log('📊 Sample interaction:', interactions[0]);
      }
    }

    // Test 2: Check if trending_products table has data
    console.log('\n2️⃣ Checking trending_products table...');
    const { data: trending, error: trendingError } = await supabase
      .from('trending_products')
      .select('*')
      .limit(5);

    if (trendingError) {
      console.log('❌ Error fetching trending products:', trendingError);
    } else {
      console.log(`✅ Found ${trending.length} trending products in database`);
      if (trending.length > 0) {
        console.log('📊 Sample trending product:', trending[0]);
      }
    }

    // Test 3: Check if fire_badges table has data
    console.log('\n3️⃣ Checking fire_badges table...');
    const { data: fireBadges, error: fireBadgesError } = await supabase
      .from('fire_badges')
      .select('*')
      .limit(5);

    if (fireBadgesError) {
      console.log('❌ Error fetching fire badges:', fireBadgesError);
    } else {
      console.log(`✅ Found ${fireBadges.length} fire badges in database`);
      if (fireBadges.length > 0) {
        console.log('📊 Sample fire badge:', fireBadges[0]);
      }
    }

    // Test 4: Test API endpoints
    console.log('\n4️⃣ Testing API endpoints...');
    
    // Test interaction tracking
    const testInteraction = {
      type: 'product_view',
      productId: 'test-product-123',
      brand: 'APPLE',
      sessionId: `test-session-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    console.log('📤 Sending test interaction...');
    const interactionResponse = await fetch('http://localhost:3000/api/ranking/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testInteraction)
    });

    if (interactionResponse.ok) {
      console.log('✅ Interaction tracking API working');
    } else {
      console.log('❌ Interaction tracking API failed:', await interactionResponse.text());
    }

    // Test trending API
    console.log('📤 Testing trending API...');
    const trendingResponse = await fetch('http://localhost:3000/api/ranking/trending-db');
    
    if (trendingResponse.ok) {
      const trendingData = await trendingResponse.json();
      console.log('✅ Trending API working, found', trendingData.trending?.length || 0, 'trending products');
    } else {
      console.log('❌ Trending API failed:', await trendingResponse.text());
    }

    // Test brand analytics API
    console.log('📤 Testing brand analytics API...');
    const brandsResponse = await fetch('http://localhost:3000/api/ranking/brands');
    
    if (brandsResponse.ok) {
      const brandsData = await brandsResponse.json();
      console.log('✅ Brand analytics API working, found', brandsData.brands?.length || 0, 'brands');
    } else {
      console.log('❌ Brand analytics API failed:', await brandsResponse.text());
    }

    // Test 5: Check database counts
    console.log('\n5️⃣ Checking database counts...');
    
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

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Wait for server to start
setTimeout(testInteractionSystem, 3000);

