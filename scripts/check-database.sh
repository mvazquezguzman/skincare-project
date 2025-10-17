#!/bin/bash

# Database Health Checker Shell Script
# Checks if Supabase database is running and accessible

echo "🔍 Starting Supabase Database Health Check..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found"
    echo "Please create a .env.local file with your Supabase credentials:"
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js to run the database checker"
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
fi

# Run the JavaScript version of the database checker
echo "Running database health check..."
node scripts/check-database.js

# Capture exit code
exit_code=$?

if [ $exit_code -eq 0 ]; then
    echo ""
    echo "✅ Database health check completed successfully!"
else
    echo ""
    echo "❌ Database health check failed!"
fi

exit $exit_code
