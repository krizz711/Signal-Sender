# Quick Gmail Setup Guide

## Step 1: Enable 2-Factor Authentication

1. Go to: https://myaccount.google.com/security
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the steps to enable it (if not already enabled)

## Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   - You may need to sign in again
   
2. Under "Select app", choose **Mail**
   
3. Under "Select device", choose **Other (Custom name)**
   - Enter: "Signal Sender" or any name you like
   
4. Click **Generate**
   
5. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - **Remove spaces** when using it: `abcdefghijklmnop`
   - Save it somewhere safe - you can't see it again!

## Step 3: Update Your .env File

Add these two lines to your `.env` file:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-16-character-app-password
```

**Example:**
```env
DATABASE_URL=postgresql://postgres.ukhfejwhkyyociepiuwu:JJ!meYfe%253nX%3F9Z@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
PORT=5000
GMAIL_USER=myname@gmail.com
GMAIL_PASS=abcdefghijklmnop
```

## Step 4: Restart Server

After updating `.env`:
1. Stop the server (Ctrl+C)
2. Start it again: `npm run dev`
3. You should see: **"Email service initialized with Gmail SMTP"** instead of the error message

## Testing

1. Go to: http://127.0.0.1:5000
2. Register an email address in "Notification Settings"
3. Use "Hardware Simulator" to send a test alert
4. Check your Gmail inbox!

## Important Notes

- ⚠️ **Use App Password, NOT your regular Gmail password**
- The App Password is 16 characters (remove spaces)
- Keep your `.env` file secure - never commit it to git
- If you change your Google password, you'll need to generate a new App Password

## Troubleshooting

### "Invalid login" error
- Make sure you're using the App Password, not your regular password
- Verify 2-Factor Authentication is enabled
- Try generating a new App Password

### Still seeing "Email service credentials not found"
- Check that GMAIL_USER and GMAIL_PASS are in your `.env` file
- Make sure you restarted the server after updating `.env`
- Check for typos in the variable names
