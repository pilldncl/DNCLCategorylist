# Supabase Setup Guide for Database-Driven Images

## 🚀 Quick Setup

To enable the database-driven image system, you need to configure your Supabase environment variables.

## 📋 Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project** (or create a new one)
3. **Go to Settings → API**
4. **Copy these values**:

### Required Values:
- **Project URL**: `https://tvzcqwdnsyqjglmwklkk.supabase.co` (you already have this)
- **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (starts with `eyJ`)
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (starts with `eyJ`)

## 📝 Step 2: Create .env.local File

Create a file called `.env.local` in your project root with this content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tvzcqwdnsyqjglmwklkk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Replace the placeholder values with your actual keys from Step 1.**

## 🗄️ Step 3: Set Up Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dynamic images table
CREATE TABLE IF NOT EXISTS dynamic_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  image_urls TEXT[] NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(device, model, brand)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dynamic_images_device ON dynamic_images(device);
CREATE INDEX IF NOT EXISTS idx_dynamic_images_brand ON dynamic_images(brand);
CREATE INDEX IF NOT EXISTS idx_dynamic_images_created_at ON dynamic_images(created_at);

-- Enable Row Level Security
ALTER TABLE dynamic_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read dynamic images
CREATE POLICY "Anyone can view dynamic images" ON dynamic_images
  FOR SELECT USING (true);

-- Allow authenticated users to manage dynamic images
CREATE POLICY "Authenticated users can manage dynamic images" ON dynamic_images
  FOR ALL USING (auth.role() = 'authenticated');
```

## ✅ Step 4: Test the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Run the migration script**:
   ```bash
   npm run migrate-images
   ```

3. **Check the admin interface**:
   - Go to `http://localhost:3000/admin/images`
   - Look for the "Database Status" panel
   - Should show "Connected to Database" in green

## 🔧 Troubleshooting

### "Missing Supabase environment variables"

**Solution**: Make sure your `.env.local` file exists and has the correct values.

### "Database connection failed"

**Solutions**:
1. Check your Supabase project is active
2. Verify the keys are correct
3. Ensure the `dynamic_images` table exists
4. Check network connectivity

### "Permission denied"

**Solutions**:
1. Make sure you're using the service role key for admin operations
2. Check Row Level Security policies
3. Verify your Supabase project settings

## 📊 Verification Checklist

- [ ] `.env.local` file created with correct values
- [ ] Supabase project is active
- [ ] `dynamic_images` table created in database
- [ ] Migration script runs successfully
- [ ] Admin interface shows "Connected to Database"
- [ ] Can add/edit/delete images through admin interface

## 🎯 Next Steps

Once setup is complete:

1. **Migrate existing data**: `npm run migrate-images`
2. **Test functionality**: Use the admin interface at `/admin/images`
3. **Add new images**: Start managing your product images through the database
4. **Monitor status**: Use the database status panel in the admin interface

## 📞 Need Help?

If you encounter issues:

1. **Check the console logs** for error messages
2. **Verify your Supabase dashboard** for any errors
3. **Review the database logs** in Supabase
4. **Test the connection** using the migration script

---

**🎉 Once completed, your image system will be fully database-driven with persistent storage and real-time updates!**
