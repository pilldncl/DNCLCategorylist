const { createClient } = require('@supabase/supabase-js');

// Direct configuration for testing (New API Keys)
const supabaseUrl = 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseServiceKey = 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? '✅ Present' : '❌ Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('\n🔌 Testing connection...');
    
    // First, let's try to create a simple table if it doesn't exist
    console.log('📊 Checking if tables exist...');
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️ Users table might not exist yet. This is expected if you haven\'t run the schema.');
      console.log('Error details:', error.message);
      
      // Let's try a different approach - check if we can connect at all
      console.log('\n🔄 Testing basic connection...');
      const { data: testData, error: testError } = await supabase
        .from('_dummy_table_that_doesnt_exist')
        .select('*')
        .limit(1);
      
      if (testError && testError.code === 'PGRST116') {
        console.log('✅ Connection successful! (Table doesn\'t exist, but connection works)');
        console.log('📋 Next step: Run the database schema in Supabase dashboard');
        return;
      }
      
      console.error('❌ Connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('📊 Users table exists and is accessible');
    console.log('🎉 Supabase is ready for use');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection();
