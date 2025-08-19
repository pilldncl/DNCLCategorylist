const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Direct configuration for testing (New API Keys)
const supabaseUrl = 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseServiceKey = 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

console.log('🔍 Updating Admin Password...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? '✅ Present' : '❌ Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateAdminPassword() {
  try {
    console.log('\n🔍 Updating admin password...');
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash('Ustvmos817', 10);
    
    // Update admin user password
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: hashedPassword
      })
      .eq('username', 'admin')
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error updating admin password:', updateError.message);
      return;
    }
    
    console.log('✅ Admin password updated successfully!');
    console.log('User ID:', updatedUser.id);
    console.log('Username:', updatedUser.username);
    console.log('Role:', updatedUser.role);
    
    // Test password verification
    console.log('\n🔐 Testing password verification...');
    const isValidPassword = await bcrypt.compare('Ustvmos817', updatedUser.password_hash);
    console.log('Password verification:', isValidPassword ? '✅ Valid' : '❌ Invalid');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateAdminPassword();
