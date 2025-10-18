#!/usr/bin/env tsx

/**
 * Sync Products
 * 
 * Description:
 *   Synchronizes products from the Sephora API to the Supabase database.
 *   Fetches product data and stores it with proper rate limiting.
 * 
 * Usage:
 *   npm run sync-products
 *   npx tsx scripts/sync-products.ts
 */

import { config } from 'dotenv';
import { syncProductsFromApi, getProductCount } from '../lib/products';

config({ path: '.env.local' });

async function main() {
  console.log('🔄 Starting product sync...');
  
  console.log('Environment check:');
  console.log('- RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY ? 'Set' : 'Not set');
  console.log('- SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
  console.log('- SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
  
  try {
    const beforeCount = await getProductCount();
    console.log(`📊 Current products in database: ${beforeCount}`);
    
    // Sync products from API
    const result = await syncProductsFromApi();
    
    if (result.success) {
      const afterCount = await getProductCount();
      console.log(`✅ Sync completed successfully!`);
      console.log(`📈 Products synced: ${result.count}`);
      console.log(`📊 Total products in database: ${afterCount}`);
    } else {
      console.error(`❌ Sync failed: ${result.message}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during sync:', error);
    process.exit(1);
  }
}

main();
