# Google Sheets to Supabase Sync Setup Guide

## Overview

This guide will help you set up automatic synchronization between your Google Sheets and Supabase database. This ensures that any changes made in Google Sheets are automatically reflected in your application.

## 🎯 Benefits

- **Real-time Updates**: Changes in Google Sheets automatically sync to Supabase
- **No Manual Work**: Eliminates the need for manual data entry
- **Data Consistency**: Ensures your application always has the latest data
- **Multiple Sync Options**: Choose from automatic, manual, or scheduled syncs

## 📋 Prerequisites

- ✅ Google Sheets with your catalog data
- ✅ Supabase project set up
- ✅ Admin access to your application

## 🚀 Setup Options

### Option 1: Google Apps Script (Recommended)

This is the most automated solution that runs directly from Google Sheets.

#### Step 1: Open Google Apps Script

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. This will open the Google Apps Script editor

#### Step 2: Add the Sync Script

1. Delete any existing code in the editor
2. Copy the entire content from `scripts/google-sheets-sync.js`
3. Paste it into the Apps Script editor
4. Click **Save** (💾 icon)

#### Step 3: Configure the Script

The script is already configured with your Supabase credentials:
- **URL**: `https://tvzcqwdnsyqjglmwklkk.supabase.co`
- **Service Key**: `sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp`

#### Step 4: Set Up Auto-Sync

1. In the Apps Script editor, click **Run** → **setupAutoSync**
2. Grant necessary permissions when prompted
3. This creates a trigger that runs every hour

#### Step 5: Test the Connection

1. In the Apps Script editor, click **Run** → **testSupabaseConnection**
2. Check the execution log for success message

#### Step 6: Add Custom Menu

1. Refresh your Google Sheet
2. You should see a new menu: **Supabase Sync**
3. This menu provides manual sync options

### Option 2: Backend API Sync

Use your application's admin interface to trigger syncs manually.

#### Step 1: Access Sync Management

1. Log into your admin panel: `http://localhost:3000/admin/login`
2. Navigate to **Sync Management** in the admin dashboard
3. Use the **Sync from Google Sheets** button

#### Step 2: Monitor Sync Logs

- View recent sync activities
- Check for any errors
- Monitor sync statistics

## 🔄 Sync Triggers

### Automatic Triggers

1. **Hourly Sync**: Runs every hour automatically
2. **On Edit**: Triggers when you edit the Google Sheet
3. **Scheduled**: Can be customized to run at specific times

### Manual Triggers

1. **Google Sheet Menu**: Use the "Supabase Sync" menu
2. **Admin Panel**: Use the sync management page
3. **API Call**: Direct API endpoint calls

## 📊 Sync Process

### What Gets Synced

- ✅ Product names and SKUs
- ✅ Brand information
- ✅ Prices and descriptions
- ✅ Categories and grades
- ✅ Minimum quantities

### Sync Behavior

- **New Items**: Added to Supabase
- **Existing Items**: Updated with latest data
- **Deleted Items**: Remain in Supabase (manual cleanup required)
- **Validation**: Only items with required fields are synced

## 🛠️ Troubleshooting

### Common Issues

#### 1. Permission Errors
```
Error: Supabase connection failed
```
**Solution**: Check your Supabase service key and URL

#### 2. Data Not Syncing
```
Error: No data found in sheet
```
**Solution**: Ensure your Google Sheet has data and proper headers

#### 3. Rate Limiting
```
Error: Too many requests
```
**Solution**: The script includes delays to avoid rate limits

### Debug Steps

1. **Test Connection**: Run `testSupabaseConnection()` in Apps Script
2. **Check Logs**: View execution logs in Apps Script
3. **Verify Data**: Check your Google Sheet format
4. **Monitor Sync**: Use the admin panel to view sync logs

## 📈 Monitoring

### Sync Logs

All sync activities are logged in Supabase:
- **Location**: `activity_logs` table
- **Category**: `sync`
- **Details**: Success/failure messages with statistics

### Admin Dashboard

Monitor sync status through:
- **Sync Management Page**: `/admin/sync`
- **Activity Logs**: `/admin/logs`
- **Real-time Updates**: Automatic refresh

## 🔧 Customization

### Modify Sync Frequency

In Google Apps Script, edit the `setupAutoSync()` function:

```javascript
// Change from every hour to every 30 minutes
ScriptApp.newTrigger('syncToSupabase')
  .timeBased()
  .everyMinutes(30)  // Instead of everyHours(1)
  .create();
```

### Add Custom Fields

To sync additional fields, modify the `syncToSupabase()` function:

```javascript
const catalogItem = {
  // ... existing fields ...
  custom_field: item['custom_field'] || '',
  // Add more fields as needed
};
```

### Filter Data

To sync only specific data:

```javascript
// Example: Only sync items with price > 100
if (catalogItem.price > 100) {
  catalogItems.push(catalogItem);
}
```

## 🚨 Best Practices

### Data Management

1. **Backup Regularly**: Keep backups of your Google Sheet
2. **Validate Data**: Ensure data quality before syncing
3. **Monitor Changes**: Review sync logs regularly
4. **Test Changes**: Test sync after modifying the script

### Performance

1. **Batch Processing**: The script processes items individually with delays
2. **Rate Limiting**: Built-in delays prevent API rate limits
3. **Error Handling**: Failed items are logged but don't stop the sync

### Security

1. **Service Key**: Keep your Supabase service key secure
2. **Permissions**: Only grant necessary permissions to Apps Script
3. **Access Control**: Limit who can modify the sync script

## 📞 Support

If you encounter issues:

1. **Check Logs**: Review execution logs in Apps Script
2. **Verify Setup**: Ensure all steps were completed correctly
3. **Test Connection**: Use the test functions provided
4. **Review Data**: Check your Google Sheet format and data

## 🎉 Success Indicators

You'll know the sync is working when:

- ✅ Sync logs appear in your admin panel
- ✅ Data updates automatically in your application
- ✅ No errors in Apps Script execution logs
- ✅ Sync statistics show successful operations

---

**Need Help?** Check the troubleshooting section or review the sync logs for specific error messages.
