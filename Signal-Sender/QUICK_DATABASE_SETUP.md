# Quick Database Setup

## ⚠️ Issue: Replit Database Not Accessible Locally

The Replit database (`helium/heliumdb`) is only accessible from within Replit. To run locally, you need a database that's accessible from your computer.

## ✅ Solution: Use a Free Cloud Database (5 minutes)

### Option 1: Supabase (Recommended - Easiest)

1. **Go to**: https://supabase.com
2. **Click**: "Start your project" → Sign up (free)
3. **Create a new project**:
   - Name: `signal-sender` (or any name)
   - Database Password: **Remember this!** (or use their generated one)
   - Region: Choose closest to you
   - Click "Create new project" (takes ~2 minutes)

4. **Get Connection String**:
   - Go to **Settings** (gear icon) → **Database**
   - Scroll to **Connection string** section
   - Copy the **URI** format (starts with `postgresql://`)

5. **Update your `.env` file**:
   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   
   Replace `[PASSWORD]` with the password you set during project creation.

### Option 2: Neon (Alternative)

1. **Go to**: https://neon.tech
2. **Sign up** (free)
3. **Create a project**
4. **Copy the connection string** from the dashboard
5. **Add to `.env`**:
   ```env
   DATABASE_URL=your_neon_connection_string_here
   ```

## After Setting Up

1. **Test the connection**:
   ```powershell
   npm run db:check
   ```

2. **Create the tables**:
   ```powershell
   npm run db:push
   ```

3. **Start the app**:
   ```powershell
   npm run dev
   ```

## Your `.env` File Should Look Like:

```env
DATABASE_URL=postgresql://postgres.xxxxx:your_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
PORT=5000
```

**Note**: Never commit your `.env` file to git! It contains sensitive information.

