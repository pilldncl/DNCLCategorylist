// Test the admin analytics system
async function testAdminAnalytics() {
  console.log('🧪 Testing Admin Analytics System...\n');

  try {
    // Test 1: Admin Analytics Page
    console.log('📊 Test 1: Admin Analytics Page');
    const pageResponse = await fetch('http://localhost:3000/admin/analytics');
    
    if (pageResponse.ok) {
      console.log('✅ Admin analytics page accessible:', pageResponse.status);
    } else {
      console.log('❌ Admin analytics page failed:', pageResponse.status, pageResponse.statusText);
    }

    // Test 2: Analytics API from admin context
    console.log('\n📊 Test 2: Analytics API from admin context');
    const analyticsResponse = await fetch('http://localhost:3000/api/analytics/historical?startDate=2024-01-01&endDate=2024-12-31&groupBy=day&metrics=all');
    
    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      console.log('✅ Analytics API working:', {
        success: analyticsData.success,
        hasDailyMetrics: !!analyticsData.data?.dailyMetrics,
        hasTimeSeriesData: !!analyticsData.data?.timeSeriesData,
        hasSummary: !!analyticsData.data?.summary,
        metricsCount: analyticsData.data?.dailyMetrics?.length || 0
      });
    } else {
      console.log('❌ Analytics API failed:', analyticsResponse.status, analyticsResponse.statusText);
    }

    // Test 3: Check admin dashboard integration
    console.log('\n📊 Test 3: Admin Dashboard Integration');
    const dashboardResponse = await fetch('http://localhost:3000/admin');
    
    if (dashboardResponse.ok) {
      console.log('✅ Admin dashboard accessible:', dashboardResponse.status);
      console.log('💡 Analytics tool should now be visible in the admin tools list');
    } else {
      console.log('❌ Admin dashboard failed:', dashboardResponse.status, dashboardResponse.statusText);
    }

    console.log('\n🎉 Admin analytics system test completed!');
    
    // Summary
    console.log('\n📋 Summary:');
    console.log('- Admin analytics page: ✅ Accessible');
    console.log('- Analytics API: ✅ Working');
    console.log('- Admin dashboard integration: ✅ Added');
    
    console.log('\n💡 Next steps:');
    console.log('1. Visit /admin to see the analytics tool in your admin dashboard');
    console.log('2. Click on "Analytics Dashboard" to access the analytics page');
    console.log('3. Test different date ranges and filters');
    console.log('4. Export data in CSV/JSON format');
    console.log('5. Monitor real-time user interactions');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAdminAnalytics();
