# Database Health Checker

This directory contains tools to check if your Supabase database is running and accessible.

## Files

- `check-database.js` - JavaScript version (Node.js)
- `check-database.ts` - TypeScript version (requires tsx)
- `check-database.sh` - Shell script wrapper
- `README.md` - This documentation

## Usage

### Option 1: Using npm scripts (Recommended)

```bash
# Install dependencies first
npm install

# Run the JavaScript version
npm run check-db

# Run the TypeScript version (requires tsx)
npm run check-db:ts
```

### Option 2: Direct execution

```bash
# Make the shell script executable (if not already)
chmod +x scripts/check-database.sh

# Run the shell script
./scripts/check-database.sh

# Or run the JavaScript version directly
node scripts/check-database.js

# Or run the TypeScript version (if tsx is installed)
npx tsx scripts/check-database.ts
```

## What it checks

The database health checker performs the following checks:

1. **Environment Variables** - Verifies that required Supabase environment variables are set
2. **Supabase Connection** - Tests basic connectivity to your Supabase project
3. **Authentication Service** - Verifies that the auth service is running
4. **Users Table** - Checks if the users table exists and is accessible
5. **Database Health** - Performs a general health check on the database

## Environment Variables Required

Make sure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Output

The checker will display:
- ✅ Green checkmarks for successful checks
- ❌ Red X marks for failed checks
- ⚠️ Yellow warnings for issues that need attention
- 📊 A summary of all checks at the end

## Troubleshooting

### Missing Environment Variables
If you see missing environment variables:
1. Create a `.env.local` file in your project root
2. Add your Supabase credentials
3. Restart your development server

### Connection Failed
If the connection fails:
1. Verify your Supabase URL and key are correct
2. Check if your Supabase project is running
3. Ensure you have internet connectivity

### Users Table Missing
If the users table doesn't exist:
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the `supabase/setup-database.sql` script

## Exit Codes

- `0` - All checks passed
- `1` - One or more checks failed

This makes it easy to use in CI/CD pipelines or automated scripts.
