-- Enhance products table with additional fields for ingredients and categories

-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS skin_type JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS concerns JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- Add indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_products_ingredients ON products USING GIN (ingredients);
CREATE INDEX IF NOT EXISTS idx_products_skin_type ON products USING GIN (skin_type);
CREATE INDEX IF NOT EXISTS idx_products_concerns ON products USING GIN (concerns);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);

-- Update the existing ingredients column to be more specific
COMMENT ON COLUMN products.ingredients IS 'Array of product ingredients in JSON format';
COMMENT ON COLUMN products.skin_type IS 'Array of recommended skin types in JSON format';
COMMENT ON COLUMN products.concerns IS 'Array of skin concerns this product addresses in JSON format';
COMMENT ON COLUMN products.subcategory IS 'Product subcategory (e.g., Cleanser, Moisturizer, Serum)';
COMMENT ON COLUMN products.detailed_description IS 'Detailed product description with usage instructions';
