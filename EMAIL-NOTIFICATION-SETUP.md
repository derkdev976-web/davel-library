# Email Notification Setup Guide

## Overview
The Davel Library system now includes automatic email notifications for membership application status changes. When an admin approves, rejects, or marks an application as "Under Review", the applicant will receive an email notification.

## Email Notifications Implemented

### 1. Approval Email
- **Trigger**: When application status changes to "APPROVED"
- **Content**: Welcome message, member benefits, next steps, login instructions
- **Template**: Professional welcome email with library branding

### 2. Rejection Email
- **Trigger**: When application status changes to "REJECTED"
- **Content**: Polite rejection notice, review notes (if provided), encouragement to reapply
- **Template**: Professional rejection email with contact information

### 3. Under Review Email
- **Trigger**: When application status changes to "UNDER_REVIEW"
- **Content**: Status update, explanation of review process, timeline expectations
- **Template**: Informative status update email

## Email Configuration Setup

### Step 1: Update Environment Variables
Edit your `.env.local` file and replace the placeholder values with your actual email server details:

```env
# Email Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-actual-email@gmail.com
EMAIL_SERVER_PASSWORD=your-actual-app-password
EMAIL_FROM=noreply@davellibrary.com
```

### Step 2: Gmail Setup (Recommended)
If using Gmail, follow these steps:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_SERVER_PASSWORD`

### Step 3: Alternative Email Providers
You can use other email providers by updating the configuration:

**Outlook/Hotmail:**
```env
EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
```

**Yahoo:**
```env
EMAIL_SERVER_HOST=smtp.mail.yahoo.com
EMAIL_SERVER_PORT=587
```

**Custom SMTP Server:**
```env
EMAIL_SERVER_HOST=your-smtp-server.com
EMAIL_SERVER_PORT=587
```

## Testing Email Functionality

### Method 1: Admin Dashboard Testing
1. Log in as an admin user
2. Go to the Applications tab
3. Select an application
4. Change the status to "Under Review", "Approved", or "Rejected"
5. Add review notes (optional)
6. Save the changes
7. Check the applicant's email for the notification

### Method 2: API Testing
You can test the email functionality directly via API:

```bash
# Test approval email
curl -X PATCH http://localhost:3000/api/admin/applications/[APPLICATION_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "reviewNotes": "Welcome to our library!"
  }'

# Test rejection email
curl -X PATCH http://localhost:3000/api/admin/applications/[APPLICATION_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REJECTED",
    "reviewNotes": "Please provide additional documentation."
  }'

# Test under review email
curl -X PATCH http://localhost:3000/api/admin/applications/[APPLICATION_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "status": "UNDER_REVIEW",
    "reviewNotes": "We are reviewing your application."
  }'
```

## Email Templates

### Approval Email Template
- **Subject**: "Welcome to Davel Library - Membership Approved!"
- **Features**:
  - Welcome message with applicant's name
  - List of member benefits
  - Next steps instructions
  - Member portal link
  - Contact information

### Rejection Email Template
- **Subject**: "Membership Application Update - Davel Library"
- **Features**:
  - Polite rejection notice
  - Review notes (if provided)
  - Encouragement to reapply
  - Contact information for questions

### Under Review Email Template
- **Subject**: "Membership Application Update - Under Review"
- **Features**:
  - Status update explanation
  - Review process details
  - Timeline expectations
  - Contact information

## Troubleshooting

### Common Issues

1. **"Email service not configured" warning**
   - Check that all email environment variables are set
   - Verify email server credentials are correct

2. **"Authentication failed" error**
   - For Gmail: Ensure 2FA is enabled and app password is used
   - Check email server host and port settings

3. **Emails not being sent**
   - Check server logs for error messages
   - Verify email server allows SMTP connections
   - Test with a simple email client first

### Debug Mode
To enable email debugging, add this to your `.env.local`:

```env
EMAIL_DEBUG=true
```

This will log detailed email sending information to the console.

## Security Considerations

1. **Environment Variables**: Never commit email credentials to version control
2. **App Passwords**: Use app-specific passwords instead of main account passwords
3. **Rate Limiting**: Email service includes basic rate limiting to prevent abuse
4. **Error Handling**: Email failures don't prevent application status updates

## Customization

### Modifying Email Templates
Email templates are located in `lib/email-service.ts`. You can customize:

- Email subject lines
- HTML content and styling
- Contact information
- Library branding colors
- Member benefits list

### Adding New Email Types
To add new email notification types:

1. Add a new method to the `EmailService` class
2. Update the API route to call the new method
3. Add the corresponding UI option in the admin dashboard

## Production Deployment

### Environment Variables
Ensure all email environment variables are set in your production environment:

```env
EMAIL_SERVER_HOST=your-production-smtp-server
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-production-email
EMAIL_SERVER_PASSWORD=your-production-password
EMAIL_FROM=noreply@yourdomain.com
```

### Email Service Provider
For production, consider using dedicated email services:

- **SendGrid**: Reliable email delivery service
- **Mailgun**: Developer-friendly email API
- **Amazon SES**: Cost-effective for high volume
- **Postmark**: Transactional email specialist

### Monitoring
Set up monitoring for email delivery:

- Track email send success/failure rates
- Monitor bounce rates
- Set up alerts for email service issues
- Log email sending activities

## Support

If you encounter issues with email setup:

1. Check the troubleshooting section above
2. Verify your email server configuration
3. Test with a simple email client
4. Check server logs for detailed error messages
5. Contact your email service provider for support

---

**Note**: Email notifications are sent asynchronously and failures don't prevent application status updates. Check server logs for email sending status.
