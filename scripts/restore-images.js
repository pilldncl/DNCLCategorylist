#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_FILE = path.join(process.cwd(), 'data', 'dynamic-images.json');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

// Get command line arguments
const args = process.argv.slice(2);
const backupFile = args[0];

if (!backupFile) {
  console.log('❌ Please specify a backup file to restore from');
  console.log('');
  console.log('Available backups:');
  
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('   No backup directory found');
    process.exit(1);
  }

  const backupFiles = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
    .sort()
    .reverse();

  if (backupFiles.length === 0) {
    console.log('   No backup files found');
    process.exit(1);
  }

  backupFiles.forEach((file, index) => {
    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);
    console.log(`   ${index + 1}. ${file} (${stats.size} bytes, ${stats.mtime.toLocaleString()})`);
  });

  console.log('');
  console.log('Usage: node scripts/restore-images.js <backup-filename>');
  console.log('Example: node scripts/restore-images.js backup-2025-08-18-14-30-45.json');
  process.exit(1);
}

try {
  const backupPath = path.join(BACKUP_DIR, backupFile);
  
  // Check if backup file exists
  if (!fs.existsSync(backupPath)) {
    console.log(`❌ Backup file not found: ${backupFile}`);
    process.exit(1);
  }

  // Read backup data
  const backupData = fs.readFileSync(backupPath, 'utf-8');
  const backupConfig = JSON.parse(backupData);

  // Create backup of current config before restoring
  if (fs.existsSync(CONFIG_FILE)) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const currentBackup = path.join(BACKUP_DIR, `pre-restore-${dateStr}-${timeStr}.json`);
    fs.copyFileSync(CONFIG_FILE, currentBackup);
    console.log(`✅ Current config backed up to: ${currentBackup}`);
  }

  // Restore from backup
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(backupConfig, null, 2));
  
  console.log(`✅ Configuration restored from: ${backupFile}`);
  console.log(`📊 Restored configuration:`);
  console.log(`   - Devices: ${backupConfig.devices.length}`);
  console.log(`   - Total images: ${backupConfig.devices.reduce((sum, device) => sum + device.imageUrls.length, 0)}`);
  console.log(`   - Last updated: ${backupConfig.lastUpdated}`);

} catch (error) {
  console.error('❌ Restore failed:', error.message);
  process.exit(1);
}
