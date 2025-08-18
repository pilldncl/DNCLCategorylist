#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_FILE = path.join(process.cwd(), 'data', 'dynamic-images.json');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

// Static images data from deviceImages.ts
const staticDeviceImages = [
  // Google Pixel Devices
  {
    device: 'PIXEL',
    model: '8',
    imageUrls: [
      'https://i.ebayimg.com/images/g/ZJsAAeSweNNonQhB/s-l1600.webp',
      'https://i.ebayimg.com/images/g/Z58AAeSwVAtonQhB/s-l1600.webp',
      'https://i.ebayimg.com/images/g/2J8AAeSwXCFonQhC/s-l500.webp'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '7',
    imageUrls: [
      'https://i.ebayimg.com/images/g/rBgAAeSwh3tonMM5/s-l1600.webp',
      'https://i.ebayimg.com/images/g/v78AAeSw6A5onNlR/s-l1600.webp',
      'https://i.ebayimg.com/images/g/2J8AAeSwXCFonQhC/s-l500.webp'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '7-PRO',
    imageUrls: [
      'https://i.ebayimg.com/images/g/s5AAAOSw9KRnyU1i/s-l1600.webp',
      'https://i.ebayimg.com/images/g/goEAAeSwev1ob3Dz/s-l1600.webp',
      'https://i.ebayimg.com/images/g/elYAAeSwGH5ohXu8/s-l1600.webp'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '6',
    imageUrls: [
      'https://i.ebayimg.com/images/g/uKwAAOSw52hnKBTr/s-l1600.webp',
      'https://i.ebayimg.com/images/g/Yh0AAOSwPRJnKBZr/s-l1600.webp',
      'https://i.ebayimg.com/images/g/2J8AAeSwXCFonQhC/s-l500.webp'
    ],
    brand: 'GOOGLE'
  },
  {
    device: 'PIXEL',
    model: '5',
    imageUrls: [
      'https://i.ebayimg.com/images/g/nOMAAOSwfa9nq9B-/s-l1600.webp',
      'https://i.ebayimg.com/images/g/iS8AAOSwrG5nq9Bv/s-l500.webp',
      'https://i.ebayimg.com/images/g/2J8AAeSwXCFonQhC/s-l500.webp'
    ],
    brand: 'GOOGLE'
  },
  
  // Samsung Fold Devices
  {
    device: 'FOLD',
    model: '5',
    imageUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Samsung_Galaxy_Fold_5.jpg/250px-Samsung_Galaxy_Fold_5.jpg',
      'https://i.ebayimg.com/images/g/ZJsAAeSweNNonQhB/s-l1600.webp',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'SAMSUNG'
  },
  {
    device: 'FOLD',
    model: '4',
    imageUrls: [
      'https://i.ebayimg.com/images/g/G7EAAeSwmtFok4Fe/s-l1600.webp',
      'https://i.ebayimg.com/images/g/OwQAAeSwXkVolj5R/s-l1600.webp',
      'https://i.ebayimg.com/images/g/lRwAAeSwM1Volj5S/s-l500.webp'
    ],
    brand: 'SAMSUNG'
  },
  {
    device: 'FOLD',
    model: '3',
    imageUrls: [
      'https://i.ebayimg.com/images/g/eqYAAeSwKt9on0We/s-l1600.webp',
      'https://i.ebayimg.com/images/g/dFYAAeSwYdNojicB/s-l1600.webp',
      'https://i.ebayimg.com/images/g/FFAAAeSwvpdom2AX/s-l1600.webp'
    ],
    brand: 'SAMSUNG'
  },
  {
    device: 'FOLD',
    model: '7',
    imageUrls: [
      'https://i.ebayimg.com/images/g/gCIAAeSwALBoiIhd/s-l1600.webp',
       'https://i.ebayimg.com/images/g/dQAAAeSwJGdoiIhg/s-l1600.webp',
       'https://cdn.mos.cms.futurecdn.net/azeySPAMyF3ZTc5j9nWZhf-970-80.jpg.webp'
    ],
    brand: 'SAMSUNG'
  },
  
  // Samsung Flip Devices
  {
    device: 'FLIP',
    model: '5',
    imageUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Samsung_Galaxy_Flip_5.jpg/250px-Samsung_Galaxy_Flip_5.jpg',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'SAMSUNG'
  },
  
  // Samsung Galaxy S Series
  {
    device: 'S24',
    model: '',
    imageUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Samsung_Galaxy_S24.jpg/250px-Samsung_Galaxy_S24.jpg',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'SAMSUNG'
  },
  {
    device: 'S23',
    model: '',
    imageUrls: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Back_of_the_Samsung_Galaxy_S23.jpg/330px-Back_of_the_Samsung_Galaxy_S23.jpg',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop'
    ],
    brand: 'SAMSUNG'
  }
];

// Load current dynamic configuration
function loadCurrentConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const configData = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(configData);
    }
  } catch (error) {
    console.log('⚠️  Could not load existing config, starting fresh');
  }
  
  return {
    devices: [],
    lastUpdated: new Date().toISOString()
  };
}

