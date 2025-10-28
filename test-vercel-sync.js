#!/usr/bin/env node

/**
 * Vercel Sync Test Script
 * Tests the sync functionality on Vercel deployment
 * Run this after deploying to Vercel to verify sync works
 */

const API_BASE = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'https://dncl-categorylist.vercel.app'; // Replace with your actual Vercel URL

async function testVercelSync() {
  console.log('🚀 Testing Vercel Sync Functionality\n');
  console.log(`📡 Testing against: ${API_BASE}\n`);
  
  try {
    // Test 1: Check sync status endpoint
    console.log('1️⃣ Testing sync status endpoint...');
    const statusResponse = await fetch(`${API_BASE}/api/admin/sync`);
    
    if (!statusResponse.ok) {
      const errorData = await statusResponse.json();
      console.error('❌ Sync status failed:', errorData);
      return false;
    }
    
    const statusData = await statusResponse.json();
    console.log('✅ Sync status endpoint working');
    console.log(`   Connection status: ${statusData.connectionStatus || 'unknown'}`);
    console.log(`   Recent syncs: ${statusData.recentSyncs?.length || 0}\n`);
    
    // Test 2: Test sync functionality
    console.log('2️⃣ Testing sync functionality...');
    const syncResponse = await fetch(`${API_BASE}/api/admin/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync-from-sheets'
      })
    });

    if (!syncResponse.ok) {
      const errorData = await syncResponse.json();
      console.error('❌ Sync failed:', errorData);
      
      if (errorData.error?.includes('Missing required environment variables')) {
        console.log('\n🔧 SOLUTION: Set these environment variables in Vercel:');
        console.log('   - NEXT_PUBLIC_SUPABASE_URL');
        console.log('   - SUPABASE_SERVICE_ROLE_KEY');
        console.log('   - SHEET_CSV_URL');
        console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY (optional)');
        console.log('\n📖 See VERCEL_ENVIRONMENT_SETUP.md for details');
      }
      
      return false;
    }

    const syncData = await syncResponse.json();
    
    if (syncData.success) {
      console.log('✅ Sync completed successfully!');
      console.log('📊 Sync Statistics:');
      console.log(`   - Total items in Google Sheets: ${syncData.stats.totalItems}`);
      console.log(`   - Items synced/updated: ${syncData.stats.syncedCount}`);
      console.log(`   - Items deleted: ${syncData.stats.deletedCount || 0}`);
      console.log(`   - Errors: ${syncData.stats.errorCount || 0}`);
      
      if (syncData.stats.syncedCount > 0) {
        console.log('\n🎉 SUCCESS: Sync is working correctly on Vercel!');
        console.log('   Items are being synced from Google Sheets to database.');
      } else {
        console.log('\n⚠️  WARNING: No items were synced.');
        console.log('   This could mean:');
        console.log('   - Google Sheets is empty');
        console.log('   - SHEET_CSV_URL is incorrect');
        console.log('   - Google Sheets format is invalid');
      }
      
    } else {
      console.error('❌ Sync failed:', syncData.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
  
  return true;
}

async function testEnvironmentVariables() {
  console.log('\n🔍 Environment Variables Check\n');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY', 
    'SHEET_CSV_URL'
  ];
  
  console.log('Required environment variables for sync:');
  requiredVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  
  console.log('\n💡 To set these in Vercel:');
  console.log('   1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('   2. Add each variable with its value');
  console.log('   3. Redeploy your project');
  console.log('\n📖 See VERCEL_ENVIRONMENT_SETUP.md for detailed instructions');
}

// Main test function
async function main() {
  console.log('🧪 Vercel Sync Test Suite\n');
  console.log('='.repeat(50));
  
  const syncSuccess = await testVercelSync();
  await testEnvironmentVariables();
  
  console.log('\n' + '='.repeat(50));
  if (syncSuccess) {
    console.log('✅ All tests passed! Sync is working on Vercel.');
  } else {
    console.log('❌ Tests failed. Check the errors above and fix the issues.');
    console.log('🔧 Most common fixes:');
    console.log('   - Set environment variables in Vercel dashboard');
    console.log('   - Redeploy your project after setting variables');
    console.log('   - Check Google Sheets is publicly accessible');
  }
  console.log('='.repeat(50));
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testVercelSync, testEnvironmentVariables };
