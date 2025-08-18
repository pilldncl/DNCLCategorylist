# Scripts Directory - Usage Guide

This directory contains utility scripts for managing the dynamic image system.

## 📋 **Available Scripts**

### 🔧 **setup-dynamic-images.js**
**Purpose**: Initialize the dynamic image system with interactive backup restoration

**When to use**:
- First-time setup of dynamic image system
- Reset to empty configuration
- Fresh installation
- Restore from existing backups

**Usage**:
```bash
npm run setup-images
```

**What it does**:
- **Interactive setup** with backup detection and restoration options
- Checks for existing backups and offers to restore from them
- Creates `data/dynamic-images.json` with sample or restored configuration
- Sets up initial structure for device image management
- Creates backup directory structure
- **Smart behavior**: 
  - If backups exist → offers to restore from backup or create new
  - If no backups → creates initial configuration
  - If config exists → offers to check backups or keep existing

---

### 🔄 **migrate-static-images.js**
**Purpose**: Migrate static images from `deviceImages.ts` to dynamic system

**When to use**:
- Moving from static to dynamic image management
- Importing existing image configurations
- One-time migration of legacy data

**Usage**:
```bash
npm run migrate-static
```

**What it does**:
- Reads static images from `src/data/deviceImages.ts`
- Merges with existing dynamic configuration
- Preserves all image URLs and device information
- Creates backup before migration
- Updates timestamps for all devices

---

### 💾 **backup-images.js**
**Purpose**: Create timestamped backup of current image configuration

**When to use**:
- Before making major changes
- Regular backup schedule
- Before testing new configurations
- Disaster recovery preparation

**Usage**:
```bash
npm run backup-images
```

**What it does**:
- Creates standardized backup in `data/backups/`
- **Naming format**: `backup-YYYY-MM-DD-HH-MM-SS.json`
- Keeps last 10 backups (auto-cleanup)
- Shows current configuration statistics
- Validates backup integrity

---

### 🔙 **restore-images.js**
**Purpose**: Restore image configuration from backup

**When to use**:
- Recover from configuration errors
- Rollback to previous working state
- Restore after failed changes
- Disaster recovery

**Usage**:
```bash
# List available backups
npm run restore-images

# Restore from specific backup
npm run restore-images <backup-filename>
```

**Examples**:
```bash
npm run restore-images backup-2025-08-18-21-47-27.json
```

**What it does**:
- Lists all available backups with timestamps
- Creates pre-restore backup of current config
- Restores selected backup to main configuration
- Validates restored data integrity

---

## 🚀 **Quick Reference**

### **Setup & Migration**
```bash
# First time setup
npm run setup-images

# Migrate existing static images
npm run migrate-static
```

### **Backup & Recovery**
```bash
# Create backup
npm run backup-images

# List backups
npm run restore-images

# Restore from backup
npm run restore-images <filename>
```

### **Workflow Examples**

**New Installation**:
```bash
npm run setup-images
npm run backup-images
```

**Migrate Existing Data**:
```bash
npm run backup-images          # Backup current state
npm run migrate-static         # Migrate static images
npm run backup-images          # Backup migrated state
```

**Recovery Process**:
```bash
npm run restore-images         # List available backups
npm run restore-images <file>  # Restore specific backup
```

## 📁 **File Locations**

### **Configuration Files**:
- `data/dynamic-images.json` - Main configuration
- `data/backups/` - Backup directory
- `src/data/deviceImages.ts` - Original static data

### **Script Outputs**:
- Backups: `data/backups/dynamic-images-<timestamp>.json`
- Pre-restore: `data/backups/pre-restore-<timestamp>.json`
- Pre-migration: `data/backups/pre-migration-<timestamp>.json`

## ⚠️ **Important Notes**

### **Safety Features**:
- ✅ All scripts create backups before destructive operations
- ✅ Automatic cleanup of old backups (keeps last 10)
- ✅ Validation of data integrity
- ✅ Rollback capability for all operations

### **Best Practices**:
1. **Always backup before major changes**
2. **Test restore process periodically**
3. **Keep multiple backup points**
4. **Verify data after migration/restore**

### **Error Handling**:
- Scripts exit with error code 1 on failure
- Detailed error messages provided
- Automatic rollback on critical failures
- Validation of file permissions and disk space

## 🔧 **Troubleshooting**

### **Common Issues**:

**Permission Denied**:
```bash
# Check file permissions
ls -la data/dynamic-images.json
```

**Backup Directory Missing**:
```bash
# Scripts create directories automatically
# Manual creation if needed:
mkdir -p data/backups
```

**Invalid JSON**:
```bash
# Validate configuration
node -e "JSON.parse(require('fs').readFileSync('data/dynamic-images.json'))"
```

### **Recovery Commands**:
```bash
# Emergency restore to last known good state
npm run restore-images
# Select most recent backup from list
```

## 📞 **Support**

If scripts fail or produce unexpected results:
1. Check console output for error messages
2. Verify file permissions and disk space
3. Use `npm run restore-images` to list available backups
4. Restore from last known good backup

**All scripts are designed to be safe and provide rollback capabilities!** 🛡️
