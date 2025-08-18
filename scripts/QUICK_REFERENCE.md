# Quick Reference Card

## 🚀 **Most Common Commands**

### **Setup & Migration**
```bash
npm run setup-images      # Initialize empty system
npm run migrate-static    # Import static images
```

### **Backup & Recovery**
```bash
npm run backup-images     # Create backup
npm run restore-images    # List/restore backups
```

## 📋 **Script Purposes**

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `setup-images` | Initialize system with backup restore | First time setup, restore from backup |
| `migrate-static` | Import static data | Moving from static to dynamic |
| `backup-images` | Create backup | Before changes, regular backup |
| `restore-images` | Restore from backup | Recovery, rollback |

## 🔄 **Typical Workflows**

### **New Installation**
```bash
npm run setup-images
npm run backup-images
```

### **Migrate Existing Data**
```bash
npm run backup-images
npm run migrate-static
npm run backup-images
```

### **Recovery**
```bash
npm run restore-images        # List backups
npm run restore-images <file> # Restore specific backup
```

## ⚡ **Emergency Commands**

```bash
# List all backups
npm run restore-images

# Restore most recent backup
npm run restore-images $(ls data/backups/ | grep dynamic-images | tail -1)

# Create immediate backup
npm run backup-images
```

## 📁 **Key Files**

- `data/dynamic-images.json` - Main configuration
- `data/backups/` - Backup directory
- `src/data/deviceImages.ts` - Original static data

## 🛡️ **Safety Notes**

- ✅ All scripts create backups before changes
- ✅ Automatic cleanup (keeps last 10 backups)
- ✅ Rollback capability for all operations
- ✅ Validation of data integrity

**For detailed usage, see `README.md`** 📖
