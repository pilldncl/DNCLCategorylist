// Test the database view directly
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testView() {
  try {
    console.log('🔍 Testing database view directly...\n');
    
    // Test 1: Check if view exists
    console.log('📊 Test 1: Checking if view exists...');
    const { data: viewData, error: viewError } = await supabase
      .from('trending_products_ranked')
      .select('*')
      .limit(3);
    
    if (viewError) {
      console.error('❌ View error:', viewError);
      console.error('❌ Error code:', viewError.code);
      console.error('❌ Error message:', viewError.message);
      console.error('❌ Error details:', viewError.details);
      console.error('❌ Error hint:', viewError.hint);
      
      // Test 2: Check if base table exists
      console.log('\n📊 Test 2: Checking if base table exists...');
      const { data: tableData, error: tableError } = await supabase
        .from('trending_products')
        .select('product_id, name, trending_score, admin_score')
        .limit(3);
      
      if (tableError) {
        console.error('❌ Base table error:', tableError);
      } else {
        console.log('✅ Base table exists and accessible');
        console.log('📊 Base table data:', tableData);
      }
      
      // Test 3: Try to create the view
      console.log('\n📊 Test 3: Attempting to create view...');
      const createViewSQL = `
        CREATE OR REPLACE VIEW trending_products_ranked AS
        SELECT
            tp.product_id,
            tp.brand,
            tp.name,
            tp.total_views,
            tp.total_clicks,
            tp.total_searches,
            tp.trending_score,
            COALESCE(tp.admin_score, 0) AS admin_score,
            tp.last_interaction,
            tp.created_at,
            tp.updated_at,
            (tp.trending_score + COALESCE(tp.admin_score, 0)) AS total_score,
            RANK() OVER (ORDER BY (tp.trending_score + COALESCE(tp.admin_score, 0)) DESC) AS rank
        FROM
            trending_products tp;
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: createViewSQL });
      if (createError) {
        console.error('❌ Create view error:', createError);
      } else {
        console.log('✅ View created successfully');
        
        // Test the view again
        const { data: newViewData, error: newViewError } = await supabase
          .from('trending_products_ranked')
          .select('*')
          .limit(3);
        
        if (newViewError) {
          console.error('❌ New view still has error:', newViewError);
        } else {
          console.log('✅ View now works!');
          console.log('📊 View data:', newViewData);
        }
      }
    } else {
      console.log('✅ View exists and works!');
      console.log('📊 View data:', viewData);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testView();

