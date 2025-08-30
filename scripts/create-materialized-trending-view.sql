-- Create a materialized view for trending products with proper ranking
-- This stores the computed results physically for better performance

-- Drop existing view if it exists
DROP VIEW IF EXISTS trending_products_ranked;

-- Create materialized view
CREATE MATERIALIZED VIEW trending_products_ranked AS
SELECT
    tp.product_id,
    tp.brand,
    tp.name,
    tp.total_views,
    tp.total_clicks,
    tp.total_searches,
    tp.trending_score,
    COALESCE(tp.admin_score, 0) AS admin_score,
    tp.last_interaction,
    tp.created_at,
    tp.updated_at,
    (tp.trending_score + COALESCE(tp.admin_score, 0)) AS total_score,
    RANK() OVER (ORDER BY (tp.trending_score + COALESCE(tp.admin_score, 0)) DESC) AS rank,
    ROW_NUMBER() OVER (ORDER BY (tp.trending_score + COALESCE(tp.admin_score, 0)) DESC) AS position
FROM
    trending_products tp
ORDER BY
    (tp.trending_score + COALESCE(tp.admin_score, 0)) DESC;

-- Create unique index for better performance
CREATE UNIQUE INDEX idx_trending_products_ranked_product_id 
ON trending_products_ranked (product_id);

-- Create index on total_score for fast sorting
CREATE INDEX idx_trending_products_ranked_total_score 
ON trending_products_ranked (total_score DESC);

-- Create index on rank
CREATE INDEX idx_trending_products_ranked_rank 
ON trending_products_ranked (rank);

-- Add comment
COMMENT ON MATERIALIZED VIEW trending_products_ranked IS 
'Materialized view for trending products with calculated total scores and ranking. Refresh periodically for updated data.';

-- Grant permissions
GRANT SELECT ON trending_products_ranked TO anon, authenticated;

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_trending_rankings()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY trending_products_ranked;
    
    -- Update the last refresh timestamp
    INSERT INTO trending_config (id, last_materialized_refresh, updated_at)
    VALUES ('default', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
        last_materialized_refresh = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-refresh when trending_products changes
CREATE OR REPLACE FUNCTION trigger_refresh_trending_rankings()
RETURNS trigger AS $$
BEGIN
    -- Refresh the materialized view after any change
    PERFORM refresh_trending_rankings();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS auto_refresh_trending_rankings ON trending_products;
CREATE TRIGGER auto_refresh_trending_rankings
    AFTER INSERT OR UPDATE OR DELETE ON trending_products
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_refresh_trending_rankings();

-- Add column to trending_config for tracking refreshes
ALTER TABLE trending_config 
ADD COLUMN IF NOT EXISTS last_materialized_refresh TIMESTAMP WITH TIME ZONE;

