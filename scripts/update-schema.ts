#!/usr/bin/env tsx

/**
 * Update Schema
 * 
 * Description:
 *   Updates the database schema by adding new columns to the products table
 *   (ingredients, skin_type, concerns, subcategory, detailed_description) and
 *   creates appropriate indexes for better performance.
 * 
 * Usage:
 *   npx tsx scripts/update-schema.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

async function updateSchema() {
  console.log('🔄 Updating database schema...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
    console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Not set');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const sqlCommands = [
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]'::jsonb;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS skin_type JSONB DEFAULT '[]'::jsonb;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS concerns JSONB DEFAULT '[]'::jsonb;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory TEXT;`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS detailed_description TEXT;`,
      `CREATE INDEX IF NOT EXISTS idx_products_ingredients ON products USING GIN (ingredients);`,
      `CREATE INDEX IF NOT EXISTS idx_products_skin_type ON products USING GIN (skin_type);`,
      `CREATE INDEX IF NOT EXISTS idx_products_concerns ON products USING GIN (concerns);`,
      `CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);`
    ];
    
    console.log('📝 Executing SQL commands...');
    
    for (const sql of sqlCommands) {
      console.log(`  Executing: ${sql.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`❌ Error executing SQL: ${error.message}`);
      } else {
        console.log(`  ✅ Success`);
      }
    }
    
    console.log('✅ Schema update completed!');
    console.log('💡 You can now run the enhanced sync with: npm run enhanced-sync');
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    console.log('💡 You may need to run the SQL commands manually in your Supabase dashboard');
    console.log('📋 SQL commands to run:');
    console.log(`
      -- Add new columns to products table
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS skin_type JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS concerns JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS subcategory TEXT,
      ADD COLUMN IF NOT EXISTS detailed_description TEXT;

      -- Add indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_products_ingredients ON products USING GIN (ingredients);
      CREATE INDEX IF NOT EXISTS idx_products_skin_type ON products USING GIN (skin_type);
      CREATE INDEX IF NOT EXISTS idx_products_concerns ON products USING GIN (concerns);
      CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
    `);
  }
}

updateSchema();
