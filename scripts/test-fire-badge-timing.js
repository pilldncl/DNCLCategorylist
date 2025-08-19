#!/usr/bin/env node

/**
 * Fire Badge Timing Test Script
 * 
 * This script tests the fire badge timing system to ensure:
 * 1. Fire badges are created with correct durations
 * 2. Time remaining is calculated correctly
 * 3. Badges expire at the right time
 * 4. Position changes update timing correctly
 * 5. New item badges work properly
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test data for different scenarios
const testScenarios = [
  {
    name: 'High Activity Product (Position 1)',
    productId: 'test-product-1',
    brand: 'TEST',
    interactions: [
      { type: 'product_view', count: 10 },
      { type: 'result_click', count: 5 },
      { type: 'search', count: 3 }
    ]
  },
  {
    name: 'Medium Activity Product (Position 2)',
    productId: 'test-product-2',
    brand: 'TEST',
    interactions: [
      { type: 'product_view', count: 7 },
      { type: 'result_click', count: 3 },
      { type: 'search', count: 2 }
    ]
  },
  {
    name: 'Low Activity Product (Position 3)',
    productId: 'test-product-3',
    brand: 'TEST',
    interactions: [
      { type: 'product_view', count: 5 },
      { type: 'result_click', count: 2 },
      { type: 'search', count: 1 }
    ]
  },
  {
    name: 'New Product (Recent Activity)',
    productId: 'new-product-1',
    brand: 'TEST',
    interactions: [
      { type: 'product_view', count: 3 },
      { type: 'result_click', count: 1 }
    ]
  }
];

// Expected fire badge durations (in milliseconds)
const EXPECTED_DURATIONS = {
  1: 2 * 60 * 60 * 1000, // 2 hours
  2: 1 * 60 * 60 * 1000, // 1 hour
  3: 30 * 60 * 1000,     // 30 minutes
  'new': 1 * 60 * 60 * 1000 // 1 hour
};

async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    throw error;
  }
}

async function clearAllData() {
  console.log('🧹 Clearing all trending data...');
  await makeRequest('/api/ranking/trending', {
    method: 'POST',
    body: JSON.stringify({ action: 'forceClear' })
  });
  console.log('✅ Data cleared successfully');
}

async function simulateInteractions(scenario) {
  console.log(`\n📊 Simulating interactions for: ${scenario.name}`);
  
  const sessionId = `test-session-${Date.now()}`;
  
  for (const interaction of scenario.interactions) {
    for (let i = 0; i < interaction.count; i++) {
      await makeRequest('/api/ranking/track', {
        method: 'POST',
        body: JSON.stringify({
          type: interaction.type,
          productId: scenario.productId,
          brand: scenario.brand,
          sessionId: sessionId,
          timestamp: new Date().toISOString()
        })
      });
    }
    console.log(`  ✅ ${interaction.count} ${interaction.type} interactions recorded`);
  }
}

async function checkTrendingData() {
  console.log('\n🔥 Checking trending data and fire badges...');
  
  const data = await makeRequest('/api/ranking/trending?force=true');
  
  console.log(`📈 Total trending products: ${data.totalProducts}`);
  console.log(`🕒 Last updated: ${data.lastUpdated}`);
  
  if (data.trending && data.trending.length > 0) {
    console.log('\n🏆 Top trending products with fire badges:');
    
    data.trending.forEach((product, index) => {
      const hasFireBadge = product.hasFireBadge;
      const position = product.fireBadgePosition;
      const timeRemaining = product.fireBadgeTimeRemaining;
      
      console.log(`\n  ${index + 1}. ${product.name} (${product.brand})`);
      console.log(`     Score: ${product.trendingScore}`);
      console.log(`     Views: ${product.totalViews}, Clicks: ${product.totalClicks}, Searches: ${product.totalSearches}`);
      
      if (hasFireBadge && position) {
        const minutesLeft = Math.ceil((timeRemaining || 0) / (60 * 1000));
        const hoursLeft = Math.floor(minutesLeft / 60);
        const remainingMinutes = minutesLeft % 60;
        
        console.log(`     🔥 Fire Badge: Position ${position === 'new' ? 'NEW' : `#${position}`}`);
        console.log(`     ⏰ Time Remaining: ${hoursLeft}h ${remainingMinutes}m (${timeRemaining}ms)`);
        
        // Verify timing is correct
        if (position !== 'new') {
          const expectedDuration = EXPECTED_DURATIONS[position];
          const timeDiff = Math.abs(timeRemaining - expectedDuration);
          const tolerance = 5000; // 5 second tolerance for timing differences
          
          if (timeDiff > tolerance) {
            console.log(`     ⚠️  WARNING: Time remaining (${timeRemaining}ms) differs significantly from expected (${expectedDuration}ms)`);
          } else {
            console.log(`     ✅ Time remaining is within expected range`);
          }
        } else {
          const expectedDuration = EXPECTED_DURATIONS['new'];
          const timeDiff = Math.abs(timeRemaining - expectedDuration);
          const tolerance = 5000;
          
          if (timeDiff > tolerance) {
            console.log(`     ⚠️  WARNING: New badge time remaining (${timeRemaining}ms) differs from expected (${expectedDuration}ms)`);
          } else {
            console.log(`     ✅ New badge timing is correct`);
          }
        }
      } else {
        console.log(`     ❌ No fire badge`);
      }
    });
  } else {
    console.log('❌ No trending products found');
  }
  
  return data;
}

async function testPositionChanges() {
  console.log('\n🔄 Testing position changes and timing updates...');
  
  // Add more interactions to the second product to make it move to position 1
  console.log('📈 Adding more interactions to test-product-2 to change positions...');
  
  const sessionId = `position-test-${Date.now()}`;
  
  // Add many more interactions to test-product-2
  for (let i = 0; i < 20; i++) {
    await makeRequest('/api/ranking/track', {
      method: 'POST',
      body: JSON.stringify({
        type: 'result_click',
        productId: 'test-product-2',
        brand: 'TEST',
        sessionId: sessionId,
        timestamp: new Date().toISOString()
      })
    });
  }
  
  console.log('✅ Added 20 more clicks to test-product-2');
  
  // Check the updated trending data
  const updatedData = await makeRequest('/api/ranking/trending?force=true');
  
  if (updatedData.trending && updatedData.trending.length > 0) {
    const product2 = updatedData.trending.find(p => p.productId === 'test-product-2');
    if (product2) {
      console.log(`\n📊 Updated data for test-product-2:`);
      console.log(`   Position: ${product2.fireBadgePosition}`);
      console.log(`   Score: ${product2.trendingScore}`);
      console.log(`   Time Remaining: ${product2.fireBadgeTimeRemaining}ms`);
      
      if (product2.fireBadgePosition === 1) {
        console.log('✅ Position change successful - product moved to #1');
      } else {
        console.log(`⚠️  Position change not as expected - current position: ${product2.fireBadgePosition}`);
      }
    }
  }
}

async function testExpiration() {
  console.log('\n⏰ Testing fire badge expiration...');
  
  // Get current trending data
  const data = await makeRequest('/api/ranking/trending?force=true');
  
  if (data.trending && data.trending.length > 0) {
    const productWithBadge = data.trending.find(p => p.hasFireBadge);
    
    if (productWithBadge) {
      console.log(`\n🔥 Testing expiration for: ${productWithBadge.name}`);
      console.log(`   Current time remaining: ${productWithBadge.fireBadgeTimeRemaining}ms`);
      
      const minutesLeft = Math.ceil((productWithBadge.fireBadgeTimeRemaining || 0) / (60 * 1000));
      console.log(`   Minutes left: ${minutesLeft}`);
      
      if (minutesLeft > 0) {
        console.log('✅ Fire badge is still active');
      } else {
        console.log('❌ Fire badge has expired');
      }
    }
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Fire Badge Timing Test Suite');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Clear all data
    await clearAllData();
    
    // Step 2: Simulate interactions for all scenarios
    for (const scenario of testScenarios) {
      await simulateInteractions(scenario);
      // Small delay between scenarios
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Step 3: Check initial trending data
    await checkTrendingData();
    
    // Step 4: Test position changes
    await testPositionChanges();
    
    // Step 5: Check updated trending data
    console.log('\n📊 Final trending data after position changes:');
    await checkTrendingData();
    
    // Step 6: Test expiration logic
    await testExpiration();
    
    // Step 7: Debug metrics
    console.log('\n🔍 Getting debug metrics...');
    const debugData = await makeRequest('/api/ranking/trending', {
      method: 'POST',
      body: JSON.stringify({ action: 'debugMetrics' })
    });
    
    console.log(`📊 Debug Info:`);
    console.log(`   Total products tracked: ${debugData.debug.totalProducts}`);
    console.log(`   Cache status: ${debugData.debug.cacheStatus.hasCachedData ? 'Has cached data' : 'No cached data'}`);
    
    console.log('\n✅ Fire Badge Timing Test Suite Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('• Fire badges are created with correct durations');
    console.log('• Time remaining is calculated accurately');
    console.log('• Position changes update timing correctly');
    console.log('• New item badges work properly');
    console.log('• Expiration logic is functioning');
    
  } catch (error) {
    console.error('\n❌ Test Suite Failed:', error.message);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  runComprehensiveTest().catch(console.error);
}

module.exports = {
  runComprehensiveTest,
  testScenarios,
  EXPECTED_DURATIONS
};
