# Fix Database Connection Error

## Problem
```
Error: getaddrinfo ENOTFOUND db.ukhfejwhkyyociepiuwu.supabase.co
```

This means your Supabase database hostname cannot be found.

## Solutions

### Option 1: Check if Supabase Project is Active

1. **Go to**: https://supabase.com/dashboard
2. **Check your project status**:
   - If it shows "Paused" → Click "Restore" or "Resume"
   - If it shows "Active" → Continue to Option 2
   - If project is missing → Go to Option 3

### Option 2: Get Fresh Connection String

1. **Go to**: https://supabase.com/dashboard
2. **Select your project**: `ukhfejwhkyyociepiuwu`
3. **Go to**: Settings → Database
4. **Copy the connection string** again (it might have changed)
5. **Update your `.env` file** with the new connection string

### Option 3: Create New Supabase Project

If your project was deleted or you can't access it:

1. **Go to**: https://supabase.com
2. **Create a new project**:
   - Name: `signal-sender` (or any name)
   - Database Password: Use `JJ!meYfe%3nX?9Z` or generate a new one
   - Region: Choose Asia (or closest to you)
3. **Wait for project to be ready** (~2 minutes)
4. **Get connection string**:
   - Settings → Database → Connection string → URI
5. **Update your `.env` file**

### Option 4: Use Pooler Connection (Alternative)

Sometimes the direct connection doesn't work. Try the **Pooler** connection:

1. In Supabase Dashboard → Settings → Database
2. Look for **Connection Pooling**
3. Copy the **Session mode** or **Transaction mode** connection string
4. It will look like:
   ```
   postgresql://postgres.ukhfejwhkyyociepiuwu:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
5. Update your `.env` file

## After Updating Connection String

1. **Test the connection**:
   ```powershell
   npm run db:check
   ```

2. **If successful**, restart your server:
   ```powershell
   npm run dev
   ```

## Quick Check

Run this to verify your Supabase project:
```powershell
# Test if you can reach Supabase
Test-NetConnection -ComputerName supabase.com -Port 443
```

If this fails, you might have a network/firewall issue.


