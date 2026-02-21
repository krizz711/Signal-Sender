# Test Database Connection with PostgreSQL

## Option 1: Using psql (PostgreSQL Command Line)

### Install PostgreSQL (if not installed):
1. Download from: https://www.postgresql.org/download/windows/
2. During installation, remember to install command-line tools

### Connect to Supabase Database:

```powershell
# Using Pooler connection (recommended)
psql "postgresql://postgres.ukhfejwhkyyociepiuwu:JJ!meYfe%253nX%3F9Z@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# OR using Direct connection
psql "postgresql://postgres:JJ!meYfe%253nX%3F9Z@db.ukhfejwhkyyociepiuwu.supabase.co:5432/postgres"
```

### Once Connected, Run SQL Commands:

```sql
-- List all tables
\dt

-- Check recipients table
SELECT * FROM recipients;

-- Check alert_logs table
SELECT * FROM alert_logs ORDER BY timestamp DESC LIMIT 10;

-- Check table structure
\d recipients
\d alert_logs

-- Count records
SELECT COUNT(*) FROM recipients;
SELECT COUNT(*) FROM alert_logs;

-- Exit psql
\q
```

## Option 2: Using pgAdmin (GUI Tool)

1. **Install pgAdmin**: Comes with PostgreSQL installer
2. **Add New Server**:
   - Right-click "Servers" → "Register" → "Server"
   - **General tab**: Name = "Supabase Signal-Sender"
   - **Connection tab**:
     - Host: `aws-0-ap-southeast-1.pooler.supabase.com` (for pooler)
     - Port: `6543` (pooler) or `5432` (direct)
     - Database: `postgres`
     - Username: `postgres.ukhfejwhkyyociepiuwu` (for pooler) or `postgres` (direct)
     - Password: `JJ!meYfe%3nX?9Z`
   - Click "Save"

3. **Browse Database**:
   - Expand: Servers → Supabase Signal-Sender → Databases → postgres → Schemas → public → Tables
   - Right-click tables to view data

## Option 3: Using our Database Check Script

```powershell
cd Signal-Sender
npm run db:check
```

This will:
- ✅ Check if DATABASE_URL is set
- ✅ Test database connection
- ✅ List existing tables
- ✅ Show any errors

## Option 4: Test via SQL in Supabase Dashboard

1. **Go to**: Supabase Dashboard → Your Project
2. **Click**: "SQL Editor" in left sidebar
3. **Run queries**:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- View recipients
SELECT * FROM recipients;

-- View recent alerts
SELECT * FROM alert_logs 
ORDER BY timestamp DESC 
LIMIT 10;
```

## Verify Tables Are Created:

Run this SQL to check:

```sql
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('recipients', 'alert_logs');
```

You should see:
- `recipients` with columns: id, email, is_active, updated_at
- `alert_logs` with columns: id, door_status, is_alert, duration, raw_payload, email_sent, timestamp

## Quick Test Commands:

```powershell
# Test connection (PowerShell)
Test-NetConnection -ComputerName aws-0-ap-southeast-1.pooler.supabase.com -Port 6543

# Test with curl
curl "postgresql://postgres.ukhfejwhkyyociepiuwu:JJ!meYfe%253nX%3F9Z@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Use our check script
npm run db:check
```
