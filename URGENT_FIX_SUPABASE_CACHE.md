# URGENT: Supabase PostgREST Cache Issue

## The Problem

Your `banners` table EXISTS in Supabase (confirmed via SQL queries), but PostgREST API can't see it. This is causing all `/api/admin/banners` requests to return 500 errors.

## Root Cause

PostgREST maintains an internal schema cache. When you create new tables, it can take several minutes for the cache to refresh automatically.

## Immediate Solutions

### **Option 1: Wait it Out** (Easiest, 5-10 minutes)

The cache usually refreshes automatically within 5-10 minutes of creating tables.

**Test:**
```bash
# Just wait and try again
```

### **Option 2: Use Supabase Dashboard** (Most Reliable)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API** → **Restart** (if available)
4. Or make a small dummy edit to trigger cache refresh

### **Option 3: Contact Supabase Support** (If urgent)

Use their chat support or create a GitHub issue. They can manually refresh the cache from their end.

### **Option 4: Temporary Workaround** (For testing)

For now, you can manually insert the banner data via SQL:

1. Go to Supabase Dashboard → SQL Editor
2. Run:
```sql
INSERT INTO banners (id, title, description, image_url, link_url, link_text, is_active, display_order) 
VALUES 
  ('banner-2', 'Your Title', 'Your Description', 'YOUR_IMGUR_URL_HERE', '/', 'Shop Now', true, 2)
ON CONFLICT (id) DO UPDATE 
SET title = EXCLUDED.title, 
    description = EXCLUDED.description, 
    image_url = EXCLUDED.image_url;
```

Replace `YOUR_IMGUR_DIRECT_URL_HERE` with the actual image URL (ending in .jpg or .png).

---

## Getting the Correct Imgur URL

**You shared:** `https://imgur.com/a/Xc20Y6J` ❌ (This is a gallery album)

**You need:** `https://i.imgur.com/xxxxx.png` ✅ (Direct image)

**How to get it:**
1. Open https://imgur.com/a/Xc20Y6J in your browser
2. Right-click the image → "Copy image address"
3. Use that URL

---

## Quick Status Check

Tables exist in database: ✅  
PostgREST can see them: ❌ (cache issue)  
Your code is correct: ✅  
Admin UI is ready: ✅  

**ETA:** Cache should refresh automatically in 5-10 minutes. Your upload will work once it does!

