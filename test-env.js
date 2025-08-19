require('dotenv').config();

console.log('Testing environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Present' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Present' : '❌ Missing');

if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('Anon key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length);
  console.log('Anon key starts with:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...');
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('Service key length:', process.env.SUPABASE_SERVICE_ROLE_KEY.length);
  console.log('Service key starts with:', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');
}
