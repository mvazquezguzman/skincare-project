#!/usr/bin/env tsx

/**
 * Test Schema
 * 
 * Description:
 *   Validates that the database schema has been updated correctly with all
 *   required columns (ingredients, skin_type, concerns, subcategory, etc.).
 *   Provides helpful error messages if columns are missing.
 * 
 * Usage:
 *   npx tsx scripts/test-schema.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

async function testSchema() {
  console.log('🧪 Testing database schema...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing required environment variables');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('📋 Testing new columns...');
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, ingredients, skin_type, concerns, subcategory, detailed_description')
      .limit(1);
    
    if (error) {
      console.error('❌ Schema test failed:', error.message);
      
      if (error.message.includes('concerns')) {
        console.log('💡 The "concerns" column is missing. Please run the manual schema update.');
      } else if (error.message.includes('ingredients')) {
        console.log('💡 The "ingredients" column is missing. Please run the manual schema update.');
      } else if (error.message.includes('skin_type')) {
        console.log('💡 The "skin_type" column is missing. Please run the manual schema update.');
      } else if (error.message.includes('subcategory')) {
        console.log('💡 The "subcategory" column is missing. Please run the manual schema update.');
      } else if (error.message.includes('detailed_description')) {
        console.log('💡 The "detailed_description" column is missing. Please run the manual schema update.');
      }
      
      console.log('\n📋 Please run these SQL commands in your Supabase dashboard:');
      console.log(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS skin_type JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS concerns JSONB DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS subcategory TEXT,
        ADD COLUMN IF NOT EXISTS detailed_description TEXT;
      `);
      
      return;
    }
    
    console.log('✅ Schema test passed! All new columns exist.');
    console.log('🎯 You can now run: npm run enhanced-sync');
    
  } catch (error) {
    console.error('❌ Error testing schema:', error);
  }
}

testSchema();
