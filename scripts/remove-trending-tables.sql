-- Remove Trending System Database Tables
-- This script safely removes all trending functionality from the database

-- Drop materialized view first (if it exists)
DROP MATERIALIZED VIEW IF EXISTS trending_products_ranked;

-- Drop triggers
DROP TRIGGER IF EXISTS auto_refresh_trending_rankings ON trending_products;

-- Drop functions
DROP FUNCTION IF EXISTS refresh_trending_rankings();
DROP FUNCTION IF EXISTS trigger_refresh_trending_rankings();

-- Drop tables in dependency order
DROP TABLE IF EXISTS manual_fire_badges;
DROP TABLE IF EXISTS fire_badges;
DROP TABLE IF EXISTS trending_rankings;
DROP TABLE IF EXISTS trending_products;
DROP TABLE IF EXISTS trending_config;

-- Verify removal
SELECT 'Trending tables removed successfully' as status;
