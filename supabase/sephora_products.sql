-- Sephora Products table for storing Sephora skincare products

-- Create sephora_products table to store Sephora skincare products
CREATE TABLE IF NOT EXISTS sephora_products (
  "productId" TEXT PRIMARY KEY,
  "productBrand" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  "categoryID" TEXT,
  "categoryName" TEXT,
  skin_type JSONB DEFAULT '[]'::jsonb,
  skin_concerns JSONB DEFAULT '[]'::jsonb,
  ingredients JSONB DEFAULT '[]'::jsonb,
  highlighted_ingredients JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  detailed_description TEXT,
  "suggestedUsage" TEXT,
  "imageURL" TEXT,
  "productURL" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for sephora_products
ALTER TABLE sephora_products ENABLE ROW LEVEL SECURITY;

-- Create policies for sephora_products table (public read access)
CREATE POLICY "Sephora products are viewable by everyone" ON sephora_products
  FOR SELECT USING (true);

-- Add INSERT policy for sephora_products (allow everyone to insert)
CREATE POLICY "Sephora products are insertable by everyone" ON sephora_products
  FOR INSERT WITH CHECK (true);

-- Add UPDATE policy for sephora_products (allow everyone to update)
CREATE POLICY "Sephora products are updatable by everyone" ON sephora_products
  FOR UPDATE USING (true);

-- Add DELETE policy for sephora_products (allow everyone to delete)
CREATE POLICY "Sephora products are deletable by everyone" ON sephora_products
  FOR DELETE USING (true);

-- Add updated_at trigger for sephora_products
CREATE TRIGGER handle_updated_at_sephora_products
  BEFORE UPDATE ON sephora_products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sephora_products_brand ON sephora_products("productBrand");
CREATE INDEX IF NOT EXISTS idx_sephora_products_category ON sephora_products("categoryID");
CREATE INDEX IF NOT EXISTS idx_sephora_products_category_name ON sephora_products("categoryName");
CREATE INDEX IF NOT EXISTS idx_sephora_products_price ON sephora_products(price);

-- GIN indexes for JSONB columns (for efficient JSON queries)
CREATE INDEX IF NOT EXISTS idx_sephora_products_ingredients ON sephora_products USING GIN (ingredients);
CREATE INDEX IF NOT EXISTS idx_sephora_products_highlighted_ingredients ON sephora_products USING GIN (highlighted_ingredients);
CREATE INDEX IF NOT EXISTS idx_sephora_products_skin_type ON sephora_products USING GIN (skin_type);
CREATE INDEX IF NOT EXISTS idx_sephora_products_skin_concerns ON sephora_products USING GIN (skin_concerns);

-- Add column comments for documentation
COMMENT ON TABLE sephora_products IS 'Stores Sephora skincare products';
COMMENT ON COLUMN sephora_products."productId" IS 'Unique product identifier';
COMMENT ON COLUMN sephora_products."productBrand" IS 'Product brand name';
COMMENT ON COLUMN sephora_products."productName" IS 'Product name';
COMMENT ON COLUMN sephora_products.price IS 'Product price in decimal format';
COMMENT ON COLUMN sephora_products."categoryID" IS 'Product category identifier';
COMMENT ON COLUMN sephora_products."categoryName" IS 'Product category name';
COMMENT ON COLUMN sephora_products.skin_type IS 'Array of recommended skin types in JSON format';
COMMENT ON COLUMN sephora_products.skin_concerns IS 'Array of skin concerns this product addresses in JSON format';
COMMENT ON COLUMN sephora_products.ingredients IS 'Array of all product ingredients in JSON format';
COMMENT ON COLUMN sephora_products.highlighted_ingredients IS 'Array of highlighted/key ingredients in JSON format';
COMMENT ON COLUMN sephora_products.description IS 'Short product description';
COMMENT ON COLUMN sephora_products.detailed_description IS 'Detailed product description with usage instructions';
COMMENT ON COLUMN sephora_products."suggestedUsage" IS 'Suggested usage instructions for the product';
COMMENT ON COLUMN sephora_products."imageURL" IS 'URL to product image';
COMMENT ON COLUMN sephora_products."productURL" IS 'URL to product page on Sephora';
COMMENT ON COLUMN sephora_products.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN sephora_products.updated_at IS 'Timestamp when record was last updated';
COMMENT ON COLUMN sephora_products.last_synced IS 'Timestamp when product data was last synced from source';
