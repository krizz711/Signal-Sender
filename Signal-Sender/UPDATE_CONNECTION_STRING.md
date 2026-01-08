# Update Database Connection String

## Current Issue
Your Supabase database connection is failing intermittently. The hostname `db.ukhfejwhkyyociepiuwu.supabase.co` cannot be resolved.

## Solution: Use Pooler Connection String

The **Pooler** connection is more stable and recommended for production use.

### Steps:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `ukhfejwhkyyociepiuwu`
3. **Go to**: Settings → Database
4. **Scroll to**: "Connection Pooling" section
5. **Copy the Pooler connection string** (Session mode or Transaction mode)
   - It will look like:
   ```
   postgresql://postgres.ukhfejwhkyyociepiuwu:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
6. **Update your `.env` file**:
   ```env
   DATABASE_URL=postgresql://postgres.ukhfejwhkyyociepiuwu:JJ!meYfe%253nX%3F9Z@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   PORT=5000
   ```

### Important:
- Replace `[PASSWORD]` with your actual password: `JJ!meYfe%3nX?9Z`
- The password will be URL-encoded automatically
- Use port **6543** (pooler) instead of **5432** (direct)

## Alternative: Check Project Status

If pooler doesn't work:

1. **Check if project is paused**:
   - In Supabase Dashboard, look for "Paused" status
   - Click "Resume" or "Restore" if paused

2. **Get fresh direct connection**:
   - Settings → Database → Connection string → URI
   - Copy and update `.env`

## After Updating:

1. **Test connection**:
   ```powershell
   npm run db:check
   ```

2. **Restart server**:
   ```powershell
   npm run dev
   ```

## Why Pooler is Better:

- ✅ More stable connections
- ✅ Better for serverless/server applications
- ✅ Handles connection pooling automatically
- ✅ Less likely to timeout

