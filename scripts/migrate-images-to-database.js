#!/usr/bin/env node

/**
 * Image Migration Script
 * 
 * This script migrates existing image data from JSON files to the Supabase database.
 * It reads the current dynamic-images.json file and inserts the data into the database.
 */

const fs = require('fs').promises;
const path = require('path');

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: ['.env.local', '.env'] });

// Fallback to hardcoded values if env vars are not loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tvzcqwdnsyqjglmwklkk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const IMAGES_CONFIG_FILE = path.join(process.cwd(), 'data', 'dynamic-images.json');

async function loadExistingImageConfig() {
  try {
    const configData = await fs.readFile(IMAGES_CONFIG_FILE, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.log('No existing image config file found, starting fresh');
    return {
      devices: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

async function migrateImagesToDatabase() {
  console.log('🚀 Starting image migration to database...');
  
  try {
    // Load existing config
    const config = await loadExistingImageConfig();
    
    if (!config.devices || config.devices.length === 0) {
      console.log('✅ No existing images to migrate');
      return;
    }
    
    console.log(`📊 Found ${config.devices.length} device images to migrate`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Migrate each device
    for (const device of config.devices) {
      try {
        console.log(`📸 Migrating: ${device.device} ${device.model} (${device.brand})`);
        
        // Check if record already exists
        const { data: existing } = await supabase
          .from('dynamic_images')
          .select('id')
          .eq('device', device.device)
          .eq('model', device.model)
          .eq('brand', device.brand)
          .single();
        
        if (existing) {
          console.log(`  ⚠️  Record already exists, updating...`);
          
          // Update existing record
          const { error } = await supabase
            .from('dynamic_images')
            .update({
              image_urls: device.imageUrls,
              updated_at: new Date().toISOString()
            })
            .eq('device', device.device)
            .eq('model', device.model)
            .eq('brand', device.brand);
          
          if (error) {
            console.error(`  ❌ Error updating: ${error.message}`);
            errorCount++;
          } else {
            console.log(`  ✅ Updated successfully`);
            successCount++;
          }
        } else {
          // Insert new record
          const { error } = await supabase
            .from('dynamic_images')
            .insert({
              device: device.device,
              model: device.model,
              brand: device.brand,
              image_urls: device.imageUrls,
              created_at: device.lastUpdated || new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (error) {
            console.error(`  ❌ Error inserting: ${error.message}`);
            errorCount++;
          } else {
            console.log(`  ✅ Inserted successfully`);
            successCount++;
          }
        }
      } catch (error) {
        console.error(`  ❌ Error migrating device ${device.device} ${device.model}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📋 Migration Summary:');
    console.log(`✅ Successfully migrated: ${successCount} devices`);
    console.log(`❌ Errors: ${errorCount} devices`);
    console.log(`📊 Total processed: ${config.devices.length} devices`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
      
      // Optionally backup the old file
      const backupPath = IMAGES_CONFIG_FILE.replace('.json', '.backup.json');
      try {
        await fs.copyFile(IMAGES_CONFIG_FILE, backupPath);
        console.log(`💾 Backup created at: ${backupPath}`);
      } catch (backupError) {
        console.log('⚠️  Could not create backup file');
      }
    } else {
      console.log('\n⚠️  Migration completed with errors. Please review the output above.');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

async function verifyDatabaseConnection() {
  console.log('🔍 Verifying database connection...');
  
  try {
    const { data, error } = await supabase
      .from('dynamic_images')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function showCurrentDatabaseState() {
  console.log('\n📊 Current database state:');
  
  try {
    const { data, error } = await supabase
      .from('dynamic_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching database state:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('  📭 No images in database');
    } else {
      console.log(`  📸 ${data.length} images in database:`);
      data.forEach((item, index) => {
        console.log(`    ${index + 1}. ${item.device} ${item.model} (${item.brand}) - ${item.image_urls.length} images`);
      });
    }
  } catch (error) {
    console.error('❌ Error showing database state:', error.message);
  }
}

async function main() {
  console.log('🔄 Image Migration Tool');
  console.log('=' .repeat(50));
  
  // Verify database connection
  const dbConnected = await verifyDatabaseConnection();
  if (!dbConnected) {
    process.exit(1);
  }
  
  // Show current database state
  await showCurrentDatabaseState();
  
  // Ask for confirmation
  console.log('\n⚠️  This will migrate all existing image data to the database.');
  console.log('   Existing database records will be updated if they conflict.');
  
  // For automated scripts, we'll proceed without user input
  console.log('\n🚀 Proceeding with migration...\n');
  
  // Perform migration
  await migrateImagesToDatabase();
  
  // Show final database state
  console.log('\n' + '=' .repeat(50));
  await showCurrentDatabaseState();
  
  console.log('\n✅ Migration process completed!');
}

// Run the migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  migrateImagesToDatabase,
  verifyDatabaseConnection,
  showCurrentDatabaseState
};
