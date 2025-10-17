#!/usr/bin/env node

/**
 * Manual Database Update Script
 * 
 * This script manually adds the missing columns to the users table.
 * Run this if the automatic update script fails.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Try to get environment variables from different sources
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY');
  console.error('\n💡 Please check your .env.local file or set these variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAndAddColumns() {
  console.log('🔍 Checking current database schema...\n');

  try {
    // First, let's try to query the users table to see what columns exist
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id, skin_type, skin_concerns')
      .limit(1);

    if (testError) {
      console.error('❌ Error accessing users table:', testError.message);
      return;
    }

    console.log('✅ Successfully connected to users table');

    // Try to query the new columns to see if they exist
    console.log('\n🔍 Checking for new columns...');
    
    const { data: makeupData, error: makeupError } = await supabase
      .from('users')
      .select('makeup_usage')
      .limit(1);

    if (makeupError && makeupError.code === 'PGRST116') {
      console.log('❌ makeup_usage column does not exist');
    } else {
      console.log('✅ makeup_usage column exists');
    }

    const { data: sunscreenData, error: sunscreenError } = await supabase
      .from('users')
      .select('sunscreen_preference')
      .limit(1);

    if (sunscreenError && sunscreenError.code === 'PGRST116') {
      console.log('❌ sunscreen_preference column does not exist');
    } else {
      console.log('✅ sunscreen_preference column exists');
    }

    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from('users')
      .select('ingredient_preferences')
      .limit(1);

    if (ingredientsError && ingredientsError.code === 'PGRST116') {
      console.log('❌ ingredient_preferences column does not exist');
    } else {
      console.log('✅ ingredient_preferences column exists');
    }

    console.log('\n📝 Manual steps to add missing columns:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the following SQL commands:');
    console.log('');
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS makeup_usage TEXT;');
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS sunscreen_preference TEXT;');
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS ingredient_preferences JSONB;');
    console.log('');
    console.log('4. After running these commands, test the skin quiz again');

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
}

checkAndAddColumns();
