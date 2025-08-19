const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Direct configuration for testing (New API Keys)
const supabaseUrl = 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseServiceKey = 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

console.log('🔍 Debugging Login Process...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugLogin() {
  try {
    const username = 'admin';
    const password = 'Ustvmos817';
    
    console.log('\n1️⃣ Looking for user:', username);
    
    // Find user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.log('❌ Error finding user:', error.message);
      return;
    }

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found!');
    console.log('User ID:', user.id);
    console.log('Username:', user.username);
    console.log('Role:', user.role);
    console.log('Password hash starts with:', user.password_hash.substring(0, 10) + '...');
    console.log('Password hash length:', user.password_hash.length);

    console.log('\n2️⃣ Verifying password...');
    
    // Check if password hash is bcrypt format
    const isBcryptHash = user.password_hash.startsWith('$2a$');
    console.log('Is bcrypt hash:', isBcryptHash);
    
    let isValidPassword;
    if (isBcryptHash) {
      console.log('Using bcrypt comparison...');
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      console.log('Using plain text comparison...');
      isValidPassword = user.password_hash === password;
    }
    
    console.log('Password verification result:', isValidPassword);
    
    if (isValidPassword) {
      console.log('\n✅ Login successful!');
      
      // Generate token
      const token = Buffer.from(`${user.id}:${user.username}:${user.role}`).toString('base64');
      console.log('Generated token:', token);
      
    } else {
      console.log('\n❌ Login failed - invalid password');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLogin();
