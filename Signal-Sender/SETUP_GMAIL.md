# Gmail Email Setup Guide

## Why Emails Aren't Sending

Your `.env` file is missing Gmail credentials. The system is currently only logging emails to the console instead of sending them.

## Step-by-Step Setup

### 1. Enable 2-Factor Authentication

1. Go to: https://myaccount.google.com/security
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the steps to enable it (if not already enabled)

### 2. Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
   - You may need to sign in again
2. Under "Select app", choose **Mail**
3. Under "Select device", choose **Other (Custom name)**
   - Enter: "Signal Sender" or any name
4. Click **Generate**
5. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - Remove spaces when using it: `abcdefghijklmnop`

### 3. Update Your .env File

Add these two lines to your `.env` file:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-16-character-app-password
```

**Example:**
```env
DATABASE_URL=postgresql://postgres:JJ!meYfe%253nX%3F9Z@db.ukhfejwhkyyociepiuwu.supabase.co:5432/postgres
PORT=5000
GMAIL_USER=myemail@gmail.com
GMAIL_PASS=abcdefghijklmnop
```

### 4. Restart the Server

After updating `.env`:
1. Stop the server (Ctrl+C)
2. Start it again: `npm run dev`
3. You should see: "Email service initialized with Gmail SMTP" instead of the error message

## Testing

1. Go to your dashboard: http://127.0.0.1:5000
2. Register your email address in the "Notification Settings"
3. Use the "Hardware Simulator" to send a test alert
4. Check your Gmail inbox for the alert email

## Important Notes

- **Use App Password, NOT your regular Gmail password**
- The App Password is 16 characters (remove spaces)
- Keep your `.env` file secure - never commit it to git
- If you change your Google password, you'll need to generate a new App Password

## Troubleshooting

### "Invalid login" error
- Make sure you're using the App Password, not your regular password
- Verify 2-Factor Authentication is enabled
- Try generating a new App Password

### "Less secure app access" error
- This shouldn't happen with App Passwords
- Make sure you're using an App Password, not your regular password

### Emails still not sending
- Check the server console for error messages
- Verify GMAIL_USER and GMAIL_PASS are in your `.env` file
- Make sure you restarted the server after updating `.env`

