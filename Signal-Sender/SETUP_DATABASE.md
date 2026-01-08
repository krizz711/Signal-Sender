# Database Setup Guide

## Quick Setup

### Option 1: Use Your Replit Database (You already have this!)

1. Open the `.env` file in the `Signal-Sender` folder
2. Add this line:

```env
DATABASE_URL=postgresql://postgres:password@helium/heliumdb?sslmode=disable
```

**Note**: If your Replit database has a different password, replace `password` with your actual password.

### Option 2: Use a Free Cloud Database (Recommended for Production)

#### Supabase (Free Tier)
1. Go to https://supabase.com
2. Sign up and create a new project
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. Add to `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

#### Neon (Free Tier)
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string from the dashboard
4. Add to `.env`:
   ```env
   DATABASE_URL=your_neon_connection_string
   ```

## Verify Database Setup

After setting up your `.env` file, run:

```powershell
npm run db:check
```

This will:
- ✅ Check if DATABASE_URL is set
- ✅ Test the database connection
- ✅ Verify tables exist
- ✅ Show any errors

## Initialize Database Tables

Once the connection works, create the tables:

```powershell
npm run db:push
```

You should see:
```
[✓] Pulling schema from database...
[✓] Pushing schema to database...
```

## Your .env File Should Look Like:

```env
DATABASE_URL=postgresql://postgres:password@helium/heliumdb?sslmode=disable
PORT=5000
```

(Optional: Add GMAIL_USER and GMAIL_PASS for email notifications)

## Troubleshooting

### "DATABASE_URL must be set" Error
- Make sure `.env` file exists in the `Signal-Sender` folder
- Check that `DATABASE_URL=` is on a single line (no line breaks)
- Restart your terminal after creating/editing `.env`

### Connection Failed
- Verify the connection string is correct
- Check if the database server is accessible
- For Replit database: Make sure it's still active
- For cloud databases: Check if the project is running

