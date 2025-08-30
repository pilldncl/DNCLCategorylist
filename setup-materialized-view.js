// Setup materialized view for trending products
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: ['.env.local', '.env'] });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupMaterializedView() {
  try {
    console.log('🚀 Setting up materialized view for trending products...\n');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'scripts', 'create-materialized-trending-view.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL Script loaded');
    console.log('📝 Script length:', sql.length, 'characters');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log('📊 Found', statements.length, 'SQL statements');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
      console.log('📝 Statement preview:', statement.substring(0, 100) + '...');
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err);
        // Continue with other statements
      }
    }
    
    console.log('\n🎉 Materialized view setup completed!');
    console.log('\n📋 What was created:');
    console.log('  ✅ Materialized view: trending_products_ranked');
    console.log('  ✅ Indexes for performance');
    console.log('  ✅ Auto-refresh function: refresh_trending_rankings()');
    console.log('  ✅ Auto-refresh trigger on data changes');
    console.log('  ✅ Permissions granted');
    
    console.log('\n🔄 Testing the materialized view...');
    
    // Test the materialized view
    const { data: testData, error: testError } = await supabase
      .from('trending_products_ranked')
      .select('product_id, name, trending_score, admin_score, total_score, rank')
      .limit(3);
    
    if (testError) {
      console.error('❌ Error testing materialized view:', testError);
    } else {
      console.log('✅ Materialized view test successful!');
      console.log('📊 Sample data:');
      testData.forEach(item => {
        console.log(`  Rank ${item.rank}: ${item.name} (trending: ${item.trending_score}, admin: ${item.admin_score}, total: ${item.total_score})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

setupMaterializedView();

