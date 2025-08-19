# Supabase Implementation Guide

## 🚀 Quick Start Implementation

### Step 1: Install Dependencies
```bash
npm install @supabase/supabase-js
```

### Step 2: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key

### Step 3: Environment Setup
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 4: Database Schema
Run this SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Insert default admin user
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2a$10$your_hashed_password', 'admin');

-- Catalog items table
CREATE TABLE catalog_items (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  sku VARCHAR(255),
  grade VARCHAR(100),
  min_qty INTEGER DEFAULT 1,
  category VARCHAR(255),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- System settings table
CREATE TABLE system_settings (
  id VARCHAR(255) PRIMARY KEY DEFAULT 'default',
  settings JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (settings) VALUES ('{
  "ranking": {
    "pageViewWeight": 1.0,
    "categoryViewWeight": 2.0,
    "productViewWeight": 3.0,
    "resultClickWeight": 5.0,
    "searchWeight": 1.5,
    "recencyWeight": 2.0
  },
  "trending": {
    "cacheDuration": 300,
    "maxTrendingItems": 10,
    "updateInterval": 60
  },
  "analytics": {
    "retentionDays": 30,
    "autoCleanup": true,
    "detailedLogging": false
  },
  "security": {
    "sessionTimeout": 3600,
    "maxLoginAttempts": 5,
    "requirePasswordChange": false
  }
}');

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT NOW(),
  level VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  username VARCHAR(255),
  ip_address INET,
  metadata JSONB
);

-- User interactions table
CREATE TABLE user_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id),
  interaction_type VARCHAR(100) NOT NULL,
  product_id VARCHAR(255),
  brand VARCHAR(255),
  search_term TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Product metrics table
CREATE TABLE product_metrics (
  product_id VARCHAR(255) PRIMARY KEY,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  searches INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Dynamic images table
CREATE TABLE dynamic_images (
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
CREATE INDEX idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX idx_user_interactions_timestamp ON user_interactions(timestamp);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX idx_catalog_items_brand ON catalog_items(brand);
CREATE INDEX idx_catalog_items_category ON catalog_items(category);
```

### Step 5: Supabase Client Setup
Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password_hash: string
          role: 'admin' | 'user'
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          role?: 'admin' | 'user'
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          role?: 'admin' | 'user'
          created_at?: string
          created_by?: string | null
        }
      }
      catalog_items: {
        Row: {
          id: string
          name: string
          brand: string
          description: string | null
          price: number | null
          sku: string | null
          grade: string | null
          min_qty: number
          category: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          brand: string
          description?: string | null
          price?: number | null
          sku?: string | null
          grade?: string | null
          min_qty?: number
          category?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string
          description?: string | null
          price?: number | null
          sku?: string | null
          grade?: string | null
          min_qty?: number
          category?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          settings: any
          updated_at: string
        }
        Insert: {
          id?: string
          settings: any
          updated_at?: string
        }
        Update: {
          id?: string
          settings?: any
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          timestamp: string
          level: string
          category: string
          message: string
          username: string | null
          ip_address: string | null
          metadata: any | null
        }
        Insert: {
          id?: string
          timestamp?: string
          level: string
          category: string
          message: string
          username?: string | null
          ip_address?: string | null
          metadata?: any | null
        }
        Update: {
          id?: string
          timestamp?: string
          level?: string
          category?: string
          message?: string
          username?: string | null
          ip_address?: string | null
          metadata?: any | null
        }
      }
      user_interactions: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          interaction_type: string
          product_id: string | null
          brand: string | null
          search_term: string | null
          timestamp: string
          metadata: any | null
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          interaction_type: string
          product_id?: string | null
          brand?: string | null
          search_term?: string | null
          timestamp?: string
          metadata?: any | null
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string | null
          interaction_type?: string
          product_id?: string | null
          brand?: string | null
          search_term?: string | null
          timestamp?: string
          metadata?: any | null
        }
      }
      product_metrics: {
        Row: {
          product_id: string
          views: number
          clicks: number
          searches: number
          last_updated: string
        }
        Insert: {
          product_id: string
          views?: number
          clicks?: number
          searches?: number
          last_updated?: string
        }
        Update: {
          product_id?: string
          views?: number
          clicks?: number
          searches?: number
          last_updated?: string
        }
      }
      dynamic_images: {
        Row: {
          id: string
          device: string
          model: string
          brand: string
          image_urls: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          device: string
          model: string
          brand: string
          image_urls: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          device?: string
          model?: string
          brand?: string
          image_urls?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
```

### Step 6: Update API Routes

#### Example: Users API (`/api/admin/auth/login/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session token
    const token = Buffer.from(`${user.id}:${user.role}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Example: Catalog API (`/api/catalog/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: items, error } = await supabase
      .from('catalog_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ items: items || [] });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalog data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.brand || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Name, brand, and description are required' },
        { status: 400 }
      );
    }

    const id = `${body.brand}-${body.sku || body.name}`.toLowerCase().replace(/\s+/g, '-');
    
    const { data, error } = await supabase
      .from('catalog_items')
      .insert({
        id,
        name: body.name,
        brand: body.brand,
        description: body.description,
        price: parseFloat(body.price) || 0,
        sku: body.sku || body.name,
        grade: body.grade || 'Standard',
        min_qty: parseInt(body.min_qty) || 1,
        category: body.category || '',
        image_url: body.image || ''
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    console.error('Error creating catalog item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
```

### Step 7: Migration Script
Create `scripts/migrate-to-supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrateData() {
  console.log('Starting migration to Supabase...');

  // Migrate users
  const users = [
    {
      username: 'admin',
      password_hash: '$2a$10$your_hashed_password', // Use bcrypt to hash
      role: 'admin'
    }
  ];

  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'username' });
    
    if (error) {
      console.error('Error migrating user:', error);
    } else {
      console.log(`Migrated user: ${user.username}`);
    }
  }

  // Migrate catalog items (if any)
  const catalogItems = [
    // Your existing catalog items
  ];

  for (const item of catalogItems) {
    const { error } = await supabase
      .from('catalog_items')
      .upsert(item, { onConflict: 'id' });
    
    if (error) {
      console.error('Error migrating catalog item:', error);
    } else {
      console.log(`Migrated catalog item: ${item.name}`);
    }
  }

  console.log('Migration completed!');
}

migrateData().catch(console.error);
```

### Step 8: Add Migration Script to package.json
```json
{
  "scripts": {
    "migrate-supabase": "node scripts/migrate-to-supabase.js"
  }
}
```

## 🔧 Additional Setup

### Row Level Security (RLS)
Enable RLS in Supabase and create policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can view catalog items" ON catalog_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage catalog items" ON catalog_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );
```

### Real-time Subscriptions
```typescript
// Subscribe to real-time updates
const subscription = supabase
  .channel('catalog_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'catalog_items' },
    (payload) => {
      console.log('Catalog changed:', payload);
      // Update your UI
    }
  )
  .subscribe();
```

## 🚀 Benefits After Migration

1. **Data Persistence**: No more data loss on server restarts
2. **Scalability**: Handle more users and data
3. **Real-time Updates**: Live updates across all clients
4. **Backup & Recovery**: Automatic backups
5. **Security**: Row-level security and authentication
6. **Performance**: Optimized queries and caching

## 📊 Monitoring

Use Supabase Dashboard to monitor:
- Database performance
- API usage
- Real-time connections
- Storage usage
- Error logs

Would you like me to implement this step by step for you?
