-- All Products view that combines sephora_products and ulta_products

-- Create a view that unions both product tables
CREATE OR REPLACE VIEW all_products AS
SELECT 
  -- Unified primary key: prefix with source to ensure uniqueness
  CONCAT('sephora_', "productId") AS id,
  'sephora' AS source,
  "productId" AS source_product_id,
  "productBrand",
  "productName",
  price,
  "categoryID",
  "categoryName",
  skin_type,
  skin_concerns,
  ingredients,
  description,
  detailed_description,
  "imageURL" AS "imgURL",
  "productURL",
  created_at,
  updated_at,
  last_synced
FROM sephora_products

UNION ALL

SELECT 
  -- Unified primary key: prefix with source to ensure uniqueness
  CONCAT('ulta_', id) AS id,
  'ulta' AS source,
  id AS source_product_id,
  "productBrand",
  "productName",
  price,
  NULL AS "categoryID",  -- Ulta doesn't have categoryID
  "categoryName",
  skin_type,
  skin_concerns,
  ingredients,
  description,
  NULL::TEXT AS detailed_description,  -- Ulta doesn't have detailed_description
  "imgURL",
  "productURL",
  created_at,
  updated_at,
  last_synced
FROM ulta_products;

-- Add comment for documentation
COMMENT ON VIEW all_products IS 'Unified view combining products from both Sephora and Ulta';

-- Enable Row Level Security on the view
ALTER VIEW all_products SET (security_invoker = true);

-- Create indexes on the underlying tables if needed for better view performance
-- (The existing indexes on sephora_products and ulta_products should be sufficient)
