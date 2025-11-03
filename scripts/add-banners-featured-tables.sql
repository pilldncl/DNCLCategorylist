-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create featured_products table
CREATE TABLE IF NOT EXISTS featured_products (
  id VARCHAR(255) PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('new', 'featured')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON banners(display_order);
CREATE INDEX IF NOT EXISTS idx_featured_products_active ON featured_products(is_active);
CREATE INDEX IF NOT EXISTS idx_featured_products_display_order ON featured_products(display_order);
CREATE INDEX IF NOT EXISTS idx_featured_products_product_id ON featured_products(product_id);

-- Insert sample banner data (you can delete this if you want)
INSERT INTO banners (id, title, description, image_url, link_url, link_text, is_active, display_order) VALUES
  ('banner-1', 'Welcome to DNCL Wholesale', 'Premium quality tech products at wholesale prices', '/dncl-logo.png', '/', 'Shop Now', true, 1)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (optional, adjust based on your needs)
-- ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;

