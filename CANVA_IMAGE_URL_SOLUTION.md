# Canva Image URL Problem - SOLUTION

## ❌ The Problem

You're trying to use Canva links like:
```
https://www.canva.com/design/DAG3lDcyigs/4VohWV_epQd5WrDVe8aJGg/view?...
```

These links are **HTML pages**, NOT image files. They won't work in `<img>` tags.

## ✅ The Solution: Download & Host

### **Step 1: Download Your Banner**

1. In Canva, click **"Download"** (top right)
2. Choose **PNG** (best for banners) or **JPG**
3. Select size: **1920 x 600** (or larger)
4. Click **"Download"**

### **Step 2: Upload to Imgur (Easiest)**

1. Go to https://imgur.com/upload
2. Drag your downloaded image into the page
3. Wait for upload
4. Right-click the image → **"Copy image address"**
5. You'll get a URL like: `https://i.imgur.com/xxxxx.png`

### **Step 3: Use in Banner Admin**

1. Go to `/admin/banners`
2. Paste the Imgur URL in "Image URL" field
3. Save

---

## 🎯 **About the 500 Error**

Your 500 error is a **PostgREST cache** issue. The tables exist in Supabase but PostgREST hasn't refreshed yet. **This will resolve automatically in a few minutes.**

To check if it's fixed:
1. Wait 2-3 minutes
2. Refresh `/admin/banners` page
3. Try again

**Right now, you need to:**
1. Download your banner from Canva
2. Upload to Imgur
3. Use the Imgur URL

Once the cache refreshes AND you have a proper image URL, everything will work!

---

## 📝 **Summary**

❌ **Don't use**: Canva view/edit links  
✅ **DO use**: Downloaded image uploaded to Imgur, Cloudinary, or your own CDN  
✅ **Format**: URLs ending in `.jpg`, `.png`, `.webp`

