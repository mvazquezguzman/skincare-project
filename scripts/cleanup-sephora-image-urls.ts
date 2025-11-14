#!/usr/bin/env tsx

/**
 * Cleanup Sephora Product Image URLs
 * 
 * Description:
 *   Cleans up the imageURL column in sephora_products table by removing
 *   query parameters and extensions after .jpg (e.g., ?pb=clean-at-sephora)
 * 
 * Usage:
 *   npx tsx scripts/cleanup-sephora-image-urls.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

/**
 * Clean image URL by removing everything after .jpg
 * Example: 
 *   Input:  https://www.sephora.com/productimages/sku/s2820900-main-zoom.jpg?pb=clean-at-sephora
 *   Output: https://www.sephora.com/productimages/sku/s2820900-main-zoom.jpg
 */
function cleanImageUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  // Find the position of .jpg in the URL
  const jpgIndex = url.indexOf('.jpg');
  
  if (jpgIndex === -1) {
    // No .jpg found, return as is
    return url;
  }

  // Extract everything up to and including .jpg
  return url.substring(0, jpgIndex + 4);
}

async function cleanupImageUrls() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase environment variables');
    console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🧹 Starting cleanup of Sephora product image URLs...\n');

  try {
    // First, get all products with imageURL
    console.log('📥 Fetching all products from database...');
    const { data: products, error: fetchError } = await supabase
      .from('sephora_products')
      .select('productId, imageURL')
      .not('imageURL', 'is', null);

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError);
      throw fetchError;
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No products found with imageURL');
      return;
    }

    console.log(`✅ Found ${products.length} products with imageURL\n`);

    // Process products and find ones that need cleaning
    const productsToUpdate: Array<{ productId: string; cleanedUrl: string }> = [];
    let cleanedCount = 0;
    let unchangedCount = 0;

    console.log('🔍 Analyzing image URLs...\n');

    for (const product of products) {
      const originalUrl = product.imageURL;
      const cleanedUrl = cleanImageUrl(originalUrl);

      if (cleanedUrl !== originalUrl) {
        productsToUpdate.push({
          productId: product.productId,
          cleanedUrl: cleanedUrl || ''
        });
        cleanedCount++;
      } else {
        unchangedCount++;
      }
    }

    console.log(`📊 Analysis Results:`);
    console.log(`   Total products: ${products.length}`);
    console.log(`   URLs to clean: ${cleanedCount}`);
    console.log(`   URLs already clean: ${unchangedCount}\n`);

    if (productsToUpdate.length === 0) {
      console.log('✨ All image URLs are already clean! No updates needed.');
      return;
    }

    // Show some examples
    console.log('📝 Sample URLs to be cleaned:');
    const sampleSize = Math.min(5, productsToUpdate.length);
    for (let i = 0; i < sampleSize; i++) {
      const product = products.find(p => p.productId === productsToUpdate[i].productId);
      console.log(`   ${i + 1}. ${product?.imageURL}`);
      console.log(`      → ${productsToUpdate[i].cleanedUrl}\n`);
    }

    // Ask for confirmation (in a script, we'll proceed automatically)
    console.log(`\n🔄 Updating ${productsToUpdate.length} products...\n`);

    // Update products in batches to avoid overwhelming the database
    const batchSize = 100;
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < productsToUpdate.length; i += batchSize) {
      const batch = productsToUpdate.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(productsToUpdate.length / batchSize);

      console.log(`   Processing batch ${batchNumber}/${totalBatches} (${batch.length} products)...`);

      // Update each product in the batch
      for (const product of batch) {
        const { error: updateError } = await supabase
          .from('sephora_products')
          .update({ imageURL: product.cleanedUrl })
          .eq('productId', product.productId);

        if (updateError) {
          console.error(`      ❌ Error updating product ${product.productId}:`, updateError.message);
          errorCount++;
        } else {
          updatedCount++;
        }
      }

      console.log(`      ✅ Batch ${batchNumber} completed`);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`📦 Total products processed: ${products.length}`);
    console.log(`🧹 URLs cleaned: ${cleanedCount}`);
    console.log(`✅ Successfully updated: ${updatedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`✨ Unchanged: ${unchangedCount}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n💥 Cleanup failed:');
    
    if (error instanceof Error) {
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    
    process.exit(1);
  }
}

// Run the cleanup
cleanupImageUrls()
  .then(() => {
    console.log('✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed with error:', error);
    process.exit(1);
  });
