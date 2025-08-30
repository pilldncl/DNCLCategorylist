-- Create manual_fire_badges table
CREATE TABLE IF NOT EXISTS manual_fire_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id TEXT NOT NULL,
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 3),
    duration INTEGER NOT NULL CHECK (duration > 0), -- duration in minutes
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_manual_fire_badges_position ON manual_fire_badges(position);
CREATE INDEX IF NOT EXISTS idx_manual_fire_badges_product_id ON manual_fire_badges(product_id);
CREATE INDEX IF NOT EXISTS idx_manual_fire_badges_active ON manual_fire_badges(is_active);
CREATE INDEX IF NOT EXISTS idx_manual_fire_badges_end_time ON manual_fire_badges(end_time);

-- Create unique constraint to prevent multiple active badges on same position
CREATE UNIQUE INDEX IF NOT EXISTS idx_manual_fire_badges_unique_position 
ON manual_fire_badges(position) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE manual_fire_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop if exists first)
DROP POLICY IF EXISTS "Allow admin access to manual_fire_badges" ON manual_fire_badges;
CREATE POLICY "Allow admin access to manual_fire_badges" ON manual_fire_badges
    FOR ALL USING (true);

-- Create function to automatically deactivate expired badges
CREATE OR REPLACE FUNCTION deactivate_expired_manual_badges()
RETURNS void AS $$
BEGIN
    UPDATE manual_fire_badges 
    SET is_active = false, updated_at = NOW()
    WHERE end_time < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_manual_fire_badges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS trigger_update_manual_fire_badges_updated_at ON manual_fire_badges;
CREATE TRIGGER trigger_update_manual_fire_badges_updated_at
    BEFORE UPDATE ON manual_fire_badges
    FOR EACH ROW
    EXECUTE FUNCTION update_manual_fire_badges_updated_at();

-- Grant permissions
GRANT ALL ON manual_fire_badges TO authenticated;
GRANT ALL ON manual_fire_badges TO service_role;
