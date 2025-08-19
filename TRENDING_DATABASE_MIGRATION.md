# Trending System Database Migration

## 🎯 Problem Solved

Your trending data was resetting every time you restarted the server because it was stored in memory. Now it's migrated to Supabase for persistent storage.

## ✅ Solution Implemented

### **🔧 Database Tables Created**

1. **`trending_products`** - Stores product interaction metrics
   - `product_id` - Unique product identifier
   - `brand` - Product brand
   - `name` - Product name
   - `total_views` - Total product views
   - `total_clicks` - Total result clicks
   - `total_searches` - Total searches
   - `trending_score` - Calculated trending score
   - `last_interaction` - Last interaction timestamp

2. **`fire_badges`** - Stores fire badge data
   - `product_id` - Product with fire badge
   - `position` - Badge position (1, 2, 3, or 'new')
   - `start_time` - Badge start time
   - `end_time` - Badge expiration time
   - `is_active` - Whether badge is currently active

3. **`trending_config`** - System configuration
   - `update_interval` - Update frequency (minutes)
   - `is_enabled` - Whether trending is enabled
   - `last_update` - Last system update

### **🚀 New API Endpoint**

- **`/api/ranking/trending-db`** - Database-based trending system
  - `GET` - Retrieve trending products
  - `POST` - Sync interactions and manage system

### **📊 Updated Tracking System**

- **`/api/ranking/track`** - Now syncs with database trending system
- All interactions are stored persistently in Supabase
- Trending scores calculated and stored in database

## 🛠️ Setup Instructions

### **1. Create Database Tables**

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of scripts/setup-trending-tables.sql
```

### **2. Test the System**

```bash
# Test database tables
npm run test-trending-db

# Start development server
npm run dev
```

### **3. Verify Migration**

- Visit `http://localhost:3000`
- Interact with products (view, click, search)
- Check trending data persists after server restart

## 🎯 Benefits

### **Before Migration:**
- ❌ Trending data lost on server restart
- ❌ In-memory storage only
- ❌ No persistence across deployments
- ❌ Fire badges reset frequently

### **After Migration:**
- ✅ Trending data persists across restarts
- ✅ Database-backed storage
- ✅ Persistent across deployments
- ✅ Fire badges managed in database
- ✅ Configuration stored persistently

## 📈 How It Works

### **Interaction Flow:**
1. User interacts with product (view, click, search)
2. `/api/ranking/track` records interaction
3. Interaction synced to `/api/ranking/trending-db`
4. Database updated with new metrics
5. Trending scores recalculated
6. Fire badges updated for top products

### **Data Persistence:**
- All interaction data stored in `trending_products` table
- Fire badge data stored in `fire_badges` table
- System configuration in `trending_config` table
- Data survives server restarts and deployments

### **Performance:**
- Database indexes for fast queries
- Efficient trending score calculations
- Automatic cleanup of expired fire badges
- Cached trending results

## 🔧 Configuration

### **Trending Weights:**
- Product View: 3.0 points
- Result Click: 5.0 points
- Search: 1.5 points
- Time decay: 1 week

### **Fire Badge Durations:**
- Position 1: 2 hours
- Position 2: 1 hour
- Position 3: 30 minutes
- New items: 1 hour

## 🧪 Testing

### **Manual Testing:**
1. Start server: `npm run dev`
2. Visit catalog page
3. View, click, and search products
4. Check trending data in admin panel
5. Restart server
6. Verify trending data persists

### **Automated Testing:**
```bash
npm run test-trending-db
```

## 📊 Monitoring

### **Database Queries:**
```sql
-- Check trending products
SELECT * FROM trending_products ORDER BY trending_score DESC LIMIT 10;

-- Check active fire badges
SELECT * FROM fire_badges WHERE is_active = true;

-- Check system config
SELECT * FROM trending_config WHERE id = 'default';
```

### **API Endpoints:**
- `GET /api/ranking/trending-db` - Get trending products
- `POST /api/ranking/trending-db` - Sync interactions
- `GET /api/ranking/track` - Track user interactions

## 🚀 Next Steps

1. **Deploy the changes** to your production environment
2. **Monitor trending data** for a few days
3. **Verify persistence** across server restarts
4. **Adjust weights** if needed based on performance
5. **Consider analytics** for trending insights

## 🔄 Migration Status

- ✅ Database tables created
- ✅ API endpoints updated
- ✅ Tracking system migrated
- ✅ Test scripts created
- ✅ Documentation complete

Your trending system is now fully database-backed and will persist across server restarts! 🎉
