#!/usr/bin/env tsx

/**
 * Seed Products
 * 
 * Description:
 *   Seeds the database with initial sample products for testing and development.
 *   Can be run with --force flag to overwrite existing data.
 * 
 * Usage:
 *   npm run seed-products
 *   npx tsx scripts/seed-products.ts
 *   npx tsx scripts/seed-products.ts --force
 */

import { config } from 'dotenv';
import { checkAndSeedProducts, forceSeedWithSamples } from '../lib/seed-products';

config({ path: '.env.local' });

async function main() {
  console.log('🌱 Starting product seeding...');
  
  try {
    const forceSeed = process.argv.includes('--force') || process.argv.includes('-f');
    
    if (forceSeed) {
      console.log('🔄 Force seeding with sample products...');
      const result = await forceSeedWithSamples();
      
      if (result.success) {
        console.log(`✅ Successfully seeded database with sample products!`);
        console.log(`📊 ${result.message}`);
      } else {
        console.error(`❌ Failed to seed database: ${result.message}`);
        process.exit(1);
      }
    } else {
      console.log('🔍 Checking database and seeding if needed...');
      const result = await checkAndSeedProducts();
      
      if (result.success) {
        console.log(`✅ Database seeding completed!`);
        console.log(`📊 ${result.message}`);
      } else {
        console.error(`❌ Failed to seed database: ${result.message}`);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

main();
