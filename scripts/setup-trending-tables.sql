-- Trending System Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create trending_products table for persistent trending data
CREATE TABLE IF NOT EXISTS trending_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_searches INTEGER DEFAULT 0,
  trending_score INTEGER DEFAULT 0,
  last_interaction TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id)
);

-- Create fire_badges table for persistent fire badge data
CREATE TABLE IF NOT EXISTS fire_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  position VARCHAR(10) NOT NULL, -- '1', '2', '3', or 'new'
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create trending_config table for system configuration
CREATE TABLE IF NOT EXISTS trending_config (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
  update_interval INTEGER DEFAULT 5,
  is_enabled BOOLEAN DEFAULT true,
  last_update TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default trending config
INSERT INTO trending_config (id, update_interval, is_enabled, last_update)
VALUES ('default', 5, true, NOW())
ON CONFLICT (id) DO UPDATE SET
  update_interval = EXCLUDED.update_interval,
  is_enabled = EXCLUDED.is_enabled,
  last_update = EXCLUDED.last_update,
  updated_at = NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trending_products_score ON trending_products(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_products_brand ON trending_products(brand);
CREATE INDEX IF NOT EXISTS idx_trending_products_last_interaction ON trending_products(last_interaction DESC);

CREATE INDEX IF NOT EXISTS idx_fire_badges_product_id ON fire_badges(product_id);
CREATE INDEX IF NOT EXISTS idx_fire_badges_is_active ON fire_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_fire_badges_end_time ON fire_badges(end_time);

-- Enable Row Level Security (RLS) for security
ALTER TABLE trending_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE fire_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_config ENABLE ROW LEVEL SECURITY;

-- Create policies for read access (public read, authenticated write)
CREATE POLICY "Allow public read access to trending_products" ON trending_products
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write access to trending_products" ON trending_products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to fire_badges" ON fire_badges
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write access to fire_badges" ON fire_badges
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to trending_config" ON trending_config
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated write access to trending_config" ON trending_config
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON trending_products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fire_badges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON trending_config TO authenticated;

GRANT SELECT ON trending_products TO anon;
GRANT SELECT ON fire_badges TO anon;
GRANT SELECT ON trending_config TO anon;
