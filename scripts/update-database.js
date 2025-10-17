#!/usr/bin/env node

/**
 * Database Update Script
 * 
 * This script applies the database schema updates to include all skin-quiz fields.
 * Run this after updating your Supabase database with the new schema.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateDatabase() {
  console.log('🔄 Updating database schema for skin-quiz data...\n');

  try {
    // Check if the new columns already exist
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'users' });

    if (columnsError) {
      console.log('ℹ️  Could not check existing columns, proceeding with updates...\n');
    } else {
      console.log('📋 Current users table columns:', columns?.map(col => col.column_name).join(', '));
    }

    // Apply the schema updates
    console.log('1. Adding makeup_usage column...');
    const { error: makeupError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS makeup_usage TEXT;' 
      });
    
    if (makeupError) {
      console.log('   ⚠️  makeup_usage column may already exist or there was an error:', makeupError.message);
    } else {
      console.log('   ✅ makeup_usage column added successfully');
    }

    console.log('2. Adding sunscreen_preference column...');
    const { error: sunscreenError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS sunscreen_preference TEXT;' 
      });
    
    if (sunscreenError) {
      console.log('   ⚠️  sunscreen_preference column may already exist or there was an error:', sunscreenError.message);
    } else {
      console.log('   ✅ sunscreen_preference column added successfully');
    }

    console.log('3. Adding ingredient_preferences column...');
    const { error: ingredientsError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS ingredient_preferences JSONB;' 
      });
    
    if (ingredientsError) {
      console.log('   ⚠️  ingredient_preferences column may already exist or there was an error:', ingredientsError.message);
    } else {
      console.log('   ✅ ingredient_preferences column added successfully');
    }

    // Test the updated schema
    console.log('\n4. Testing updated schema...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id, makeup_usage, sunscreen_preference, ingredient_preferences')
      .limit(1);

    if (testError) {
      console.log('   ❌ Error testing schema:', testError.message);
    } else {
      console.log('   ✅ Schema test successful - new columns are accessible');
    }

    console.log('\n🎉 Database schema update completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Your skin-quiz will now save all data to the users table');
    console.log('   2. The quiz maps data as follows:');
    console.log('      - skin_type ← skinFeel');
    console.log('      - skin_concerns ← topConcerns');
    console.log('      - makeup_usage ← makeupUsage');
    console.log('      - sunscreen_preference ← sunscreenPreference');
    console.log('      - ingredient_preferences ← ingredientPreferences');
    console.log('   3. Test the quiz to ensure data is saving correctly');

  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    console.log('\n💡 Manual steps:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run the contents of supabase/update-database-schema.sql');
    process.exit(1);
  }
}

updateDatabase();
