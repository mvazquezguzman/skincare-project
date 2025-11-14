#!/usr/bin/env tsx

/**
 * Cleanup Sephora Product Description
 * 
 * Description:
 *   Cleans up the description column in sephora_products table by:
 *   - Extracting only the "What it is:" section (without HTML tags)
 *   - Extracting "Skin Type:" and updating the skin_type column
 *   - Extracting "Skincare Concerns:" and updating the skin_concerns column
 *   - Removing all HTML tags from the description
 * 
 * Usage:
 *   npx tsx scripts/cleanup-sephora-description.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

/**
 * Remove HTML tags from text
 */
function stripHtml(html: string): string {
  if (!html) return '';
  
  // Replace <br> and <br/> with spaces
  let text = html.replace(/<br\s*\/?>/gi, ' ');
  
  // Remove all HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  
  // Clean up multiple spaces
  text = text.replace(/\s+/g, ' ').trim();
  
  return text.trim();
}

/**
 * Parse description HTML and extract structured data
 * Returns: { cleanDescription, skinTypes, skinConcerns }
 */
function parseDescription(descriptionHtml: string | null): {
  cleanDescription: string;
  skinTypes: string[];
  skinConcerns: string[];
} {
  if (!descriptionHtml) {
    return { cleanDescription: '', skinTypes: [], skinConcerns: [] };
  }

  let cleanDescription = '';
  const skinTypes: string[] = [];
  const skinConcerns: string[] = [];

  // Extract "What it is" section - match content after <b>What it is: </b> until next section
  // Handle both <b> and <strong> tags
  // Stop at the next <b> or <strong> tag (which starts the next section), or at end of string
  const whatItIsRegex = /<(?:b|strong)>What it is:\s*<\/(?:b|strong)>([\s\S]*?)(?=<(?:b|strong)>|$)/i;
  const whatItIsMatch = descriptionHtml.match(whatItIsRegex);
  
  if (whatItIsMatch && whatItIsMatch[1]) {
    // Extract text from the matched content
    let whatItIsText = whatItIsMatch[1];
    // Clean HTML and extract just the text
    cleanDescription = stripHtml(whatItIsText).trim();
  }

  // Extract "Skin Type" section - handle both <b> and <strong> tags
  // Stop at the next <b> or <strong> tag (which starts the next section), or at end of string
  const skinTypeRegex = /<(?:b|strong)>Skin Type:\s*<\/(?:b|strong)>([\s\S]*?)(?=<(?:b|strong)>|$)/i;
  const skinTypeMatch = descriptionHtml.match(skinTypeRegex);
  
  if (skinTypeMatch && skinTypeMatch[1]) {
    let skinTypeText = skinTypeMatch[1];
    const cleanedText = stripHtml(skinTypeText);
    // Split by comma, "and", or "&"
    const types = cleanedText
      .split(/,|\s+and\s+|\s*&\s*/i)
      .map(t => t.trim())
      .filter(t => t.length > 0);
    skinTypes.push(...types);
  }

  // Extract "Skincare Concerns" section - handle both <b> and <strong> tags
  // Stop at the next <b> or <strong> tag (which starts the next section), or at end of string
  const concernsRegex = /<(?:b|strong)>Skincare Concerns:\s*<\/(?:b|strong)>([\s\S]*?)(?=<(?:b|strong)>|$)/i;
  const concernsMatch = descriptionHtml.match(concernsRegex);
  
  if (concernsMatch && concernsMatch[1]) {
    let concernsText = concernsMatch[1];
    const cleanedText = stripHtml(concernsText);
    // Split by comma, "and", or "&"
    const concerns = cleanedText
      .split(/,|\s+and\s+|\s*&\s*/i)
      .map(c => c.trim())
      .filter(c => c.length > 0);
    skinConcerns.push(...concerns);
  }

  return { cleanDescription, skinTypes, skinConcerns };
}

async function cleanupDescription() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase environment variables');
    console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🧹 Starting cleanup of Sephora product descriptions...\n');

  try {
    // First, get all products with description
    console.log('📥 Fetching all products from database...');
    const { data: products, error: fetchError } = await supabase
      .from('sephora_products')
      .select('productId, description, skin_type, skin_concerns')
      .not('description', 'is', null);

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError);
      throw fetchError;
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No products found with description');
      return;
    }

    console.log(`✅ Found ${products.length} products with description\n`);

    // Process products and find ones that need cleaning
    const productsToUpdate: Array<{
      productId: string;
      cleanedDescription: string;
      skinTypes: string[];
      skinConcerns: string[];
    }> = [];
    let cleanedCount = 0;
    let unchangedCount = 0;

    console.log('🔍 Analyzing description fields...\n');

    for (const product of products) {
      const originalDescription = product.description;
      const { cleanDescription, skinTypes, skinConcerns } = parseDescription(originalDescription);

      // Check if description needs updating (has HTML tags or different content)
      const needsDescriptionUpdate = originalDescription !== cleanDescription && cleanDescription.length > 0;
      
      // Check if skin_type needs updating
      const currentSkinTypes = Array.isArray(product.skin_type) ? product.skin_type : [];
      const needsSkinTypeUpdate = JSON.stringify(currentSkinTypes.sort()) !== JSON.stringify(skinTypes.sort());
      
      // Check if skin_concerns needs updating
      const currentSkinConcerns = Array.isArray(product.skin_concerns) ? product.skin_concerns : [];
      const needsSkinConcernsUpdate = JSON.stringify(currentSkinConcerns.sort()) !== JSON.stringify(skinConcerns.sort());

      if (needsDescriptionUpdate || needsSkinTypeUpdate || needsSkinConcernsUpdate) {
        productsToUpdate.push({
          productId: product.productId,
          cleanedDescription: cleanDescription,
          skinTypes: skinTypes,
          skinConcerns: skinConcerns
        });
        cleanedCount++;
      } else {
        unchangedCount++;
      }
    }

    console.log(`📊 Analysis Results:`);
    console.log(`   Total products: ${products.length}`);
    console.log(`   Products to update: ${cleanedCount}`);
    console.log(`   Products already clean: ${unchangedCount}\n`);

    if (productsToUpdate.length === 0) {
      console.log('✨ All description fields are already clean! No updates needed.');
      return;
    }

    // Show some examples
    console.log('📝 Sample products to be cleaned:');
    const sampleSize = Math.min(3, productsToUpdate.length);
    for (let i = 0; i < sampleSize; i++) {
      const product = products.find(p => p.productId === productsToUpdate[i].productId);
      console.log(`\n   ${i + 1}. Product ID: ${productsToUpdate[i].productId}`);
      console.log(`      Original description (first 150 chars): ${product?.description?.substring(0, 150)}...`);
      console.log(`      Cleaned description: ${productsToUpdate[i].cleanedDescription}`);
      console.log(`      Skin Types: ${JSON.stringify(productsToUpdate[i].skinTypes)}`);
      console.log(`      Skin Concerns: ${JSON.stringify(productsToUpdate[i].skinConcerns)}`);
    }

    // Update products in batches to avoid overwhelming the database
    console.log(`\n🔄 Updating ${productsToUpdate.length} products...\n`);

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
          .update({
            description: product.cleanedDescription,
            skin_type: product.skinTypes,
            skin_concerns: product.skinConcerns
          })
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
    console.log(`🧹 Products cleaned: ${cleanedCount}`);
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
cleanupDescription()
  .then(() => {
    console.log('✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed with error:', error);
    process.exit(1);
  });

