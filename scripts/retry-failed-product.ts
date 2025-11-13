#!/usr/bin/env tsx

/**
 * Retry Failed Product
 * 
 * Description:
 *   Retries fetching and storing a single failed product by product ID or SKU ID.
 * 
 * Usage:
 *   npx tsx scripts/retry-failed-product.ts <productId>
 *   npx tsx scripts/retry-failed-product.ts P423135
 *   npx tsx scripts/retry-failed-product.ts <skuId> --sku
 */

import { config } from 'dotenv';

// Load environment variables BEFORE importing the service
config({ path: '.env.local' });

async function retryFailedProduct() {
  // Dynamic import after environment variables are loaded
  const { sephoraSkincareProductsService } = await import('../lib/sephora-skincare-products-service');
  
  // Get product ID from command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: Product ID or SKU ID is required');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/retry-failed-product.ts <productId>');
    console.log('  npx tsx scripts/retry-failed-product.ts <skuId> --sku');
    console.log('\nExample:');
    console.log('  npx tsx scripts/retry-failed-product.ts P423135');
    process.exit(1);
  }
  
  const identifier = args[0];
  const useSkuId = args.includes('--sku');
  
  try {
    console.log('🔄 Retrying failed product...\n');
    console.log(`📦 ${useSkuId ? 'SKU ID' : 'Product ID'}: ${identifier}\n`);
    
    const product = await sephoraSkincareProductsService.fetchAndStoreProduct(
      identifier,
      'en-US',
      useSkuId
    );
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Product successfully fetched and stored!');
    console.log('='.repeat(60));
    console.log(`   Product ID: ${product.productId}`);
    console.log(`   Brand: ${product.productBrand}`);
    console.log(`   Name: ${product.productName}`);
    console.log(`   Price: $${product.price?.toFixed(2) || 'N/A'}`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ Failed to fetch/store product');
    console.error('='.repeat(60));
    
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
    } else {
      console.error('Unknown error:', error);
    }
    
    console.error('='.repeat(60) + '\n');
    process.exit(1);
  }
}

// Run the retry
retryFailedProduct()
  .then(() => {
    console.log('✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed with error:', error);
    process.exit(1);
  });

