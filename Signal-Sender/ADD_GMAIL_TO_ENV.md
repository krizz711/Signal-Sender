# How to Add Gmail to .env File

## Your .env File Should Look Like This:

```env
DATABASE_URL=postgresql://postgres.ukhfejwhkyyociepiuwu:JJ!meYfe%253nX%3F9Z@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
PORT=5000
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-16-character-app-password
```

## Steps:

1. **Open your `.env` file** in the `Signal-Sender` folder

2. **Add these two lines at the end:**
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=abcdefghijklmnop
   ```

3. **Replace with your actual values:**
   - `your-email@gmail.com` → Your Gmail address
   - `abcdefghijklmnop` → Your 16-character App Password (no spaces)

4. **Save the file**

5. **Restart your server:**
   ```powershell
   # Stop server (Ctrl+C)
   npm run dev
   ```

6. **You should see:**
   ```
   Email service initialized with Gmail SMTP
   ```
   Instead of: "Email service credentials not found"

## Example:

If your email is `munalmax777@gmail.com` and your App Password is `abcd efgh ijkl mnop`, your .env should have:

```env
DATABASE_URL=postgresql://postgres.ukhfejwhkyyociepiuwu:JJ!meYfe%253nX%3F9Z@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
PORT=5000
GMAIL_USER=munalmax777@gmail.com
GMAIL_PASS=abcdefghijklmnop
```

## Don't Have App Password Yet?

1. Go to: https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification first (if needed)
3. Generate App Password for "Mail"
4. Copy the 16-character password

## Important:

- ⚠️ **Never use your regular Gmail password**
- ✅ **Always use App Password** (16 characters, no spaces)
- 🔒 **Keep `.env` file private** - never share or commit to git
