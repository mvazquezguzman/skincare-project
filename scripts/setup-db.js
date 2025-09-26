const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up database...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push schema to database with explicit DATABASE_URL
  console.log('🗄️  Creating database tables...');
  execSync('DATABASE_URL="file:./dev.db" npx prisma db push', { stdio: 'inherit' });

  console.log('✅ Database setup complete!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Your .env.local is already configured');
  console.log('2. Run: npm run dev');
  console.log('3. Test the authentication flow');
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  process.exit(1);
}
