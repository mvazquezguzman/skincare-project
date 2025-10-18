#!/usr/bin/env tsx

/**
 * Disable RLS Temporarily
 * 
 * Description:
 *   Temporarily disables Row Level Security (RLS) for the products table
 *   to allow bulk operations during product syncing. Should be re-enabled
 *   after sync completion for security.
 * 
 * Usage:
 *   npx tsx scripts/disable-rls-temporarily.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

async function disableRLSTemporarily() {
  console.log('🔧 Temporarily disabling RLS for products table...');
  
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
    // disable RLS temporarily
    console.log('Disabling RLS for products table...');
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error) {
      console.error('Error disabling RLS:', error);
      return;
    }
    
    console.log('✅ RLS disabled successfully!');
    console.log('💡 You can now run the product sync script');
    console.log('⚠️  Remember to re-enable RLS after syncing by running:');
    console.log('   ALTER TABLE products ENABLE ROW LEVEL SECURITY;');
    
  } catch (error) {
    console.error('❌ Error disabling RLS:', error);
    console.log('');
    console.log('💡 Alternative: Run the SQL manually in your Supabase dashboard:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run: ALTER TABLE products DISABLE ROW LEVEL SECURITY;');
  }
}

disableRLSTemporarily();
