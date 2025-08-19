const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Direct configuration for testing (New API Keys)
const supabaseUrl = 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseServiceKey = 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

console.log('🔍 Checking Admin User...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? '✅ Present' : '❌ Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateAdmin() {
  try {
    console.log('\n🔍 Checking if admin user exists...');
    
    // Check if admin user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .single();
    
    if (fetchError && fetchError.code === 'PGRST116') {
      console.log('❌ Admin user not found. Creating...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash('Ustvmos817', 10);
      
      // Create admin user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          username: 'admin',
          password_hash: hashedPassword,
          role: 'admin',
          created_by: null
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating admin user:', createError.message);
        return;
      }
      
      console.log('✅ Admin user created successfully!');
      console.log('User ID:', newUser.id);
      console.log('Username:', newUser.username);
      console.log('Role:', newUser.role);
      
    } else if (existingUser) {
      console.log('✅ Admin user already exists!');
      console.log('User ID:', existingUser.id);
      console.log('Username:', existingUser.username);
      console.log('Role:', existingUser.role);
      
      // Test password verification
      console.log('\n🔐 Testing password verification...');
      const isValidPassword = await bcrypt.compare('Ustvmos817', existingUser.password_hash);
      console.log('Password verification:', isValidPassword ? '✅ Valid' : '❌ Invalid');
      
    } else {
      console.error('❌ Unexpected error:', fetchError.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAndCreateAdmin();
