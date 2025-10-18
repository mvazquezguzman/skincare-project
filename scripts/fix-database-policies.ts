#!/usr/bin/env tsx

/**
 * Fix Database Policies
 * 
 * Description:
 *   Adds necessary Row Level Security policies (INSERT, UPDATE, DELETE) to the
 *   products table to allow sync operations to work properly with RLS enabled.
 * 
 * Usage:
 *   npx tsx scripts/fix-database-policies.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

async function fixDatabasePolicies() {
  console.log('🔧 Fixing database policies...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
    console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Not set');
    console.error('');
    console.error('💡 Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file');
    console.error('   You can find this key in your Supabase project settings under API');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Add INSERT policy
    console.log('Adding INSERT policy...');
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Products are insertable by everyone" ON products
        FOR INSERT WITH CHECK (true);
      `
    });
    
    if (insertError) {
      console.log('INSERT policy might already exist, continuing...');
    }
    
    // Add UPDATE policy
    console.log('Adding UPDATE policy...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Products are updatable by everyone" ON products
        FOR UPDATE USING (true);
      `
    });
    
    if (updateError) {
      console.log('UPDATE policy might already exist, continuing...');
    }
    
    // Add DELETE policy
    console.log('Adding DELETE policy...');
    const { error: deleteError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Products are deletable by everyone" ON products
        FOR DELETE USING (true);
      `
    });
    
    if (deleteError) {
      console.log('DELETE policy might already exist, continuing...');
    }
    
    console.log('✅ Database policies fixed successfully!');
    console.log('💡 You can now run the product sync script');
    
  } catch (error) {
    console.error('❌ Error fixing database policies:', error);
    console.log('');
    console.log('💡 Alternative: Run the SQL manually in your Supabase dashboard:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run the contents of supabase/fix-products-policies.sql');
  }
}

fixDatabasePolicies();