// Create backup of current configuration
function createBackup() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const backupFile = path.join(BACKUP_DIR, `pre-migration-${dateStr}-${timeStr}.json`);
  
  const currentConfig = loadCurrentConfig();
  fs.writeFileSync(backupFile, JSON.stringify(currentConfig, null, 2));
  console.log(`✅ Pre-migration backup created: ${backupFile}`);
  
  return backupFile;
}

// Merge static images with existing dynamic configuration
function mergeConfigurations(currentConfig, staticImages) {
  const mergedDevices = [...currentConfig.devices];
  const addedDevices = [];
  const updatedDevices = [];
  
  staticImages.forEach(staticDevice => {
    const existingIndex = mergedDevices.findIndex(d => 
      d.device === staticDevice.device && 
      d.model === staticDevice.model && 
      d.brand === staticDevice.brand
    );
    
    const deviceData = {
      ...staticDevice,
      lastUpdated: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      // Update existing device
      mergedDevices[existingIndex] = deviceData;
      updatedDevices.push(`${staticDevice.device} ${staticDevice.model} (${staticDevice.brand})`);
    } else {
      // Add new device
      mergedDevices.push(deviceData);
      addedDevices.push(`${staticDevice.device} ${staticDevice.model} (${staticDevice.brand})`);
    }
  });
  
  return {
    devices: mergedDevices,
    lastUpdated: new Date().toISOString(),
    addedDevices,
    updatedDevices
  };
}

// Main migration function
function migrateStaticImages() {
  console.log('🚀 Starting migration of static images to dynamic system...\n');
  
  // Create backup
  const backupFile = createBackup();
  
  // Load current configuration
  const currentConfig = loadCurrentConfig();
  console.log(`📊 Current dynamic configuration:`);
  console.log(`   - Devices: ${currentConfig.devices.length}`);
  console.log(`   - Total images: ${currentConfig.devices.reduce((sum, device) => sum + device.imageUrls.length, 0)}`);
  
  // Merge configurations
  const mergedConfig = mergeConfigurations(currentConfig, staticDeviceImages);
  
  // Save merged configuration
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(mergedConfig, null, 2));
  
  // Show results
  console.log('\n✅ Migration completed successfully!');
  console.log(`📊 New configuration:`);
  console.log(`   - Total devices: ${mergedConfig.devices.length}`);
  console.log(`   - Total images: ${mergedConfig.devices.reduce((sum, device) => sum + device.imageUrls.length, 0)}`);
  
  if (mergedConfig.addedDevices.length > 0) {
    console.log(`\n➕ Added devices:`);
    mergedConfig.addedDevices.forEach(device => {
      console.log(`   - ${device}`);
    });
  }
  
  if (mergedConfig.updatedDevices.length > 0) {
    console.log(`\n🔄 Updated devices:`);
    mergedConfig.updatedDevices.forEach(device => {
      console.log(`   - ${device}`);
    });
  }
  
  console.log(`\n📁 Configuration saved to: ${CONFIG_FILE}`);
  console.log(`💾 Backup created at: ${backupFile}`);
  
  // Show device breakdown
  console.log('\n📋 Device breakdown:');
  const brandBreakdown = {};
  mergedConfig.devices.forEach(device => {
    if (!brandBreakdown[device.brand]) {
      brandBreakdown[device.brand] = [];
    }
    brandBreakdown[device.brand].push(`${device.device} ${device.model} (${device.imageUrls.length} images)`);
  });
  
  Object.entries(brandBreakdown).forEach(([brand, devices]) => {
    console.log(`\n   ${brand}:`);
    devices.forEach(device => {
      console.log(`     - ${device}`);
    });
  });
  
  console.log('\n🎉 Migration complete! Your static images are now available in the dynamic admin interface.');
  console.log('🌐 Visit http://localhost:3003/admin/images to see all your migrated images!');
}

// Run migration
try {
  migrateStaticImages();
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
