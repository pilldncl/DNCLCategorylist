const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials in .env.local');
  console.log('Please check your .env.local file has:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImagesAPI() {
  console.log('🔍 Testing Images API...\n');

  try {
    // Test 1: Direct database query
    console.log('1️⃣ Testing direct database query...');
    const { data: dbData, error: dbError } = await supabase
      .from('dynamic_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.log('❌ Database error:', dbError);
    } else {
      console.log('✅ Database query successful');
      console.log(`📊 Found ${dbData.length} records in database`);
      
      if (dbData.length > 0) {
        console.log('📋 Sample record:');
        console.log(JSON.stringify(dbData[0], null, 2));
      }
    }

    // Test 2: Check if table exists
    console.log('\n2️⃣ Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('dynamic_images')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ Table error:', tableError);
      console.log('💡 This might mean the table doesn\'t exist or has permission issues');
    } else {
      console.log('✅ Table exists and is accessible');
    }

    // Test 3: Check for any data
    console.log('\n3️⃣ Checking for any data...');
    const { count, error: countError } = await supabase
      .from('dynamic_images')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Count error:', countError);
    } else {
      console.log(`📊 Total records in table: ${count}`);
    }

    // Test 4: Test the API endpoint (if server is running)
    console.log('\n4️⃣ Testing API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/images');
      if (response.ok) {
        const apiData = await response.json();
        console.log('✅ API endpoint working');
        console.log(`📊 API returned ${apiData.devices?.length || 0} devices`);
        console.log('📋 API response:', JSON.stringify(apiData, null, 2));
      } else {
        console.log(`❌ API error: ${response.status} ${response.statusText}`);
      }
    } catch (apiError) {
      console.log('❌ API not accessible (server might not be running)');
      console.log('💡 Start the server with: npm run dev');
    }

  } catch (error) {
    console.log('❌ Test failed:', error);
  }
}

// Run the test
testImagesAPI().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.log('❌ Test failed:', error);
  process.exit(1);
});
