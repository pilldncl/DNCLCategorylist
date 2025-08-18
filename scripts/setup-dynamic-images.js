#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration paths
const CONFIG_FILE = path.join(process.cwd(), 'data', 'dynamic-images.json');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initial configuration with sample data
const initialConfig = {
  devices: [
    {
      device: 'PIXEL',
      model: '8',
      brand: 'GOOGLE',
      imageUrls: [
        'https://i.ebayimg.com/images/g/ZJsAAeSweNNonQhB/s-l1600.webp',
        'https://i.ebayimg.com/images/g/Z58AAeSwVAtonQhB/s-l1600.webp'
      ],
      lastUpdated: new Date().toISOString()
    },
    {
      device: 'FOLD',
      model: '5',
      brand: 'SAMSUNG',
      imageUrls: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Samsung_Galaxy_Fold_5.jpg/250px-Samsung_Galaxy_Fold_5.jpg',
        'https://i.ebayimg.com/images/g/ZJsAAeSweNNonQhB/s-l1600.webp'
      ],
      lastUpdated: new Date().toISOString()
    }
  ],
  lastUpdated: new Date().toISOString()
};

// Function to check for existing backups
function checkForBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    return [];
  }
  
  try {
    const backupFiles = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    return backupFiles;
  } catch (error) {
    return [];
  }
}

// Function to restore from backup
function restoreFromBackup(backupFile) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFile);
    const backupData = fs.readFileSync(backupPath, 'utf-8');
    const backupConfig = JSON.parse(backupData);
    
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(backupConfig, null, 2));
    
    console.log(`✅ Restored configuration from: ${backupFile}`);
    console.log(`📊 Restored configuration:`);
    console.log(`   - Devices: ${backupConfig.devices.length}`);
    console.log(`   - Total images: ${backupConfig.devices.reduce((sum, device) => sum + device.imageUrls.length, 0)}`);
    console.log(`   - Last updated: ${backupConfig.lastUpdated}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Failed to restore from backup: ${error.message}`);
    return false;
  }
}

// Function to create initial configuration
function createInitialConfig() {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(initialConfig, null, 2));
  console.log('✅ Created initial dynamic-images.json configuration');
  console.log('   - Added sample PIXEL 8 and FOLD 5 configurations');
}

// Function to ensure directories exist
function ensureDirectories() {
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('✅ Created data directory');
  }

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log('✅ Created backup directory');
  }

  // Ensure product-images directory exists
  const productImagesDir = path.join(process.cwd(), 'public', 'product-images');
  if (!fs.existsSync(productImagesDir)) {
    fs.mkdirSync(productImagesDir, { recursive: true });
    console.log('✅ Created product-images directory');
  }
}

// Function to show backup selection menu
function showBackupMenu(backupFiles) {
  return new Promise((resolve) => {
    console.log('\n📋 Available backups:');
    backupFiles.forEach((file, index) => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      console.log(`   ${index + 1}. ${file} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`);
    });
    
    console.log(`   ${backupFiles.length + 1}. Create new initial configuration`);
    console.log(`   ${backupFiles.length + 2}. Exit setup`);
    
    rl.question('\n🔍 Select an option (enter number): ', (answer) => {
      const selection = parseInt(answer);
      
      if (selection >= 1 && selection <= backupFiles.length) {
        const selectedBackup = backupFiles[selection - 1];
        console.log(`\n🔄 Restoring from backup: ${selectedBackup}`);
        const success = restoreFromBackup(selectedBackup);
        resolve(success ? 'restored' : 'failed');
      } else if (selection === backupFiles.length + 1) {
        console.log('\n🆕 Creating new initial configuration...');
        createInitialConfig();
        resolve('created');
      } else if (selection === backupFiles.length + 2) {
        console.log('\n❌ Setup cancelled by user');
        resolve('cancelled');
      } else {
        console.log('\n❌ Invalid selection. Please try again.');
        showBackupMenu(backupFiles).then(resolve);
      }
    });
  });
}

// Main setup function
async function setupDynamicImages() {
  console.log('🚀 Setting up Dynamic Image Management System...\n');
  
  // Ensure all directories exist
  ensureDirectories();
  
  // Check if configuration already exists
  if (fs.existsSync(CONFIG_FILE)) {
    console.log('ℹ️  dynamic-images.json already exists');
    
    const backupFiles = checkForBackups();
    if (backupFiles.length > 0) {
      console.log(`📦 Found ${backupFiles.length} backup(s) available`);
      
      rl.question('\n🔍 Would you like to check for backups and restore from one? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          const result = await showBackupMenu(backupFiles);
          if (result === 'restored') {
            console.log('\n✅ Configuration restored successfully!');
          } else if (result === 'failed') {
            console.log('\n❌ Failed to restore configuration');
          }
        } else {
          console.log('\nℹ️  Keeping existing configuration');
        }
        
        showCompletionMessage();
        rl.close();
      });
    } else {
      console.log('ℹ️  No backups found, keeping existing configuration');
      showCompletionMessage();
      rl.close();
    }
  } else {
    // No existing configuration, check for backups
    const backupFiles = checkForBackups();
    
    if (backupFiles.length > 0) {
      console.log(`📦 Found ${backupFiles.length} backup(s) available`);
      
      rl.question('\n🔍 Would you like to restore from a backup? (y/n): ', async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          const result = await showBackupMenu(backupFiles);
          if (result === 'restored') {
            console.log('\n✅ Configuration restored successfully!');
          } else if (result === 'failed') {
            console.log('\n❌ Failed to restore configuration, creating initial config');
            createInitialConfig();
          } else if (result === 'created') {
            console.log('\n✅ Initial configuration created!');
          }
        } else {
          console.log('\n🆕 Creating new initial configuration...');
          createInitialConfig();
        }
        
        showCompletionMessage();
        rl.close();
      });
    } else {
      console.log('ℹ️  No backups found, creating initial configuration...');
      createInitialConfig();
      showCompletionMessage();
      rl.close();
    }
  }
}

// Function to show completion message
function showCompletionMessage() {
  console.log('\n🎉 Dynamic Image Management System setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Visit /admin/images to manage your product images');
  console.log('3. Visit /test-dynamic-images to test the system');
  console.log('4. Check DYNAMIC_IMAGES_README.md for detailed documentation');
  console.log('\n🔗 Quick links:');
  console.log('   - Admin Interface: http://localhost:3000/admin/images');
  console.log('   - Test Page: http://localhost:3000/test-dynamic-images');
  console.log('   - Main Catalog: http://localhost:3000');
  console.log('\n💡 Tip: Use "npm run backup-images" to create regular backups');
}

// Run setup
setupDynamicImages().catch(error => {
  console.error('❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});
