-- Supabase Database Schema Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Insert default admin user (password: Ustvmos817)
INSERT INTO users (username, password_hash, role) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Catalog items table
CREATE TABLE IF NOT EXISTS catalog_items (
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
CREATE TABLE IF NOT EXISTS system_settings (
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
}')
ON CONFLICT (id) DO NOTHING;

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
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
CREATE TABLE IF NOT EXISTS user_interactions (
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
CREATE TABLE IF NOT EXISTS product_metrics (
  product_id VARCHAR(255) PRIMARY KEY,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  searches INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

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
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_catalog_items_brand ON catalog_items(brand);
CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON catalog_items(category);
CREATE INDEX IF NOT EXISTS idx_user_interactions_brand ON user_interactions(brand);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dynamic_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own data
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Anyone can view catalog items
CREATE POLICY "Anyone can view catalog items" ON catalog_items
  FOR SELECT USING (true);

-- Admins can manage catalog items
CREATE POLICY "Admins can manage catalog items" ON catalog_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Anyone can insert user interactions
CREATE POLICY "Anyone can insert user interactions" ON user_interactions
  FOR INSERT WITH CHECK (true);

-- Anyone can view user interactions
CREATE POLICY "Anyone can view user interactions" ON user_interactions
  FOR SELECT USING (true);

-- Anyone can insert activity logs
CREATE POLICY "Anyone can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- Admins can view activity logs
CREATE POLICY "Admins can view activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Anyone can view product metrics
CREATE POLICY "Anyone can view product metrics" ON product_metrics
  FOR SELECT USING (true);

-- Anyone can update product metrics
CREATE POLICY "Anyone can update product metrics" ON product_metrics
  FOR UPDATE USING (true);

-- Anyone can insert product metrics
CREATE POLICY "Anyone can insert product metrics" ON product_metrics
  FOR INSERT WITH CHECK (true);

-- Anyone can view system settings
CREATE POLICY "Anyone can view system settings" ON system_settings
  FOR SELECT USING (true);

-- Admins can manage system settings
CREATE POLICY "Admins can manage system settings" ON system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Anyone can view dynamic images
CREATE POLICY "Anyone can view dynamic images" ON dynamic_images
  FOR SELECT USING (true);

-- Admins can manage dynamic images
CREATE POLICY "Admins can manage dynamic images" ON dynamic_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Insert some sample catalog items
INSERT INTO catalog_items (id, name, brand, description, price, sku, grade, min_qty, category, image_url) VALUES
('iphone-15-128', 'IPHONE-15-128', 'APPLE', 'iPhone 15 128GB - Latest model with advanced features', 799.99, 'IPHONE-15-128', 'Standard', 1, 'Smartphones', 'https://example.com/iphone15.jpg'),
('samsung-s24-256', 'SAMSUNG-S24-256', 'SAMSUNG', 'Samsung Galaxy S24 256GB - Premium Android experience', 899.99, 'SAMSUNG-S24-256', 'Premium', 1, 'Smartphones', 'https://example.com/s24.jpg'),
('pixel-8-128', 'PIXEL-8-128', 'GOOGLE', 'Google Pixel 8 128GB - Pure Android with AI features', 699.99, 'PIXEL-8-128', 'Standard', 1, 'Smartphones', 'https://example.com/pixel8.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert sample activity logs
INSERT INTO activity_logs (level, category, message, username, ip_address) VALUES
('info', 'system', 'System initialized successfully', 'System', '127.0.0.1'),
('info', 'user', 'User admin logged in successfully', 'admin', '192.168.1.100'),
('warning', 'ranking', 'Trending calculation took longer than expected', 'System', '127.0.0.1')
ON CONFLICT DO NOTHING;
