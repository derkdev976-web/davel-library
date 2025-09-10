# Email Configuration Guide for Davel Library

## Overview
This guide will help you configure email functionality for the Davel Library application on Render.

## Required Environment Variables

Add these environment variables to your Render deployment:

### Gmail Configuration (Recommended)
```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@davellibrary.com
```

### Other SMTP Providers

#### Outlook/Hotmail
```
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@outlook.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=noreply@davellibrary.com
```

#### Yahoo Mail
```
EMAIL_SERVER_HOST=smtp.mail.yahoo.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yahoo.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@davellibrary.com
```

#### Custom SMTP Server
```
EMAIL_SERVER_HOST=your-smtp-server.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-username
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=noreply@davellibrary.com
```

## Gmail Setup Instructions

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password (not your regular Gmail password)

3. **Add Environment Variables to Render**:
   - Go to your Render dashboard
   - Select your web service
   - Go to Environment tab
   - Add the variables listed above

## Testing Email Configuration

1. **Access Admin Dashboard**:
   - Login as admin
   - Go to Admin Dashboard → Email Test tab

2. **Send Test Email**:
   - Enter a test email address
   - Click "Send Test Email"
   - Check the result

## Email Features

The application includes these email features:

- **Membership Application Emails**:
  - Approval emails
  - Rejection emails
  - Under review notifications

- **Broadcast Emails**:
  - Send messages to all members
  - Custom subject and content

- **Test Emails**:
  - Verify email configuration
  - Debug email issues

## Troubleshooting

### Common Issues

1. **"Email configuration incomplete"**
   - Check that all environment variables are set
   - Verify variable names are correct

2. **"Failed to send email"**
   - Check SMTP credentials
   - Verify app password (for Gmail)
   - Check firewall/network restrictions

3. **"Authentication failed"**
   - Verify username and password
   - For Gmail, ensure 2FA is enabled and app password is used

### Debug Steps

1. Check Render logs for email errors
2. Verify environment variables in Render dashboard
3. Test with a simple email client first
4. Check SMTP server status

## Security Notes

- Never commit email credentials to version control
- Use app passwords instead of regular passwords
- Consider using a dedicated email service for production
- Regularly rotate email credentials

## Support

If you continue to have issues:
1. Check the email test results in the admin dashboard
2. Review Render deployment logs
3. Verify your email provider's SMTP settings
4. Test with a different email provider
