# Signal-Sender - IoT Door Alert System

A full-stack application that receives door status signals from ESP8266 hardware and sends email notifications when alerts are triggered.

## Features

- 📧 **Email Notifications**: Configure recipient emails and receive alerts via Gmail
- 🚪 **Door Status Monitoring**: Track door open/closed states with duration tracking
- 📊 **Dashboard**: Real-time dashboard with statistics and event logs
- 🔧 **Hardware Simulator**: Test the system without physical hardware
- 💾 **Database Logging**: All events are stored in PostgreSQL for history

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (or use Replit's built-in PostgreSQL)

> **Running on Windows?** See [SETUP_WINDOWS.md](./SETUP_WINDOWS.md) for detailed Windows-specific setup instructions.

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Database URL**

   The application requires a `DATABASE_URL` environment variable. Choose one option:

   **Option A: Replit (Recommended)**
   - If using Replit, the `postgresql-16` module is already configured
   - Check the **Secrets** tab (lock icon) - `DATABASE_URL` should be auto-generated
   - If missing, add it manually in Secrets

   **Option B: Free Cloud Database**
   - **Supabase**: https://supabase.com (free tier available)
   - **Neon**: https://neon.tech (free tier available)
   - Copy the connection string and set as `DATABASE_URL`

   **Option C: Local PostgreSQL**
   ```bash
   # Create database
   createdb signal_sender
   
   # Set environment variable
   export DATABASE_URL="postgresql://username:password@localhost:5432/signal_sender"
   ```

3. **Set Environment Variables**

   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   GMAIL_USER=your-email@gmail.com  # Optional
   GMAIL_PASS=your-app-password      # Optional
   PORT=5000                         # Optional, defaults to 5000
   ```

   Or in Replit, add these in the **Secrets** tab.

4. **Initialize Database**

   Create the database tables:
   ```bash
   npm run db:push
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

## Gmail Configuration (Optional)

To enable email notifications:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password
3. Set environment variables:
   - `GMAIL_USER`: Your Gmail address
   - `GMAIL_PASS`: The app password (not your regular password)

**Note**: Without Gmail credentials, the system will still log alerts but won't send emails (useful for testing).

## API Endpoints

### Register Email
```http
POST /api/register-email
Content-Type: application/json

{
  "email": "recipient@example.com"
}
```

### Get Current Email
```http
GET /api/email
```

### Receive Door Alert (Hardware)
```http
POST /api/door-alert
Content-Type: application/json

{
  "door_status": "open",
  "alert": true,
  "duration": 5
}
```

Alternative endpoint (for hardware convenience):
```http
POST /door-alert
```

### Get Logs
```http
GET /api/logs
```

## Hardware Integration

Your ESP8266 should send POST requests to:
- `http://your-server-url/api/door-alert` or
- `http://your-server-url/door-alert`

**Payload Format:**
```json
{
  "door_status": "open" | "closed",
  "alert": true | false,
  "duration": 5  // optional, in seconds
}
```

## Project Structure

```
Signal-Sender/
├── client/          # React frontend
│   └── src/
│       ├── pages/   # Page components
│       └── components/  # UI components
├── server/          # Express backend
│   ├── routes.ts    # API routes
│   ├── email.ts     # Email service
│   └── storage.ts   # Database operations
├── shared/          # Shared types and schemas
│   ├── schema.ts    # Database schema
│   └── routes.ts    # API contract definitions
└── script/          # Build scripts
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run db:push` - Push database schema changes
- `npm run check` - Type check TypeScript

## Troubleshooting

### "DATABASE_URL must be set" Error
- Ensure you've set the `DATABASE_URL` environment variable
- In Replit: Check the Secrets tab
- Locally: Create a `.env` file with `DATABASE_URL`

### Database Connection Failed
- Verify your connection string is correct
- Check if PostgreSQL is running (for local setup)
- Ensure database exists and credentials are correct

### Emails Not Sending
- Check `GMAIL_USER` and `GMAIL_PASS` are set correctly
- Verify you're using an App Password (not regular password)
- Check console logs for email service errors

## License

MIT

