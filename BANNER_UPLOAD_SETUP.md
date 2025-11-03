# Banner Image Upload Setup Guide

## ✅ What's Already Done

1. **Supabase Tables Created** ✓
   - `banners` table in Supabase database
   - `featured_products` table in Supabase database
   - All API endpoints updated to use Supabase
   - Featured products display fixed

2. **Admin Interface** ✓
   - Banner management page (`/admin/banners`)
   - Featured products management page (`/admin/featured`)
   - Full CRUD operations working

## 🚀 Quick Setup for Dynamic File Uploads

Your system now supports **dynamic banner management** with Supabase!

### **Option 1: Manual Image URLs (Working Now)**

Currently, admins can add banner images by providing URLs. This works with:
- External image hosting (Imgur, Cloudinary, etc.)
- Your own CDN
- Supabase Storage URLs (once you set it up)

**How to use:**
1. Go to `/admin/banners`
2. Click "Add Banner" or "Edit"
3. Paste the image URL in the "Image URL" field
4. Click "Save Banner"

### **Option 2: Supabase Storage (Recommended for Production)**

To enable **direct file uploads** to Supabase Storage:

#### **Step 1: Create Storage Bucket**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **"Create a new bucket"**
4. Configure:
   - **Name**: `banners`
   - **Public bucket**: ✅ Checked
   - **File size limit**: 5MB (or your preference)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp`

#### **Step 2: Set Bucket Policies**

In Storage → Policies → Create new policy for `banners` bucket:

**For uploading:**
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'banners' AND
  (storage.foldername(name))[1] = 'banners'
);
```

**For reading:**
```sql
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'banners');
```

#### **Step 3: Test Current System First**

Before implementing file uploads, test the current URL-based system:

1. Go to `/admin/banners`
2. Try editing the existing banner
3. Save your changes
4. Refresh the homepage to see the banner

The Supabase integration is now live! Changes persist across server restarts.

## 📝 Next Steps (Optional - File Upload Feature)

If you want to add direct file upload capability, I can help you implement:

1. **File Upload API** (`/api/upload/banner`)
   - Accepts multipart/form-data
   - Uploads to Supabase Storage
   - Returns public URL

2. **Upload UI Component**
   - File picker in banner admin
   - Preview before upload
   - Progress indicator
   - URL auto-fill after upload

3. **Image Optimization**
   - Automatic resizing
   - Format conversion (WebP)
   - Compression

## 🔍 Current Status

✅ **Supabase Integration**: Complete  
✅ **Data Persistence**: Working  
✅ **Admin Interface**: Fully functional  
🔄 **Direct File Uploads**: Optional enhancement  

For now, admins can manage banners using image URLs from any source. This works perfectly with external CDNs or image hosting services.

## 💡 Pro Tip

If you're using external image hosting (Imgur, Cloudinary, S3, etc.), just use those URLs directly in the banner admin. No additional setup needed! The Supabase integration ensures all banner data is safely stored in the database and survives server restarts.

