require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addAdminScoreColumn() {
  try {
    console.log('🔄 Adding admin_score column to trending_products table...');
    
    // Add admin_score column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE trending_products 
        ADD COLUMN IF NOT EXISTS admin_score INTEGER DEFAULT 0;
      `
    });
    
    if (alterError) {
      console.error('Error adding admin_score column:', alterError);
      return;
    }
    
    // Create index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_trending_products_admin_score 
        ON trending_products(admin_score);
      `
    });
    
    if (indexError) {
      console.error('Error creating index:', indexError);
    }
    
    // Update existing records
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE trending_products 
        SET admin_score = 0 
        WHERE admin_score IS NULL;
      `
    });
    
    if (updateError) {
      console.error('Error updating existing records:', updateError);
    }
    
    // Make column NOT NULL
    const { error: notNullError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE trending_products 
        ALTER COLUMN admin_score SET NOT NULL;
      `
    });
    
    if (notNullError) {
      console.error('Error making admin_score NOT NULL:', notNullError);
    }
    
    console.log('✅ admin_score column migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

addAdminScoreColumn();

