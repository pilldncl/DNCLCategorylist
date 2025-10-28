# Vercel Environment Variables Setup Guide

## 🚨 CRITICAL: Required Environment Variables for Sync to Work

The Google Sheets sync functionality requires these environment variables to be set in your Vercel deployment:

### Required Variables:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://tvzcqwdnsyqjglmwklkk.supabase.co`
   - Purpose: Supabase project URL

2. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: `sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp`
   - Purpose: Service role key for admin operations (sync, delete, etc.)

3. **SHEET_CSV_URL**
   - Value: Your Google Sheets CSV export URL
   - Format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv`
   - Purpose: URL to fetch data from Google Sheets

### Optional Variables:

4. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: `sb_publishable_qYf-tav14oF7rIPCqy2a5w_b-dpE-7R`
   - Purpose: Public key for client-side operations

5. **CACHE_SECONDS**
   - Value: `300` (or any number)
   - Purpose: Cache duration for API responses

## 🔧 How to Set Environment Variables in Vercel:

### Method 1: Vercel Dashboard
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with its value
5. Make sure to set them for **Production**, **Preview**, and **Development**

### Method 2: Vercel CLI
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SHEET_CSV_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add CACHE_SECONDS
```

## 🧪 Testing Your Setup:

After setting the environment variables:

1. **Redeploy** your Vercel project
2. Go to your admin panel → Sync Management
3. Click "Sync from Google Sheets"
4. Check the response for any error messages

## 🐛 Common Issues:

### Issue: "Missing required environment variables"
**Solution:** Make sure all required variables are set in Vercel dashboard

### Issue: "Database connection failed"
**Solution:** Check that SUPABASE_SERVICE_ROLE_KEY is correct

### Issue: "Failed to fetch CSV"
**Solution:** Check that SHEET_CSV_URL is correct and Google Sheet is publicly accessible

### Issue: "No valid items found in Google Sheets"
**Solution:** Check your Google Sheets format - it needs columns: brand, sku, product description, etc.

## 📋 Google Sheets Format Requirements:

Your Google Sheet must have these columns:
- `brand` (required)
- `sku` (required) 
- `product description` or `productdescription` (required)
- `grade` (optional)
- `qty` (optional)
- `wholesale price` (optional)
- `category` (optional)

## 🔍 Debugging:

If sync still doesn't work:

1. Check Vercel function logs in the dashboard
2. Look for error messages in the sync response
3. Verify your Google Sheet is publicly accessible
4. Test the CSV URL directly in a browser

## ✅ Success Indicators:

When sync works correctly, you should see:
- "Sync completed successfully! X items synced. Y items deleted."
- Items in your database match Google Sheets
- Sync logs appear in the admin panel
