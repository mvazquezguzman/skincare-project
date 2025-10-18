#!/usr/bin/env tsx

/**
 * Test API
 * 
 * Description:
 *   Tests the Sephora API with proper rate limiting and error handling.
 *   Fetches multiple pages to verify API stability and response consistency.
 * 
 * Usage:
 *   npx tsx scripts/test-api.ts
 */

import { config } from 'dotenv';
import { fetchProductsFromApi } from '../lib/products';

config({ path: '.env.local' });

async function testApi() {
  console.log('🧪 Testing Sephora API...');
  
  try {
    console.log('Fetching first page (10 products)...');
    const products = await fetchProductsFromApi(10, 1);
    
    console.log(`✅ Successfully fetched ${products.length} products`);
    if (products.length > 0) {
      console.log('Sample product:', products[0]);
    }
    
    console.log('Waiting 3 seconds before next request...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Fetching second page (10 products)...');
    const products2 = await fetchProductsFromApi(10, 2);
    
    console.log(`✅ Successfully fetched ${products2.length} products from page 2`);
    console.log('Total products fetched:', products.length + products2.length);
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    console.log('💡 Make sure you have a valid RAPIDAPI_KEY in your .env.local file');
  }
}

testApi();
