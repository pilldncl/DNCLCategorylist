-- Simple ranking table approach - much easier than materialized views
-- This creates a dedicated table for sorted trending data

-- Create the ranking table
CREATE TABLE IF NOT EXISTS trending_rankings (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL UNIQUE,
    brand VARCHAR(255),
    name TEXT,
    total_views INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_searches INTEGER DEFAULT 0,
    trending_score INTEGER DEFAULT 0,
    admin_score INTEGER DEFAULT 0,
    total_score INTEGER GENERATED ALWAYS AS (trending_score + COALESCE(admin_score, 0)) STORED,
    rank INTEGER,
    last_interaction TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trending_rankings_total_score ON trending_rankings (total_score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_rankings_rank ON trending_rankings (rank);
CREATE INDEX IF NOT EXISTS idx_trending_rankings_brand ON trending_rankings (brand);
CREATE UNIQUE INDEX IF NOT EXISTS idx_trending_rankings_product_id ON trending_rankings (product_id);

-- Create function to update rankings
CREATE OR REPLACE FUNCTION update_trending_rankings()
RETURNS void AS $$
BEGIN
    -- Clear existing rankings
    DELETE FROM trending_rankings;
    
    -- Insert updated rankings with calculated ranks
    INSERT INTO trending_rankings (
        product_id, brand, name, total_views, total_clicks, total_searches,
        trending_score, admin_score, rank, last_interaction
    )
    SELECT 
        tp.product_id,
        tp.brand,
        tp.name,
        tp.total_views,
        tp.total_clicks,
        tp.total_searches,
        tp.trending_score,
        COALESCE(tp.admin_score, 0),
        RANK() OVER (ORDER BY (tp.trending_score + COALESCE(tp.admin_score, 0)) DESC),
        tp.last_interaction
    FROM trending_products tp
    ORDER BY (tp.trending_score + COALESCE(tp.admin_score, 0)) DESC;
    
    -- Update the last refresh timestamp
    INSERT INTO trending_config (id, last_rankings_update, updated_at)
    VALUES ('default', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        last_rankings_update = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-update rankings
CREATE OR REPLACE FUNCTION trigger_update_trending_rankings()
RETURNS trigger AS $$
BEGIN
    -- Update rankings after any change
    PERFORM update_trending_rankings();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS auto_update_trending_rankings ON trending_products;
CREATE TRIGGER auto_update_trending_rankings
    AFTER INSERT OR UPDATE OR DELETE ON trending_products
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_update_trending_rankings();

-- Grant permissions
GRANT SELECT ON trending_rankings TO anon, authenticated;

-- Add column to trending_config for tracking updates
ALTER TABLE trending_config 
ADD COLUMN IF NOT EXISTS last_rankings_update TIMESTAMP WITH TIME ZONE;

-- Initial population
SELECT update_trending_rankings();

-- Add comment
COMMENT ON TABLE trending_rankings IS 'Dedicated table for sorted trending product rankings. Auto-updates when trending_products changes.';

