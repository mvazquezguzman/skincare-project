#!/usr/bin/env tsx

/**
 * Count Products by Skin Concerns
 * 
 * Description:
 *   Counts all products by their skin concern types from both Ulta and Sephora tables.
 * 
 * Usage:
 *   npx tsx scripts/count-skin-concerns.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

async function countProductsByConcerns() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase environment variables');
    console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔍 Counting products by skin concerns...\n');

  try {
    // Fetch all products from both tables
    console.log('📥 Fetching all products from database...');
    
    // Fetch Ulta products
    const batchSize = 1000;
    let allUltaProducts: any[] = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: products, error: fetchError } = await supabase
        .from('ulta_products')
        .select('id, skin_concerns')
        .not('skin_concerns', 'is', null)
        .range(from, from + batchSize - 1);

      if (fetchError) {
        console.error('❌ Error fetching Ulta products:', fetchError);
        throw fetchError;
      }

      if (products && products.length > 0) {
        allUltaProducts = [...allUltaProducts, ...products];
        from += batchSize;
        hasMore = products.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    // Fetch Sephora products
    from = 0;
    hasMore = true;
    let allSephoraProducts: any[] = [];

    while (hasMore) {
      const { data: products, error: fetchError } = await supabase
        .from('sephora_products')
        .select('productId, skin_concerns')
        .not('skin_concerns', 'is', null)
        .range(from, from + batchSize - 1);

      if (fetchError) {
        console.error('❌ Error fetching Sephora products:', fetchError);
        throw fetchError;
      }

      if (products && products.length > 0) {
        allSephoraProducts = [...allSephoraProducts, ...products];
        from += batchSize;
        hasMore = products.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    console.log(`✅ Found ${allUltaProducts.length} Ulta products and ${allSephoraProducts.length} Sephora products with skin_concerns\n`);

    // Map to store concern counts
    const concernCounts: Record<string, number> = {};

    // Helper function to parse concerns array
    const parseConcerns = (skinConcerns: any): string[] => {
      if (Array.isArray(skinConcerns)) {
        return skinConcerns.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
      } else if (typeof skinConcerns === 'string') {
        try {
          const parsed = JSON.parse(skinConcerns);
          if (Array.isArray(parsed)) {
            return parsed.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
          }
        } catch {
          // If parsing fails, treat as single concern
          return skinConcerns.trim() ? [skinConcerns.trim()] : [];
        }
      }
      return [];
    };

    // Count concerns from Ulta products
    console.log('📊 Processing Ulta products...');
    for (const product of allUltaProducts) {
      if (!product.skin_concerns) continue;

      const concernsArray = parseConcerns(product.skin_concerns);
      for (const concern of concernsArray) {
        const normalizedConcern = concern.trim();
        if (normalizedConcern) {
          concernCounts[normalizedConcern] = (concernCounts[normalizedConcern] || 0) + 1;
        }
      }
    }

    // Count concerns from Sephora products
    console.log('📊 Processing Sephora products...');
    for (const product of allSephoraProducts) {
      if (!product.skin_concerns) continue;

      const concernsArray = parseConcerns(product.skin_concerns);
      for (const concern of concernsArray) {
        const normalizedConcern = concern.trim();
        if (normalizedConcern) {
          concernCounts[normalizedConcern] = (concernCounts[normalizedConcern] || 0) + 1;
        }
      }
    }

    // Sort concerns by count (descending) then alphabetically
    const sortedConcerns = Object.entries(concernCounts).sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1]; // Sort by count descending
      }
      return a[0].localeCompare(b[0]); // Then alphabetically
    });

    // Print results
    console.log('='.repeat(60));
    console.log('📊 SKIN CONCERNS COUNT');
    console.log('='.repeat(60));
    console.log('\n');
    
    for (const [concern, count] of sortedConcerns) {
      console.log(`${concern}: ${count}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Total unique concerns: ${sortedConcerns.length}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n💥 Error counting products:');
    
    if (error instanceof Error) {
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error('Unknown error:', error);
    }
    
    process.exit(1);
  }
}

// Run the count
countProductsByConcerns()
  .then(() => {
    console.log('✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed with error:', error);
    process.exit(1);
  });

  /**
   * Output:
   * Dryness: 832
   * Dullness: 590
   * Fine Lines: 530
   * Wrinkles: 517
   * Uneven Texture: 426
   * Loss of Firmness and Elasticity: 395
   * Redness: 297
   * Pores: 263
   * Dark Spots: 249
   * Acne: 243
   * Oiliness: 205
   * Blemishes: 150
   * Dark Circles: 89
   * Discoloration: 83
   * Puffiness: 82
   * Uneven Tone: 31
   * Post-Acne Marks: 15
   * Anti-Aging: 5
   * Hyperpigmentation: 1
   * ============================================================
   * Total unique concerns: 19
   */