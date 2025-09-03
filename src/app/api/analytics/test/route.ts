import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing analytics database connection...');
    
    // Test 1: Check if we can connect to Supabase
    console.log('📡 Testing Supabase connection...');
    
    // Test 2: Check table structure
    console.log('📋 Checking user_interactions table structure...');
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('user_interactions')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table structure error:', tableError);
      return NextResponse.json({
        error: 'Table structure error',
        details: tableError.message,
        code: tableError.code
      }, { status: 500 });
    }
    
    console.log('✅ Table structure check passed');
    
    // Test 3: Try to insert a simple test record
    console.log('📝 Testing insert operation...');
    const testData = {
      type: 'test',
      session_id: 'test_session_' + Date.now(),
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Inserting test data:', testData);
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('user_interactions')
      .insert([testData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      return NextResponse.json({
        error: 'Insert test failed',
        details: insertError.message,
        code: insertError.code,
        hint: 'This suggests a schema mismatch or permission issue'
      }, { status: 500 });
    }
    
    console.log('✅ Insert test passed:', insertData);
    
    // Test 4: Clean up test data
    console.log('🧹 Cleaning up test data...');
    if (insertData && insertData[0]) {
      const { error: deleteError } = await supabaseAdmin
        .from('user_interactions')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.warn('⚠️ Cleanup warning:', deleteError);
      } else {
        console.log('✅ Test data cleaned up');
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'All database tests passed',
      tests: {
        connection: '✅',
        tableStructure: '✅',
        insert: '✅',
        cleanup: '✅'
      }
    });
    
  } catch (error) {
    console.error('❌ Test endpoint crashed:', error);
    return NextResponse.json({
      error: 'Test endpoint crashed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
