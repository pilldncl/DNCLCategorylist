// Debug script to check ranking data discrepancy
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugRankingData() {
  try {
    console.log('🔍 Checking database data vs API response...\n');
    
    // Check raw database data
    console.log('📊 Raw database data:');
    const { data: rawData, error: rawError } = await supabase
      .from('trending_products')
      .select('product_id, name, trending_score, admin_score')
      .order('trending_score', { ascending: false });
    
    if (rawError) {
      console.error('Error fetching raw data:', rawError);
    } else {
      rawData.forEach(item => {
        const total = (item.trending_score || 0) + (item.admin_score || 0);
        console.log(`  ${item.name}: trending=${item.trending_score}, admin=${item.admin_score || 0}, total=${total}`);
      });
    }
    
    // Check if view exists and works
    console.log('\n🔍 Checking database view:');
    const { data: viewData, error: viewError } = await supabase
      .from('trending_products_ranked')
      .select('product_id, name, trending_score, admin_score, total_score, rank')
      .limit(5);
    
    if (viewError) {
      console.error('Error fetching from view:', viewError);
      console.log('❌ Database view is not working');
    } else {
      console.log('✅ Database view is working:');
      viewData.forEach(item => {
        console.log(`  Rank ${item.rank}: ${item.name} (trending: ${item.trending_score}, admin: ${item.admin_score || 0}, total: ${item.total_score})`);
      });
    }
    
    // Check API response
    console.log('\n🌐 API Response:');
    try {
      const response = await fetch('http://localhost:3000/api/ranking/trending-db?force=true');
      const apiData = await response.json();
      
      apiData.trending.forEach((item, index) => {
        console.log(`  Rank ${index + 1}: ${item.name} (score: ${item.trendingScore}, admin: ${item.adminScore || 0})`);
      });
    } catch (fetchError) {
      console.error('Error fetching from API:', fetchError.message);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugRankingData();

