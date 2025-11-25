# Email Configuration Guide for UmkaSchool

## ✅ What's Been Implemented

Your email service is now fully functional with:

1. **Password Reset Emails** - Professional HTML emails with clickable reset links
2. **Welcome Emails** - Sent automatically after user signup with a nice design
3. **Fallback Logging** - If email fails, the system logs the token to console (for development)

## 📧 How to Configure Gmail SMTP

### Step 1: Enable 2-Factor Authentication (if not already enabled)

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Enable **2-Step Verification**

### Step 2: Generate an App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select **App**: Choose "Mail"
3. Select **Device**: Choose "Other" and type "UmkaSchool"
4. Click **Generate**
5. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update application.properties

Open: `src/main/resources/application.properties`

Replace these lines:
```properties
spring.mail.username=your.email@gmail.com
spring.mail.password=your-app-specific-password
```

With your actual credentials:
```properties
spring.mail.username=youremail@gmail.com
spring.mail.password=abcdefghijklmnop
```

**Important:** Remove the spaces from the App Password!

### Step 4: Test It!

Restart your application and try:

**Test Signup (will send welcome email):**
```json
POST http://localhost:8080/api/auth/signup
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "your.test.email@gmail.com",
  "password": "password123",
  "role": "STUDENT"
}
```

**Test Password Reset:**
```json
POST http://localhost:8080/api/auth/forgot-password
{
  "email": "your.test.email@gmail.com"
}
```

## 📨 Email Templates

### Welcome Email Includes:
- Personalized greeting with user's name
- List of features they can access
- Professional styling with your app branding

### Password Reset Email Includes:
- Clear call-to-action button
- Plain text link as backup
- 2-hour expiration warning
- Professional styling

## 🔧 Troubleshooting

### If emails don't send:

1. **Check logs** - Look for error messages in console
2. **Verify credentials** - Make sure App Password is correct (no spaces)
3. **Check firewall** - Ensure port 587 is not blocked
4. **Verify 2FA** - Must be enabled on Gmail account
5. **Check spam folder** - Emails might go to spam initially

### Common Errors:

**"Authentication failed"**
- Wrong email or App Password
- 2FA not enabled
- App Password expired (regenerate a new one)

**"Connection timeout"**
- Firewall blocking port 587
- Network issues
- Check if smtp.gmail.com is accessible

## 🎨 Customization

### Change App Name
In `application.properties`:
```properties
app.name=YourCustomName
```

### Customize Email Templates
Edit methods in `EmailServiceImpl.java`:
- `buildPasswordResetEmail()` - for password reset emails
- `buildWelcomeEmail()` - for welcome emails

### Add More Email Types
1. Add method to `EmailService` interface
2. Implement in `EmailServiceImpl`
3. Call from your service layer

## 🚀 Production Considerations

Before deploying to production:

1. **Remove console logging** in `AuthServiceImpl.java` (lines with `System.out.println`)
2. **Use environment variables** for email credentials (not hardcoded)
3. **Consider using a professional email service** (SendGrid, AWS SES, Mailgun)
4. **Add rate limiting** to prevent spam
5. **Monitor email delivery** and track bounces

## 📊 Current Email Flow

**Signup Flow:**
```
User registers → Account created → Welcome email sent → User receives email
```

**Password Reset Flow:**
```
User requests reset → Token generated → Reset email sent → 
User clicks link → Enters new password → Password updated
```

## 💡 Tips

- Test with real email addresses initially
- Check spam folder if you don't receive emails
- Gmail may limit sending rate (around 500/day for free accounts)
- For production, consider professional email services with better deliverability
- Keep the console logging temporarily until you verify emails work

## 🆘 Need Help?

If you encounter issues:
1. Check application logs for detailed error messages
2. Verify your Gmail account settings
3. Try generating a new App Password
4. Test with a different email provider if Gmail doesn't work

