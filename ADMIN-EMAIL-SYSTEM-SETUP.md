# Admin Email System Setup Guide

## Overview
The Davel Library admin email system is now fully functional and standardized. This guide will help you configure and test the email system.

## ✅ What's Been Fixed

### 1. **Standardized Email Configuration**
- All email services now use consistent environment variables
- Fixed inconsistencies between `EMAIL_USER`/`EMAIL_PASS` and `EMAIL_SERVER_USER`/`EMAIL_SERVER_PASSWORD`
- Unified configuration across all email services

### 2. **Comprehensive Email Testing**
- New admin email testing API (`/api/admin/email/test`)
- Admin UI for testing email system
- Support for testing all email types (basic, approval, rejection, under review)

### 3. **Enhanced Email Service**
- Improved error handling and logging
- Better configuration validation
- Support for all email types used in the system

## 🔧 Environment Variables Required

Set these environment variables in your deployment (Render, Vercel, etc.):

```bash
# SMTP Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@davellibrary.com
```

## 📧 Email Provider Setup

### Gmail Setup (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_SERVER_PASSWORD`

### Outlook Setup
```bash
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@outlook.com
EMAIL_SERVER_PASSWORD=your-password
```

### Yahoo Setup
```bash
EMAIL_SERVER_HOST=smtp.mail.yahoo.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yahoo.com
EMAIL_SERVER_PASSWORD=your-app-password
```

## 🧪 Testing the Email System

### 1. **Admin Dashboard Testing**
1. Login as admin
2. Go to Admin Dashboard
3. Click on "Email Test" tab
4. Check configuration status
5. Send test emails

### 2. **API Testing**
```bash
# Check email configuration
GET /api/admin/email/test

# Send test email
POST /api/admin/email/test
{
  "testType": "basic",
  "recipientEmail": "test@example.com"
}
```

### 3. **Test Types Available**
- **Basic Test**: Simple test email
- **Approval Email**: Membership approval with login credentials
- **Rejection Email**: Membership rejection notification
- **Under Review**: Application under review notification

## 📨 Email Types Supported

The system now supports all these email types:

### ✅ Membership Application Emails
- Application confirmation emails
- Approval emails (with temporary login credentials)
- Rejection emails
- Under review notifications

### ✅ Document Management Emails
- Document request emails
- Document status updates
- Document completion notifications

### ✅ Authentication Emails
- NextAuth email verification
- Password reset emails
- Login notifications

### ✅ Admin Notifications
- New application notifications
- System alerts
- User activity notifications

## 🔍 Troubleshooting

### Common Issues

#### 1. **"Email service not configured"**
- Check that all environment variables are set
- Verify SMTP credentials are correct
- Test with the admin email test tool

#### 2. **"Authentication failed"**
- For Gmail: Use App Password, not regular password
- Enable 2-Factor Authentication first
- Check username format (full email address)

#### 3. **"Connection timeout"**
- Check firewall settings
- Verify SMTP host and port
- Try different SMTP providers

#### 4. **Emails not received**
- Check spam/junk folders
- Verify recipient email address
- Check email provider's sending limits

### Debug Steps
1. **Check Configuration**: Use admin email test tool
2. **Test Basic Email**: Send a simple test email
3. **Check Logs**: Look for error messages in deployment logs
4. **Verify Credentials**: Double-check SMTP settings

## 🚀 Production Deployment

### Render.com Setup
1. Go to your Render service dashboard
2. Navigate to Environment tab
3. Add all required environment variables
4. Redeploy the service

### Vercel Setup
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add all required environment variables
4. Redeploy the project

## 📊 Monitoring

### Email System Status
- Check admin dashboard "Email Test" tab for configuration status
- Monitor deployment logs for email errors
- Test email functionality regularly

### Performance Tips
- Use a dedicated email service (SendGrid, Mailgun) for high volume
- Implement email queuing for better reliability
- Monitor email delivery rates

## 🔐 Security Best Practices

1. **Use App Passwords**: Never use your main account password
2. **Environment Variables**: Keep credentials in environment variables, not code
3. **Regular Rotation**: Change email passwords periodically
4. **Monitor Access**: Check email account access logs regularly

## 📞 Support

If you encounter issues:
1. Check the admin email test tool first
2. Review deployment logs for errors
3. Verify environment variables are set correctly
4. Test with different email providers if needed

## 🎉 Success Indicators

Your email system is working correctly when:
- ✅ Admin email test tool shows "Configured" status
- ✅ Test emails are received successfully
- ✅ Membership application emails are sent automatically
- ✅ Document request emails work properly
- ✅ No email-related errors in deployment logs

The email system is now fully functional and ready for production use! 🚀
