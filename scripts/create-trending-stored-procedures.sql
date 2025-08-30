-- Stored procedure approach for getting ranked trending products
-- This approach uses database functions to handle all the ranking logic

-- Create function to get trending products with proper ranking
CREATE OR REPLACE FUNCTION get_trending_products_ranked(
    limit_count INTEGER DEFAULT 5,
    brand_filter VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    product_id VARCHAR,
    brand VARCHAR,
    name TEXT,
    total_views INTEGER,
    total_clicks INTEGER,
    total_searches INTEGER,
    trending_score INTEGER,
    admin_score INTEGER,
    total_score INTEGER,
    rank INTEGER,
    last_interaction TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tp.product_id,
        tp.brand,
        tp.name,
        tp.total_views,
        tp.total_clicks,
        tp.total_searches,
        tp.trending_score,
        COALESCE(tp.admin_score, 0) AS admin_score,
        (tp.trending_score + COALESCE(tp.admin_score, 0)) AS total_score,
        RANK() OVER (ORDER BY (tp.trending_score + COALESCE(tp.admin_score, 0)) DESC)::INTEGER AS rank,
        tp.last_interaction,
        tp.created_at,
        tp.updated_at
    FROM trending_products tp
    WHERE (brand_filter IS NULL OR tp.brand ILIKE brand_filter)
    ORDER BY (tp.trending_score + COALESCE(tp.admin_score, 0)) DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get a specific product's ranking
CREATE OR REPLACE FUNCTION get_product_ranking(product_id_param VARCHAR)
RETURNS TABLE (
    product_id VARCHAR,
    brand VARCHAR,
    name TEXT,
    trending_score INTEGER,
    admin_score INTEGER,
    total_score INTEGER,
    rank INTEGER,
    total_products INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_products AS (
        SELECT 
            tp.product_id,
            tp.brand,
            tp.name,
            tp.trending_score,
            COALESCE(tp.admin_score, 0) AS admin_score,
            (tp.trending_score + COALESCE(tp.admin_score, 0)) AS total_score,
            RANK() OVER (ORDER BY (tp.trending_score + COALESCE(tp.admin_score, 0)) DESC)::INTEGER AS rank
        FROM trending_products tp
    ),
    product_count AS (
        SELECT COUNT(*)::INTEGER AS total_count FROM trending_products
    )
    SELECT 
        rp.product_id,
        rp.brand,
        rp.name,
        rp.trending_score,
        rp.admin_score,
        rp.total_score,
        rp.rank,
        pc.total_count
    FROM ranked_products rp
    CROSS JOIN product_count pc
    WHERE rp.product_id = product_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create function to update admin score and recalculate rankings
CREATE OR REPLACE FUNCTION set_admin_score(
    product_id_param VARCHAR,
    new_admin_score INTEGER
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    new_rank INTEGER,
    old_rank INTEGER
) AS $$
DECLARE
    old_rank_val INTEGER;
    new_rank_val INTEGER;
BEGIN
    -- Get old rank
    SELECT rank INTO old_rank_val
    FROM get_product_ranking(product_id_param);
    
    -- Update admin score
    UPDATE trending_products 
    SET admin_score = new_admin_score,
        updated_at = NOW()
    WHERE product_id = product_id_param;
    
    -- Check if update was successful
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'Product not found', NULL::INTEGER, NULL::INTEGER;
        RETURN;
    END IF;
    
    -- Get new rank
    SELECT rank INTO new_rank_val
    FROM get_product_ranking(product_id_param);
    
    RETURN QUERY SELECT TRUE, 'Admin score updated successfully', new_rank_val, old_rank_val;
END;
$$ LANGUAGE plpgsql;

-- Create function to reset a product's scores
CREATE OR REPLACE FUNCTION reset_product_scores(product_id_param VARCHAR)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
BEGIN
    UPDATE trending_products 
    SET trending_score = 0,
        admin_score = 0,
        total_views = 0,
        total_clicks = 0,
        total_searches = 0,
        updated_at = NOW()
    WHERE product_id = product_id_param;
    
    IF FOUND THEN
        RETURN QUERY SELECT TRUE, 'Product scores reset successfully';
    ELSE
        RETURN QUERY SELECT FALSE, 'Product not found';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get top N products by category
CREATE OR REPLACE FUNCTION get_top_trending_by_brand(
    brand_param VARCHAR,
    limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
    product_id VARCHAR,
    name TEXT,
    total_score INTEGER,
    rank_in_brand INTEGER,
    overall_rank INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH overall_rankings AS (
        SELECT 
            tp.product_id,
            tp.brand,
            tp.name,
            (tp.trending_score + COALESCE(tp.admin_score, 0)) AS total_score,
            RANK() OVER (ORDER BY (tp.trending_score + COALESCE(tp.admin_score, 0)) DESC)::INTEGER AS overall_rank
        FROM trending_products tp
    )
    SELECT 
        or_table.product_id,
        or_table.name,
        or_table.total_score,
        RANK() OVER (ORDER BY or_table.total_score DESC)::INTEGER AS rank_in_brand,
        or_table.overall_rank
    FROM overall_rankings or_table
    WHERE or_table.brand ILIKE brand_param
    ORDER BY or_table.total_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_trending_products_ranked(INTEGER, VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_product_ranking(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_admin_score(VARCHAR, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reset_product_scores(VARCHAR) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_top_trending_by_brand(VARCHAR, INTEGER) TO anon, authenticated;

