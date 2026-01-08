# How to Get Your Supabase Connection String

## Quick Steps:

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Select your project** (the one you created)
3. **Go to Settings** (gear icon in left sidebar)
4. **Click on "Database"** in the settings menu
5. **Scroll down to "Connection string"** section
6. **Copy the "URI" format** (not the other formats)

The connection string will look like one of these:

**Option 1 (Pooler - Recommended):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Option 2 (Direct):**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

## What You Need:

- **Project Reference**: Found in your Supabase project URL or settings
- **Region**: Usually shown in the connection string (e.g., `us-east-1`, `eu-west-1`)
- **Password**: `JJ!meYfe%3nX?9Z` (your password)

## Quick Way:

Just copy the **URI** connection string from Supabase dashboard and replace `[YOUR-PASSWORD]` with your actual password: `JJ!meYfe%3nX?9Z`

**Note**: The password will be automatically URL-encoded when you paste it into the connection string.

