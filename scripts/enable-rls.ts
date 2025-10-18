#!/usr/bin/env tsx

/**
 * Enable RLS
 * 
 * Description:
 *   Re-enables Row Level Security (RLS) for the products table after
 *   bulk operations are complete. This restores database security.
 * 
 * Usage:
 *   npx tsx scripts/enable-rls.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

async function enableRLS() {
  console.log('🔒 Re-enabling RLS for products table...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set');
    console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Not set');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // re-enable RLS
    console.log('Re-enabling RLS for products table...');
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ENABLE ROW LEVEL SECURITY;'
    });
    
    if (error) {
      console.error('Error re-enabling RLS:', error);
      return;
    }
    
    console.log('✅ RLS re-enabled successfully!');
    console.log('🔒 Products table is now secure again');
    
  } catch (error) {
    console.error('❌ Error re-enabling RLS:', error);
    console.log('');
    console.log('💡 Alternative: Run the SQL manually in your Supabase dashboard:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run: ALTER TABLE products ENABLE ROW LEVEL SECURITY;');
  }
}

enableRLS();
