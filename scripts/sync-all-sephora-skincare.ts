#!/usr/bin/env tsx

/**
 * Sync All Sephora Skincare Products by Category
 * 
 * Description:
 *   Syncs ALL Sephora skincare products from specified categories
 *   Fetches product lists from all categories, then fetches detailed product info
 * 
 * Usage:
 *   npx tsx scripts/sync-all-sephora-skincare.ts
 */

import { config } from 'dotenv';

config({ path: '.env.local' });

async function syncAllSkincareProducts() {

  const { sephoraSkincareProductsService } = await import('../lib/sephora-skincare-products-service');
  
  console.log('🚀 Starting Sephora Products Sync for All Skincare Categories...\n');
  
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
    // Get initial count
    const initialCount = await sephoraSkincareProductsService.getProductCount();
    console.log(`📊 Current products in database: ${initialCount}\n`);
    console.log(`📂 Total categories to sync: ${categoryIds.length}`);
    console.log(`   ${categoryIds.join(', ')}\n`);
    console.log('='.repeat(60) + '\n');
    
    const pageSize = 50;
    const delayMs = 3000; // Increased to 3 seconds to be more conservative with rate limits
    const maxConsecutiveErrors = 3;
    let allProducts: any[] = [];
    
    // Step 1: Fetch product lists from all categories
    for (let i = 0; i < categoryIds.length; i++) {
      const categoryId = categoryIds[i];
      const categoryNumber = i + 1;
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Category ${categoryNumber}/${categoryIds.length}: ${categoryId}`);
      console.log('='.repeat(60));
      
      let currentPage = 1;
      let hasMorePages = true;
      let consecutiveErrors = 0;
      let categoryProductCount = 0;
      
      while (hasMorePages && consecutiveErrors < maxConsecutiveErrors) {
        try {
          const products = await sephoraSkincareProductsService.fetchProductListByCategory(
            categoryId,
            pageSize,
            currentPage
          );
          
          if (!products || products.length === 0) {
            console.log(`No products found for category ${categoryId} on page ${currentPage}`);
            hasMorePages = false;
            break;
          }
          
          console.log(`  Page ${currentPage}: Found ${products.length} products`);
          allProducts = allProducts.concat(products);
          categoryProductCount += products.length;
          
          // Reset error counter on success
          consecutiveErrors = 0;
          
          // If we got fewer products than page size, we've reached the end
          if (products.length < pageSize) {
            hasMorePages = false;
          } else {
            currentPage++;
          }
          
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } catch (error) {
          consecutiveErrors++;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error(`  Error fetching category ${categoryId} page ${currentPage} (attempt ${consecutiveErrors}/${maxConsecutiveErrors}):`, errorMsg);
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.log(`  ❌ Too many consecutive errors for category ${categoryId}, skipping to next category`);
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
      
      console.log(`  ✅ Category ${categoryId}: ${categoryProductCount} products found`);
      
      // Add delay between categories to respect rate limits (except for last category)
      if (i < categoryIds.length - 1) {
        console.log('\n⏳ Waiting 3 seconds before next category...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    if (allProducts.length === 0) {
      console.log('\n⚠️  No products found in any of the specified categories');
      return;
    }
    
    // Step 2: Extract product identifiers from all products
    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📦 Processing Product Identifiers');
    console.log('='.repeat(60));
    console.log(`Total products found: ${allProducts.length}`);
    
    const productIdentifiers: Array<{ productId?: string; skuId?: string }> = [];
    
    for (const product of allProducts) {
      const identifier: { productId?: string; skuId?: string } = {};
      
      // Get productId first
      if (product.productId) {
        identifier.productId = String(product.productId);
      } else if (product.id) {
        identifier.productId = String(product.id);
      }
      
      // Also get skuId as fallback
      if (product.currentSku?.skuId) {
        identifier.skuId = String(product.currentSku.skuId);
      } else if (product.skuId) {
        identifier.skuId = String(product.skuId);
      }
      
      // Only add if we have at least one identifier
      if (identifier.productId || identifier.skuId) {
        productIdentifiers.push(identifier);
      }
    }
    
    // Remove duplicates by productId
    const uniqueIdentifiers = productIdentifiers.filter((identifier, index, self) => 
      index === self.findIndex(p => 
        (p.productId && identifier.productId && p.productId === identifier.productId) ||
        (!p.productId && !identifier.productId && p.skuId === identifier.skuId)
      )
    );
    
    console.log(`Unique product identifiers: ${uniqueIdentifiers.length}`);
    console.log(`Removed ${productIdentifiers.length - uniqueIdentifiers.length} duplicates`);
    console.log('='.repeat(60));
    
    // Step 3: Fetch detailed product info and store in database
    console.log(`\n\n${'='.repeat(60)}`);
    console.log('📥 Fetching Detailed Product Information');
    console.log('='.repeat(60));
    console.log(`Fetching details for ${uniqueIdentifiers.length} products...`);
    console.log(`This may take a while (${delayMs}ms delay between requests)...\n`);
    
    const storedProducts = await sephoraSkincareProductsService.fetchAndStoreProductsByIdentifiers(
      uniqueIdentifiers,
      'en-US',
      delayMs
    );
    
    // Get final count
    const finalCount = await sephoraSkincareProductsService.getProductCount();
    
    // Print summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log(`📂 Categories processed: ${categoryIds.length}`);
    console.log(`📦 Total products found: ${allProducts.length}`);
    console.log(`🔍 Unique products: ${uniqueIdentifiers.length}`);
    console.log(`✅ Successfully synced: ${storedProducts.length}`);
    console.log(`📊 Previous count: ${initialCount}`);
    console.log(`📊 New count: ${finalCount}`);
    console.log(`📊 Net new products: ${finalCount - initialCount}`);
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
syncAllSkincareProducts()
  .then(() => {
    console.log('✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed with error:', error);
    process.exit(1);
  });