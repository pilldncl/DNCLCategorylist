-- Add admin_score column to trending_products table
ALTER TABLE trending_products 
ADD COLUMN IF NOT EXISTS admin_score INTEGER DEFAULT 0;

-- Add index for admin_score for better performance
CREATE INDEX IF NOT EXISTS idx_trending_products_admin_score 
ON trending_products(admin_score);

-- Update existing records to have admin_score = 0
UPDATE trending_products 
SET admin_score = 0 
WHERE admin_score IS NULL;

-- Make admin_score NOT NULL after setting defaults
ALTER TABLE trending_products 
ALTER COLUMN admin_score SET NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN trending_products.admin_score IS 'Admin bonus score added to trending score for manual ranking adjustments';

