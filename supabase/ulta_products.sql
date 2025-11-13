-- Ulta Products table for storing Ulta skincare products

-- Create ulta_products table to store Ulta skincare products
CREATE TABLE IF NOT EXISTS ulta_products (
  id TEXT PRIMARY KEY,
  "productBrand" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  "categoryName" TEXT,
  skin_type JSONB DEFAULT '[]'::jsonb,
  skin_concerns JSONB DEFAULT '[]'::jsonb,
  ingredients JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  "suggestedUsage" TEXT,
  "imgURL" TEXT,
  "productURL" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for ulta_products
ALTER TABLE ulta_products ENABLE ROW LEVEL SECURITY;

-- Create policies for ulta_products table (public read access)
CREATE POLICY "Ulta products are viewable by everyone" ON ulta_products
  FOR SELECT USING (true);

-- Add INSERT policy for ulta_products (allow everyone to insert)
CREATE POLICY "Ulta products are insertable by everyone" ON ulta_products
  FOR INSERT WITH CHECK (true);

-- Add UPDATE policy for ulta_products (allow everyone to update)
CREATE POLICY "Ulta products are updatable by everyone" ON ulta_products
  FOR UPDATE USING (true);

-- Add DELETE policy for ulta_products (allow everyone to delete)
CREATE POLICY "Ulta products are deletable by everyone" ON ulta_products
  FOR DELETE USING (true);

-- Add updated_at trigger for ulta_products
CREATE TRIGGER handle_updated_at_ulta_products
  BEFORE UPDATE ON ulta_products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ulta_products_brand ON ulta_products("productBrand");
CREATE INDEX IF NOT EXISTS idx_ulta_products_category_name ON ulta_products("categoryName");
CREATE INDEX IF NOT EXISTS idx_ulta_products_price ON ulta_products(price);
CREATE INDEX IF NOT EXISTS idx_ulta_products_product_name ON ulta_products("productName");

-- GIN indexes for JSONB columns (for efficient JSON queries)
CREATE INDEX IF NOT EXISTS idx_ulta_products_ingredients ON ulta_products USING GIN (ingredients);
CREATE INDEX IF NOT EXISTS idx_ulta_products_skin_type ON ulta_products USING GIN (skin_type);
CREATE INDEX IF NOT EXISTS idx_ulta_products_skin_concerns ON ulta_products USING GIN (skin_concerns);

-- Add column comments for documentation
COMMENT ON TABLE ulta_products IS 'Stores Ulta skincare products';
COMMENT ON COLUMN ulta_products.id IS 'Unique product identifier';
COMMENT ON COLUMN ulta_products."productBrand" IS 'Product brand name';
COMMENT ON COLUMN ulta_products."productName" IS 'Product name';
COMMENT ON COLUMN ulta_products.price IS 'Product price in decimal format';
COMMENT ON COLUMN ulta_products."categoryName" IS 'Product category name';
COMMENT ON COLUMN ulta_products.skin_type IS 'Array of recommended skin types in JSON format';
COMMENT ON COLUMN ulta_products.skin_concerns IS 'Array of skin concerns this product addresses in JSON format';
COMMENT ON COLUMN ulta_products.ingredients IS 'Array of all product ingredients in JSON format';
COMMENT ON COLUMN ulta_products.description IS 'Product description';
COMMENT ON COLUMN ulta_products."suggestedUsage" IS 'Suggested usage instructions for the product';
COMMENT ON COLUMN ulta_products."imgURL" IS 'URL to product image';
COMMENT ON COLUMN ulta_products."productURL" IS 'URL to product page on Ulta';
COMMENT ON COLUMN ulta_products.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN ulta_products.updated_at IS 'Timestamp when record was last updated';
COMMENT ON COLUMN ulta_products.last_synced IS 'Timestamp when product data was last synced from source';

