# How to Get a Direct Image URL from Canva

## ❌ **Wrong URL (Edit Link)**
```
https://www.canva.com/design/DAG3lDcyigs/Yukfyb9mHyLF0qxz2VYzBQ/edit...
```

This is the **edit link**, not an image URL. It won't work.

---

## ✅ **Correct Methods**

### **Method 1: Share Link (Easiest)**

1. In Canva, click **"Share"** button
2. Click **"More"** at the bottom
3. Select **"Share as image"** or **"Get public link"**
4. Choose **"Public"**
5. Copy the link

The URL will look like:
```
https://www.canva.com/design/DAFxxxxx/view
```

### **Method 2: Download & Host**

1. Click **"Download"** in Canva
2. Choose format: **PNG** or **JPG** (PNG is better)
3. Select size: **1920x1080** or larger
4. Download the file

Then upload to:

#### **Option A: Imgur (Free)**
1. Go to https://imgur.com
2. Upload your image
3. Copy the **direct link** (ends with `.jpg` or `.png`)
4. Use this link in your banner admin

#### **Option B: Supabase Storage (If Set Up)**
1. Go to your Supabase Dashboard
2. Navigate to Storage → Create bucket "banners"
3. Upload your image
4. Get the public URL

#### **Option C: Google Drive (Temporary)**
1. Upload to Google Drive
2. Right-click → Get link → Anyone with link
3. Copy the link
4. Note: You'll need to extract the file ID

---

## 🎯 **Recommended Format**

For banners, use:
- **Width**: 1920px (or 1200px minimum)
- **Height**: 500-800px
- **Format**: PNG (for transparency) or JPG (for photos)
- **File size**: Under 500KB

---

## 🔍 **Quick Check**

If your URL ends with:
- ✅ `.jpg`, `.png`, `.webp` → **Good!**
- ✅ `/view` → **Good!** (Canva share link)
- ❌ `/edit` → **Bad!** (Edit link, won't work)
- ❌ `/design/...` → **Check if it has `/view`**

---

## 💡 **Pro Tip**

For best results, use **Imgur** or **Supabase Storage**:
- Fast loading
- No expiration
- Direct image links
- Free (within limits)

