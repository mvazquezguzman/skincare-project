#!/usr/bin/env tsx

/**
 * Sync Sephora Products by Brand and Categories
 * 
 * Description:
 *   Syncs Sephora skincare products for a specific brand from specified categories.
 *   Fetches product lists, filters by brand, then fetches detailed product info.
 * 
 * Usage:
 *   npx tsx scripts/sync-single-sephora-brand.ts brandName
 *   npx tsx scripts/sync-single-sephora-brand.ts "brand name"
 */

import { config } from 'dotenv';

config({ path: '.env.local' });

async function syncSephoraProducts() {
  const { sephoraSkincareProductsService } = await import('../lib/sephora-skincare-products-service');
  
  console.log('🚀 Starting Sephora Products Sync...\n');
  
  // Get brand name from command line arguments (required)
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('❌ Error: Brand name is required');
    console.error('Usage: npx tsx scripts/sync-single-sephora-brand.ts brandName');
    process.exit(1);
  }
  const brandName = args[0];
  
  // Category IDs for skincare products
  const categoryIds: string[] = [
    'cat920041',
    'cat920033',
    'cat60107',
    'cat60103',
    'cat60101',
    'cat60099',
    'cat60097',
    'cat1600036',
    'cat1440040',
    'cat1210037',
    'cat1210035',
    'cat1210033',
    'cat1210031',
    'cat1170031',
    'cat1120031',
    'cat1070034'
  ];
  
  try {
    console.log(`📦 Brand: ${brandName}`);
    console.log(`📂 Categories: ${categoryIds.length}`);
    console.log(`   ${categoryIds.join(', ')}\n`);
    
    // Get initial count
    const initialCount = await sephoraSkincareProductsService.getProductCount();
    console.log(`📊 Current products in database: ${initialCount}\n`);
    
    // Sync products
    const result = await sephoraSkincareProductsService.syncProductsByCategoryAndBrand(
      categoryIds,
      brandName,
      3000 // 3 second delay between requests (conservative for rate limits)
    );
    
    // Get final count
    const finalCount = await sephoraSkincareProductsService.getProductCount();
    
    console.log('\n' + '='.repeat(60));
    if (result.success) {
      console.log(`✅ Sync completed successfully!`);
      console.log(`   Brand: ${brandName}`);
      console.log(`   Products synced: ${result.count}`);
      console.log(`   Previous count: ${initialCount}`);
      console.log(`   New count: ${finalCount}`);
    } else {
      console.log(`❌ Sync completed with errors`);
      console.log(`   Message: ${result.message}`);
    }
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('💥 Sync failed:');
    
    if (error instanceof Error) {
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    
    process.exit(1);
  }
}

// Run the sync
syncSephoraProducts()
  .then(() => {
    console.log('✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed with error:', error);
    process.exit(1);
  });

