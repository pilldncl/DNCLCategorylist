-- Create user_interactions table for tracking user interactions
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  product_id VARCHAR(255),
  brand VARCHAR(100),
  category VARCHAR(100),
  search_term TEXT,
  session_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_product_id ON user_interactions(product_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_brand ON user_interactions(brand);

-- Enable Row Level Security (RLS)
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON user_interactions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON user_interactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON user_interactions
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON user_interactions
  FOR DELETE USING (true);

-- Grant permissions
GRANT ALL ON user_interactions TO authenticated;
GRANT ALL ON user_interactions TO anon;
GRANT ALL ON user_interactions TO service_role;
