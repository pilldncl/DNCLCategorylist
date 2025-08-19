-- Migration script to add missing columns to user_interactions table
-- This script adds the required columns that don't exist in the current table

-- Add missing columns to existing user_interactions table
ALTER TABLE user_interactions 
ADD COLUMN IF NOT EXISTS type VARCHAR(50),
ADD COLUMN IF NOT EXISTS product_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS search_term TEXT,
ADD COLUMN IF NOT EXISTS session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Make type and session_id NOT NULL after adding them
ALTER TABLE user_interactions 
ALTER COLUMN type SET NOT NULL,
ALTER COLUMN session_id SET NOT NULL;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_product_id ON user_interactions(product_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_brand ON user_interactions(brand);

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Enable read access for all users" ON user_interactions;
DROP POLICY IF EXISTS "Enable insert access for all users" ON user_interactions;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON user_interactions;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON user_interactions;

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

-- Show the final table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_interactions' 
ORDER BY ordinal_position;
