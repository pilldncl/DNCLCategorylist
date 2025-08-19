#!/usr/bin/env node

const fetch = require('node-fetch');

async function testDashboardStats() {
  console.log('🧪 Testing Dashboard Stats API...');
  
  try {
    // Test the dashboard stats endpoint
    console.log('📊 Fetching dashboard statistics...');
    const response = await fetch('http://localhost:3000/api/admin/dashboard-stats');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Dashboard stats response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n📈 Dashboard Statistics:');
      console.log(`   Total Brands: ${data.stats.totalBrands}`);
      console.log(`   Total Products: ${data.stats.totalProducts}`);
      console.log(`   Trending Products: ${data.stats.trendingProducts}`);
      console.log(`   Active Users (24h): ${data.stats.activeUsers}`);
      console.log(`   Total Interactions: ${data.stats.totalInteractions}`);
      console.log(`   Active Fire Badges: ${data.stats.fireBadges}`);
      console.log(`   Dynamic Images: ${data.stats.dynamicImages}`);
      console.log(`   Last Updated: ${new Date(data.stats.lastUpdated).toLocaleString()}`);
    } else {
      console.log('❌ API returned error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDashboardStats();
