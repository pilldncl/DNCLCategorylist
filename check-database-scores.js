// Quick script to check database scores vs API scores
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkScores() {
  try {
    console.log('🔍 Checking database scores...\n');
    
    // Check raw database data
    const { data: dbData, error: dbError } = await supabase
      .from('trending_products')
      .select('product_id, name, trending_score, admin_score')
      .order('trending_score', { ascending: false });
    
    if (dbError) {
      console.error('Database error:', dbError);
      return;
    }
    
    console.log('📊 Database scores:');
    dbData.forEach(item => {
      const total = (item.trending_score || 0) + (item.admin_score || 0);
      console.log(`  ${item.name}: trending=${item.trending_score}, admin=${item.admin_score || 0}, total=${total}`);
    });
    
    console.log('\n🌐 API scores (from last response):');
    console.log('  FOLD-3-256: total=150 (trending=100, admin=50)');
    console.log('  s24-ultra-512-violet: total=71 (trending=71, admin=0)');
    console.log('  ipad-mini4-16: total=14 (trending=14, admin=0)');
    
    console.log('\n📱 Frontend screenshot shows:');
    console.log('  s24-ultra: 710 score');
    console.log('  ipad-mini: 140 score');
    console.log('  FOLD-3-256: 150 score');
    
    console.log('\n🔍 Analysis:');
    if (dbData.length > 0) {
      const s24ultra = dbData.find(item => item.name.includes('s24-ultra'));
      const ipadmini = dbData.find(item => item.name.includes('ipad-mini'));
      
      if (s24ultra) {
        const dbTotal = (s24ultra.trending_score || 0) + (s24ultra.admin_score || 0);
        console.log(`  s24-ultra database total: ${dbTotal}, API shows: 71, Frontend shows: 710`);
        if (dbTotal * 10 === 710) {
          console.log('  ✅ Frontend is multiplying by 10!');
        }
      }
      
      if (ipadmini) {
        const dbTotal = (ipadmini.trending_score || 0) + (ipadmini.admin_score || 0);
        console.log(`  ipad-mini database total: ${dbTotal}, API shows: 14, Frontend shows: 140`);
        if (dbTotal * 10 === 140) {
          console.log('  ✅ Frontend is multiplying by 10!');
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkScores();

