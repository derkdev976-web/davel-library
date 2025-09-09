// Test script for email functionality
// Run with: node test-email.js

const nodemailer = require('nodemailer');

// Email configuration (same as in lib/email-service.ts)
const emailConfig = {
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER || '',
    pass: process.env.EMAIL_SERVER_PASSWORD || '',
  },
};

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('Host:', emailConfig.host);
  console.log('Port:', emailConfig.port);
  console.log('User:', emailConfig.auth.user);
  console.log('Password configured:', !!emailConfig.auth.pass);

  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    console.error('❌ Email configuration incomplete. Please set EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD in .env.local');
    return;
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport(emailConfig);
    
    // Verify connection
    console.log('Verifying email server connection...');
    await transporter.verify();
    console.log('✅ Email server connection successful!');

    // Send test email
    console.log('Sending test email...');
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@davellibrary.com',
      to: emailConfig.auth.user, // Send to self for testing
      subject: 'Davel Library - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #8B4513; margin: 0; text-align: center;">Davel Library</h1>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745;">
            <h2 style="color: #28a745; margin-top: 0;">Email Test Successful!</h2>
            
            <p>This is a test email to verify that the Davel Library email notification system is working correctly.</p>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">Email Features Tested:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>✅ SMTP connection</li>
                <li>✅ Email sending</li>
                <li>✅ HTML formatting</li>
                <li>✅ Library branding</li>
              </ul>
            </div>
            
            <p>If you received this email, the email notification system is ready to send:</p>
            <ul style="margin: 15px 0; padding-left: 20px;">
              <li>Approval emails</li>
              <li>Rejection emails</li>
              <li>Under review emails</li>
            </ul>
            
            <p>Best regards,<br>
            <strong>The Davel Library Team</strong></p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
            <p>This is a test email. Please do not reply.</p>
          </div>
        </div>
      `,
      text: 'Davel Library Email Test - If you received this, the email system is working correctly!'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Check your email inbox for the test message.');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check:');
      console.error('- Email username and password are correct');
      console.error('- For Gmail: 2FA is enabled and app password is used');
      console.error('- Email server host and port are correct');
    } else if (error.code === 'ECONNECTION') {
      console.error('Connection failed. Please check:');
      console.error('- Email server host and port are correct');
      console.error('- Network connection is available');
      console.error('- Firewall is not blocking SMTP connections');
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the test
testEmail();
