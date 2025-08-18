# Disaster Recovery Guide for Dynamic Image Management

## 🛡️ **Data Persistence & Recovery**

Your image configurations are **PERMANENTLY SAVED** and survive all types of server issues.

## 📁 **Storage Locations**

### Primary Storage:
```
📁 data/dynamic-images.json  ← MAIN CONFIGURATION FILE
```

### Backup Storage:
```
📁 data/backups/  ← AUTOMATIC BACKUPS
├── dynamic-images-2025-08-18T02-14-11-850Z.json
├── dynamic-images-2025-08-18T03-30-22-123Z.json
└── ... (up to 10 recent backups)
```

## ✅ **What Survives Server Restarts**

| Scenario | Data Status | Recovery Method |
|----------|-------------|-----------------|
| **Server Restart** | ✅ Survives | Automatic |
| **Power Off** | ✅ Survives | Automatic |
| **Application Crash** | ✅ Survives | Automatic |
| **Code Changes** | ✅ Survives | Automatic |
| **File System** | ✅ Survives | Automatic |
| **Hardware Failure** | ⚠️ Depends | Backup Restore |

## 🔧 **Backup & Restore Commands**

### Create Backup:
```bash
npm run backup-images
```

### List Available Backups:
```bash
npm run restore-images
```

### Restore from Backup:
```bash
npm run restore-images <backup-filename>
```

### Example:
```bash
npm run restore-images dynamic-images-2025-08-18T02-14-11-850Z.json
```

## 📊 **Current Data Status**

Based on your current configuration:

- **Total Devices**: 2
- **Total Images**: 6
- **Last Updated**: 2025-08-18T02:14:11.850Z

### Configured Devices:
1. **PIXEL 8 (GOOGLE)** - 4 images
2. **FOLD 5 (SAMSUNG)** - 2 images

## 🚨 **Emergency Recovery Procedures**

### Scenario 1: Main Config File Corrupted
```bash
# 1. Check available backups
npm run restore-images

# 2. Restore from latest backup
npm run restore-images dynamic-images-[latest-timestamp].json

# 3. Verify restoration
curl http://localhost:3003/api/images
```

### Scenario 2: Complete System Failure
```bash
# 1. Reinstall application
git clone [your-repo]
npm install

# 2. Restore from backup
npm run restore-images [backup-file]

# 3. Restart server
npm run dev
```

### Scenario 3: Manual Recovery
If all else fails, you can manually edit the JSON file:

```json
{
  "devices": [
    {
      "device": "PIXEL",
      "model": "8", 
      "brand": "GOOGLE",
      "imageUrls": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "lastUpdated": "2025-08-18T02:14:11.850Z"
    }
  ],
  "lastUpdated": "2025-08-18T02:14:11.850Z"
}
```

## 🔄 **Automatic Backup System**

### Backup Triggers:
- ✅ **Manual backup**: `npm run backup-images`
- ✅ **Before restore**: Automatic pre-restore backup
- 🔄 **Scheduled backup**: Can be added to cron jobs

### Backup Retention:
- **Keep**: Last 10 backups
- **Auto-cleanup**: Old backups automatically deleted
- **Storage**: Local file system

## 📋 **Best Practices**

### 1. Regular Backups
```bash
# Add to your daily routine
npm run backup-images
```

### 2. Version Control
```bash
# Commit your data to git for additional safety
git add data/dynamic-images.json
git commit -m "Backup image configurations"
```

### 3. External Backup
```bash
# Copy to external storage
cp data/dynamic-images.json /backup/external/
```

### 4. Monitor Data Health
```bash
# Check data integrity
curl http://localhost:3003/api/images | jq '.devices | length'
```

## 🎯 **Recovery Checklist**

When recovering from any issue:

- [ ] **Verify backup exists**: `npm run restore-images`
- [ ] **Check data integrity**: API returns valid JSON
- [ ] **Test admin interface**: Can view/edit images
- [ ] **Verify main page**: Images display correctly
- [ ] **Create new backup**: `npm run backup-images`

## 🆘 **Emergency Contacts**

If you need help with recovery:

1. **Check logs**: `npm run dev` (look for errors)
2. **Verify file permissions**: Ensure read/write access
3. **Check disk space**: Ensure sufficient storage
4. **Review backup files**: Manual inspection if needed

## 📈 **Data Statistics**

Your current system contains:
- **2 device configurations**
- **6 total images**
- **2 brands** (GOOGLE, SAMSUNG)
- **Last backup**: Available via `npm run backup-images`

## 🎉 **Summary**

Your image management system is **highly resilient**:

✅ **Automatic persistence** - Data survives all normal operations  
✅ **Backup system** - Multiple recovery points  
✅ **Manual recovery** - Direct file editing possible  
✅ **Version control** - Git integration for additional safety  
✅ **Monitoring** - Easy verification of data health  

**Your data is safe and recoverable!** 🛡️
