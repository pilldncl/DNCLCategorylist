const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
// Load environment variables with fallbacks
require('dotenv').config({ path: ['.env.local', '.env'] });

// Hardcoded fallbacks from your .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function extractImageDomains() {
  try {
    console.log('🔍 Fetching images from database...');
    
    const { data, error } = await supabase
      .from('dynamic_images')
      .select('image_urls');

    if (error) {
      console.error('❌ Error fetching images:', error);
      return new Set();
    }

    const domains = new Set();
    
    data.forEach(item => {
      if (item.image_urls && Array.isArray(item.image_urls)) {
        item.image_urls.forEach(url => {
          try {
            const domain = new URL(url).hostname;
            domains.add(domain);
          } catch (e) {
            console.log('⚠️  Invalid URL:', url);
          }
        });
      }
    });

    return domains;
  } catch (error) {
    console.error('❌ Error extracting domains:', error);
    return new Set();
  }
}

function updateNextConfig(domains) {
  const configPath = path.join(__dirname, '..', 'next.config.js');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  // Create the remotePatterns array
  const patterns = Array.from(domains).map(domain => {
    return `      {
        protocol: 'https',
        hostname: '${domain}',
        port: '',
        pathname: '/**',
      }`;
  }).join(',\n');

  // Replace the existing remotePatterns
  const newConfig = configContent.replace(
    /remotePatterns: \[[\s\S]*?\],/,
    `remotePatterns: [
${patterns},
    ],`
  );

  fs.writeFileSync(configPath, newConfig);
  console.log('✅ Updated next.config.js with', domains.size, 'domains');
}

async function main() {
  console.log('🚀 Starting image domain detection...');
  
  const domains = await extractImageDomains();
  
  if (domains.size === 0) {
    console.log('❌ No domains found');
    return;
  }

  console.log('📋 Found domains:');
  Array.from(domains).sort().forEach(domain => {
    console.log('  -', domain);
  });

  updateNextConfig(domains);
  
  console.log('🎉 Done! Restart your dev server to apply changes.');
}

main().catch(console.error);
