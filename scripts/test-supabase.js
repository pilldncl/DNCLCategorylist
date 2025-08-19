const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

console.log('🔍 Testing Supabase Configuration...');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');
console.log('Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testConnection() {
  try {
    console.log('\n🔌 Testing connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('📊 Supabase is ready for use');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection();
