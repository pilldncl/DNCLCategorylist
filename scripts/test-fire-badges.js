// Test script to demonstrate the dynamic fire badge system
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseServiceKey = 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFireBadges() {
  console.log('🔥 Testing Dynamic Fire Badge System...\n');

  try {
    // Test 1: Check current trending data
    console.log('📊 Step 1: Checking current trending data...');
    const response = await fetch('http://localhost:3000/api/ranking/trending');
    const data = await response.json();
    
    console.log(`Found ${data.trending.length} trending products`);
    
    // Show fire badge information
    data.trending.forEach((product, index) => {
      if (product.hasFireBadge) {
        const position = product.fireBadgePosition;
        const timeRemaining = product.fireBadgeTimeRemaining;
        const minutesLeft = Math.ceil((timeRemaining || 0) / (60 * 1000));
        
        console.log(`🔥 Product: ${product.name} (${product.brand})`);
        console.log(`   Position: #${position}`);
        console.log(`   Time Remaining: ${minutesLeft} minutes`);
        console.log(`   Trending Score: ${product.trendingScore}`);
        console.log('');
      }
    });

    // Test 2: Simulate some interactions to create fire badges
    console.log('🎯 Step 2: Simulating interactions to create fire badges...');
    
    const testInteractions = [
      {
        type: 'product_view',
        productId: 'samsung-galaxy-s24',
        brand: 'SAMSUNG',
        timestamp: new Date().toISOString()
      },
      {
        type: 'result_click',
        productId: 'samsung-galaxy-s24',
        brand: 'SAMSUNG',
        timestamp: new Date().toISOString()
      },
      {
        type: 'product_view',
        productId: 'apple-iphone-15',
        brand: 'APPLE',
        timestamp: new Date().toISOString()
      },
      {
        type: 'result_click',
        productId: 'apple-iphone-15',
        brand: 'APPLE',
        timestamp: new Date().toISOString()
      },
      {
        type: 'search',
        searchTerm: 'google pixel',
        brand: 'GOOGLE',
        timestamp: new Date().toISOString()
      }
    ];

    // Send interactions to tracking endpoint
    const trackResponse = await fetch('http://localhost:3000/api/ranking/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interactions: testInteractions
      })
    });

    if (trackResponse.ok) {
      console.log('✅ Interactions tracked successfully');
    } else {
      console.log('❌ Failed to track interactions');
    }

    // Test 3: Check trending data again after interactions
    console.log('\n📊 Step 3: Checking trending data after interactions...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const response2 = await fetch('http://localhost:3000/api/ranking/trending?force=true');
    const data2 = await response2.json();
    
    console.log(`Found ${data2.trending.length} trending products after interactions`);
    
    // Show updated fire badge information
    data2.trending.forEach((product, index) => {
      if (product.hasFireBadge) {
        const position = product.fireBadgePosition;
        const timeRemaining = product.fireBadgeTimeRemaining;
        const minutesLeft = Math.ceil((timeRemaining || 0) / (60 * 1000));
        
        console.log(`🔥 Product: ${product.name} (${product.brand})`);
        console.log(`   Position: #${position}`);
        console.log(`   Time Remaining: ${minutesLeft} minutes`);
        console.log(`   Trending Score: ${product.trendingScore}`);
        console.log(`   Duration: ${position === 1 ? '2 hours' : position === 2 ? '1 hour' : '30 minutes'}`);
        console.log('');
      }
    });

    // Test 4: Show fire badge rules
    console.log('📋 Step 4: Fire Badge Rules Summary');
    console.log('• Position #1: 2 hours duration (Yellow to Orange gradient)');
    console.log('• Position #2: 1 hour duration (Orange to Red gradient)');
    console.log('• Position #3: 30 minutes duration (Red to Pink gradient)');
    console.log('• Only top 3 trending products get fire badges');
    console.log('• Badges automatically expire and update based on ranking changes');
    console.log('• Time remaining is shown in minutes');

    console.log('\n🎉 Fire Badge System Test Complete!');
    console.log('\n💡 To see the fire badges in action:');
    console.log('1. Visit http://localhost:3000');
    console.log('2. Enable "Show Ranking" in the filters');
    console.log('3. Look for 🔥 badges next to trending products');
    console.log('4. Check the "Popular Items" section for fire badges with position numbers');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFireBadges().catch(console.error);
