# Windows Local Setup Guide

This guide will help you run the Signal-Sender project on your Windows machine.

## Prerequisites

1. **Node.js 20+** - Download from https://nodejs.org/
2. **PostgreSQL Database** - Choose one option:
   - **Option A (Easiest)**: Use a free cloud database (Supabase or Neon)
   - **Option B**: Install PostgreSQL locally from https://www.postgresql.org/download/windows/

## Step-by-Step Setup

### 1. Install Dependencies

Open PowerShell or Command Prompt in the project folder and run:

```powershell
cd Signal-Sender
npm install
```

### 2. Set Up Database

#### Option A: Free Cloud Database (Recommended - No Installation Needed)

1. **Supabase** (Recommended):
   - Go to https://supabase.com
   - Sign up for free account
   - Create a new project
   - Go to **Settings** → **Database**
   - Copy the **Connection String** (URI format)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

2. **Neon** (Alternative):
   - Go to https://neon.tech
   - Sign up for free account
   - Create a new project
   - Copy the connection string from the dashboard

#### Option B: Local PostgreSQL

1. Download and install PostgreSQL from https://www.postgresql.org/download/windows/
2. During installation, remember the password you set for the `postgres` user
3. Open **pgAdmin** or **psql** command line
4. Create a database:
   ```sql
   CREATE DATABASE signal_sender;
   ```
5. Your connection string will be:
   ```
   postgresql://postgres:YOUR_PASSWORD@localhost:5432/signal_sender
   ```

### 3. Create .env File

1. In the `Signal-Sender` folder, create a new file named `.env` (no extension)
2. Add the following content:

```env
# Database Configuration (REQUIRED)
DATABASE_URL=your_postgresql_connection_string_here

# Email Configuration (Optional - for Gmail notifications)
# If not set, emails will be logged to console but not sent
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# Server Port (Optional - defaults to 5000)
PORT=5000
```

**Important**: Replace `your_postgresql_connection_string_here` with your actual database connection string from Step 2.

### 4. Initialize Database Tables

Run this command to create the database tables:

```powershell
npm run db:push
```

You should see:
```
[✓] Pulling schema from database...
[✓] Pushing schema to database...
```

If you see "No changes detected", the tables already exist (which is fine).

### 5. Start the Development Server

```powershell
npm run dev
```

The server will start on `http://localhost:5000`

Open your browser and navigate to: **http://localhost:5000**

## Gmail Configuration (Optional)

To enable email notifications:

1. Enable **2-Factor Authentication** on your Google account
2. Generate an **App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password
3. Add to your `.env` file:
   - `GMAIL_USER`: Your Gmail address
   - `GMAIL_PASS`: The app password (NOT your regular password)

**Note**: Without Gmail credentials, the system will still work but emails will only be logged to the console.

## Troubleshooting

### "DATABASE_URL must be set" Error
- Make sure you created a `.env` file in the `Signal-Sender` folder
- Check that `DATABASE_URL` is on a single line (no line breaks)
- Restart the server after creating/editing `.env`

### Database Connection Failed
- Verify your connection string is correct
- For cloud databases: Check if the database is running/active
- For local PostgreSQL: Make sure PostgreSQL service is running
  - Open **Services** (Win+R → `services.msc`)
  - Find "postgresql" service and ensure it's running

### Port Already in Use
- Change the `PORT` in your `.env` file to a different number (e.g., 5001)
- Or close the application using port 5000

### npm install Errors
- Make sure you have Node.js 20+ installed: `node --version`
- Try deleting `node_modules` folder and `package-lock.json`, then run `npm install` again

## Next Steps

Once the server is running:
1. Open http://localhost:5000 in your browser
2. Register an email address in the dashboard
3. Use the "Hardware Simulator" to test door alerts
4. Check the logs table to see recorded events

## Need Help?

- Check the main `README.md` for more details
- Verify all environment variables are set correctly
- Check the console output for error messages

