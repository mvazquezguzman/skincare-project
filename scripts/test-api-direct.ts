#!/usr/bin/env tsx

/**
 * Test API Direct
 * 
 * Description:
 *   Direct API testing script using axios to verify Sephora API connectivity
 *   and response format. Useful for debugging API issues and subscription status.
 * 
 *   Use this script when:
 *   - Debugging API connectivity issues
 *   - Verifying RapidAPI subscription status
 *   - Testing raw API responses
 * 
 *   For normal testing, use test-api.ts instead (uses service layer).
 * 
 * Usage:
 *   npx tsx scripts/test-api-direct.ts
 */

import { config } from 'dotenv';
import axios from 'axios';

config({ path: '.env.local' });

async function testApiDirect() {
  console.log('🧪 Testing Sephora API directly...');
  
  const options = {
    method: 'GET',
    url: 'https://sephora.p.rapidapi.com/us/products/v2/list',
    params: {
      pageSize: '10',
      currentPage: '1',
      categoryId: 'cat1080037'
    },
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY ,
      'x-rapidapi-host': 'sephora.p.rapidapi.com'
    }
  };

  try {
    console.log('🚀 Making API request...');
    const response = await axios.request(options);
    
    console.log('✅ API Response successful!');
    console.log('Status:', response.status);
    console.log('Data structure:', Object.keys(response.data));
    console.log('Products count:', response.data.data?.products?.length || 0);
    
    if (response.data.data?.products?.length > 0) {
      console.log('Sample product:');
      console.log(JSON.stringify(response.data.data.products[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ API test failed:');
    
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      
      if (error.response?.data?.message?.includes('not subscribed')) {
        console.log('💡 You need to subscribe to the Sephora API on RapidAPI');
        console.log('   Visit: https://rapidapi.com/letscrape-6bRBa3QguO5/api/sephora');
      }
    } else {
      console.error('Error:', error);
    }
  }
}

testApiDirect();
