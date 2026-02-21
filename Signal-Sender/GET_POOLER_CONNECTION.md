# How to Get Pooler Connection String from Supabase

## Steps:

1. **In Supabase Dashboard** → Your Project → **Settings** → **Database**
2. **Scroll down** to find **"Connection Pooling"** section
3. **You'll see different connection modes**:
   - **Session mode** (recommended for most apps)
   - **Transaction mode** (for serverless)
4. **Look for the connection string** - it will show something like:
   ```
   postgresql://postgres.ukhfejwhkyyociepiuwu:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```

## What to Copy:

Copy the **entire connection string** and replace `[YOUR-PASSWORD]` with: `JJ!meYfe%3nX?9Z`

The final connection string should look like:
```
postgresql://postgres.ukhfejwhkyyociepiuwu:JJ!meYfe%253nX%3F9Z@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

## Update Your .env File:

```env
DATABASE_URL=postgresql://postgres.ukhfejwhkyyociepiuwu:JJ!meYfe%253nX%3F9Z@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
PORT=5000
```

**Note**: 
- Port is **6543** (pooler) not 5432 (direct)
- Password needs URL encoding (`%253` = `%`, `%3F` = `?`)
