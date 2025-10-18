#!/usr/bin/env tsx

/**
 * Database Health Checker
 * 
 * Description:
 *   Comprehensive health check for Supabase database connection and services.
 *   Verifies environment variables, connection, authentication, and table access.
 * 
 * Usage:
 *   npx tsx scripts/check-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

interface CheckResult {
  name: string;
  passed: boolean;
}

async function checkDatabase(): Promise<void> {
  log('🔍 Starting Supabase Database Health Check...', 'blue');
  log('');

  const checks: CheckResult[] = [];
  let allPassed = true;

  // Check 1: Environment Variables
  log('1. Checking Environment Variables...', 'blue');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('   ❌ Missing required environment variables', 'red');
    log('   Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY', 'yellow');
    checks.push({ name: 'Environment Variables', passed: false });
    allPassed = false;
  } else {
    log('   ✅ Environment variables found', 'green');
    checks.push({ name: 'Environment Variables', passed: true });
  }

  if (!supabaseUrl || !supabaseKey) {
    log('');
    log('❌ Cannot proceed without environment variables', 'red');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check 2: Basic Connection
  log('');
  log('2. Testing Supabase Connection...', 'blue');
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      log(`   ❌ Connection failed: ${error.message}`, 'red');
      checks.push({ name: 'Supabase Connection', passed: false });
      allPassed = false;
    } else {
      log('   ✅ Successfully connected to Supabase', 'green');
      checks.push({ name: 'Supabase Connection', passed: true });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    log(`   ❌ Connection error: ${errorMessage}`, 'red');
    checks.push({ name: 'Supabase Connection', passed: false });
    allPassed = false;
  }

  // Check 3: Authentication Service
  log('');
  log('3. Checking Authentication Service...', 'blue');
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      log(`   ❌ Auth service error: ${error.message}`, 'red');
      checks.push({ name: 'Authentication Service', passed: false });
      allPassed = false;
    } else {
      log('   ✅ Authentication service is running', 'green');
      checks.push({ name: 'Authentication Service', passed: true });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    log(`   ❌ Auth service error: ${errorMessage}`, 'red');
    checks.push({ name: 'Authentication Service', passed: false });
    allPassed = false;
  }

  // Check 4: Users Table
  log('');
  log('4. Checking Users Table...', 'blue');
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      log(`   ❌ Users table error: ${error.message}`, 'red');
      log('   💡 Run the supabase/setup-database.sql script to create the users table', 'yellow');
      checks.push({ name: 'Users Table', passed: false });
      allPassed = false;
    } else {
      log('   ✅ Users table is accessible', 'green');
      checks.push({ name: 'Users Table', passed: true });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    log(`   ❌ Users table error: ${errorMessage}`, 'red');
    checks.push({ name: 'Users Table', passed: false });
    allPassed = false;
  }

  // Check 5: Database Health
  log('');
  log('5. Performing Database Health Check...', 'blue');
  try {
    const { data, error } = await supabase.rpc('version');
    if (error) {
      log(`   ⚠️  Database health check failed: ${error.message}`, 'yellow');
      log('   This is normal if the version() function is not available', 'yellow');
      checks.push({ name: 'Database Health', passed: true }); // Don't fail on this
    } else {
      log('   ✅ Database is healthy', 'green');
      checks.push({ name: 'Database Health', passed: true });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    log(`   ⚠️  Database health check failed: ${errorMessage}`, 'yellow');
    log('   This is normal if the version() function is not available', 'yellow');
    checks.push({ name: 'Database Health', passed: true }); // Don't fail on this
  }

  log('');
  log('📊 Health Check Summary:', 'bold');
  log('========================', 'bold');
  
  checks.forEach(check => {
    const status = check.passed ? '✅' : '❌';
    const color = check.passed ? 'green' : 'red';
    log(`${status} ${check.name}`, color);
  });

  log('');
  if (allPassed) {
    log('🎉 All checks passed! Your Supabase database is ready to use.', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some checks failed. Please review the issues above.', 'yellow');
    process.exit(1);
  }
}

checkDatabase().catch(err => {
  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  log(`💥 Unexpected error: ${errorMessage}`, 'red');
  process.exit(1);
});
