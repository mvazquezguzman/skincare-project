#!/usr/bin/env tsx

/**
 * Sync Sephora Products for Multiple Brands
 * 
 * Description:
 *   Syncs Sephora skincare products for multiple brands from specified categories.
 *   Fetches product lists, filters by brand, then fetches detailed product info.
 *   Processes brands sequentially with progress tracking and summary reporting.
 * 
 * Usage:
 *   npx tsx scripts/sync-multi-sephora-brand.ts brand1 brand2 brand3
 *   npx tsx scripts/sync-multi-sephora-brand.ts "brand name" "another brand"
 * 
 */

import { config } from 'dotenv';

// Load environment variables BEFORE importing the service
config({ path: '.env.local' });

async function syncMultipleSephoraBrands() {
  // Dynamic import after environment variables are loaded
  const { sephoraSkincareProductsService } = await import('../lib/sephora-skincare-products-service');
  
  console.log('🚀 Starting Sephora Products Sync for Multiple Brands...\n');
  
  // Get brand names from command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: Please provide at least one brand name');
    console.error('\nUsage:');
    console.error('  npx tsx scripts/sync-multi-sephora-brand.ts brand1 brand2 brand3');
    process.exit(1);
  }
  
  const brandNames = args;
  
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
  
  console.log(`📦 Brands to sync: ${brandNames.length}`);
  brandNames.forEach((brand, index) => {
    console.log(`   ${index + 1}. ${brand}`);
  });
  console.log(`📂 Categories: ${categoryIds.length}`);
  console.log(`   ${categoryIds.join(', ')}\n`);
  
  // Get initial count
  const initialCount = await sephoraSkincareProductsService.getProductCount();
  console.log(`📊 Current products in database: ${initialCount}\n`);
  
  const results: Array<{
    brandName: string;
    success: boolean;
    count: number;
    message?: string;
  }> = [];
  
  // Sync each brand sequentially
  for (let i = 0; i < brandNames.length; i++) {
    const brandName = brandNames[i];
    
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔄 Syncing brand ${i + 1}/${brandNames.length}: ${brandName}`);
      console.log('='.repeat(60) + '\n');
      
      // Sync products for this brand
      const result = await sephoraSkincareProductsService.syncProductsByCategoryAndBrand(
        categoryIds,
        brandName,
        3000 // 3 second delay between requests (conservative for rate limits)
      );
      
      results.push({
        brandName,
        success: result.success,
        count: result.count,
        message: result.message
      });
      
      if (result.success) {
        console.log(`\n✅ ${brandName}: ${result.count} products synced`);
      } else {
        console.log(`\n❌ ${brandName}: ${result.message}`);
      }
      
      // Add a small delay between brands to avoid overwhelming the API
      if (i < brandNames.length - 1) {
        console.log('\n⏳ Waiting 3 seconds before next brand...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error) {
      console.error(`\n💥 Sync failed for ${brandName}:`);
      
      if (error instanceof Error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
      } else {
        console.error('Unknown error:', error);
      }
      
      results.push({
        brandName,
        success: false,
        count: 0,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Get final count
  const finalCount = await sephoraSkincareProductsService.getProductCount();
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SYNC SUMMARY');
  console.log('='.repeat(60));
  console.log(`   Total brands processed: ${brandNames.length}`);
  console.log(`   Successful: ${results.filter(r => r.success).length}`);
  console.log(`   Failed: ${results.filter(r => !r.success).length}`);
  console.log(`   Total products synced: ${results.reduce((sum, r) => sum + r.count, 0)}`);
  console.log(`   Previous count: ${initialCount}`);
  console.log(`   New count: ${finalCount}`);
  console.log(`   Net change: ${finalCount - initialCount}`);
  console.log('\n📋 Per-brand results:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${index + 1}. ${status} ${result.brandName}: ${result.count} products${result.message ? ` - ${result.message}` : ''}`);
  });
  console.log('='.repeat(60) + '\n');
}

// Run the sync
syncMultipleSephoraBrands()
  .then(() => {
    console.log('✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed with error:', error);
    process.exit(1);
  });

