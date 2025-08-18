#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_FILE = path.join(process.cwd(), 'data', 'dynamic-images.json');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');
const MAX_BACKUPS = 10; // Keep last 10 backups

// Load retention configuration
function getRetentionDays() {
  try {
    const configFile = path.join(process.cwd(), 'data', 'retention-config.json');
    if (fs.existsSync(configFile)) {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
      return config.retentionDays || 30;
    }
  } catch (error) {
    console.log('⚠️  Could not load retention config, using default (30 days)');
  }
  return 30; // Default fallback
}

const RETENTION_DAYS = getRetentionDays();

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Create clean timestamp for backup filename
const now = new Date();
const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
const backupFile = path.join(BACKUP_DIR, `backup-${dateStr}-${timeStr}.json`);

try {
  // Check if config file exists
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log('❌ No image configuration file found to backup');
    process.exit(1);
  }

  // Read current configuration
  const configData = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const config = JSON.parse(configData);

  // Create backup
  fs.writeFileSync(backupFile, JSON.stringify(config, null, 2));
  console.log(`✅ Backup created: ${backupFile}`);

  // Clean up old backups based on retention policy
  const backupFiles = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
    .map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      const ageInDays = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));
      return { file, ageInDays, mtime: stats.mtime };
    })
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime()); // Newest first

  // Delete backups older than retention period
  const filesToDelete = backupFiles.filter(backup => backup.ageInDays > RETENTION_DAYS);
  filesToDelete.forEach(backup => {
    fs.unlinkSync(path.join(BACKUP_DIR, backup.file));
    console.log(`🗑️  Deleted old backup (${backup.ageInDays} days): ${backup.file}`);
  });

  // If we still have too many backups, delete the oldest ones
  const remainingFiles = backupFiles.filter(backup => backup.ageInDays <= RETENTION_DAYS);
  if (remainingFiles.length > MAX_BACKUPS) {
    const excessFiles = remainingFiles.slice(MAX_BACKUPS);
    excessFiles.forEach(backup => {
      fs.unlinkSync(path.join(BACKUP_DIR, backup.file));
      console.log(`🗑️  Deleted excess backup: ${backup.file}`);
    });
  }

  // Show backup info
  console.log(`📊 Current configuration:`);
  console.log(`   - Devices: ${config.devices.length}`);
  console.log(`   - Total images: ${config.devices.reduce((sum, device) => sum + device.imageUrls.length, 0)}`);
  console.log(`   - Last updated: ${config.lastUpdated}`);

} catch (error) {
  console.error('❌ Backup failed:', error.message);
  process.exit(1);
}
