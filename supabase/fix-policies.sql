-- Fix Row Level Security policies for products table
-- This allows inserting products while maintaining read access for everyone

-- Add INSERT policy for products (allow everyone to insert)
CREATE POLICY "Products are insertable by everyone" ON products
  FOR INSERT WITH CHECK (true);

-- Add UPDATE policy for products (allow everyone to update)
CREATE POLICY "Products are updatable by everyone" ON products
  FOR UPDATE USING (true);

-- Add DELETE policy for products (allow everyone to delete)
CREATE POLICY "Products are deletable by everyone" ON products
  FOR DELETE USING (true);
