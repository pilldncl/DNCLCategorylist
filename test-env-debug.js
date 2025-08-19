#!/usr/bin/env node

require('dotenv').config({ path: ['.env.local', '.env'] });

console.log('Environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
