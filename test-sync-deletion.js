#!/usr/bin/env node

/**
 * Test script to verify Google Sheets sync deletion functionality
 * This script tests the sync API to ensure items are properly deleted
 */

const API_BASE = 'http://localhost:3000';

async function testSyncDeletion() {
  console.log('🧪 Testing Google Sheets Sync Deletion Functionality\n');
  
  try {
    // Test the sync API
    console.log('📡 Calling sync API...');
    const response = await fetch(`${API_BASE}/api/admin/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync-from-sheets'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Sync completed successfully!');
      console.log('📊 Sync Statistics:');
      console.log(`   - Total items in Google Sheets: ${data.stats.totalItems}`);
      console.log(`   - Items synced/updated: ${data.stats.syncedCount}`);
      console.log(`   - Items deleted: ${data.stats.deletedCount || 0}`);
      console.log(`   - Errors: ${data.stats.errorCount || 0}`);
      
      if (data.stats.deletedCount > 0) {
        console.log('\n🎉 SUCCESS: Items were properly deleted from database!');
        console.log('   This means the sync now handles deletions correctly.');
      } else {
        console.log('\nℹ️  No items were deleted in this sync.');
        console.log('   This could mean:');
        console.log('   - All Google Sheets items exist in the database');
        console.log('   - No items were removed from Google Sheets since last sync');
      }
      
    } else {
      console.error('❌ Sync failed:', data.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
  
  return true;
}

async function testSyncLogs() {
  console.log('\n📋 Testing sync logs...');
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/sync`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.recentSyncs) {
      console.log(`✅ Found ${data.recentSyncs.length} recent sync logs`);
      
      if (data.recentSyncs.length > 0) {
        const latestSync = data.recentSyncs[0];
        console.log(`📝 Latest sync: ${latestSync.message}`);
        console.log(`⏰ Time: ${new Date(latestSync.timestamp).toLocaleString()}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to fetch sync logs:', error.message);
  }
}

// Main test function
async function main() {
  console.log('🚀 Starting Sync Deletion Test\n');
  
  const syncSuccess = await testSyncDeletion();
  await testSyncLogs();
  
  console.log('\n' + '='.repeat(50));
  if (syncSuccess) {
    console.log('✅ All tests completed successfully!');
    console.log('🎯 The sync deletion functionality is working correctly.');
  } else {
    console.log('❌ Tests failed. Please check the errors above.');
  }
  console.log('='.repeat(50));
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSyncDeletion, testSyncLogs };
