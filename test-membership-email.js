const nodemailer = require('nodemailer');

// Test email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
});

// Test membership application email
async function testMembershipEmail() {
  try {
    const testData = {
      firstName: "John",
      lastName: "Doe",
      email: "test@example.com",
      phone: "+27123456789",
      street: "123 Test Street",
      city: "Johannesburg",
      state: "Gauteng",
      zipCode: "2000",
      country: "South Africa",
      preferredGenres: ["Fiction", "Mystery"],
      readingFrequency: "weekly",
      applicationFee: 80
    };

    const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8B4513; color: white; padding: 20px; text-align: center;">
          <h1>🎉 Membership Application Received!</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Hello ${testData.firstName} ${testData.lastName},</h2>
          
          <p>Thank you for applying for membership at Davel Library! We have received your application and it is currently under review.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B4513;">
            <h3 style="color: #8B4513; margin-top: 0;">Application Details</h3>
            <p><strong>Application ID:</strong> ${applicationId}</p>
            <p><strong>Application Fee:</strong> R${testData.applicationFee}</p>
            <p><strong>Date Submitted:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <h3>What Happens Next?</h3>
          <ol>
            <li>Our team will review your application within 2-3 business days</li>
            <li>We will verify your documents and information</li>
            <li>You will receive an email with the final decision</li>
            <li>If approved, you'll receive your library card details</li>
          </ol>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">📋 Application Summary</h4>
            <p><strong>Name:</strong> ${testData.firstName} ${testData.lastName}</p>
            <p><strong>Email:</strong> ${testData.email}</p>
            <p><strong>Phone:</strong> ${testData.phone}</p>
            <p><strong>Address:</strong> ${testData.street}, ${testData.city}, ${testData.state} ${testData.zipCode}, ${testData.country}</p>
            <p><strong>Preferred Genres:</strong> ${testData.preferredGenres.join(", ")}</p>
            <p><strong>Reading Frequency:</strong> ${testData.readingFrequency}</p>
          </div>
          
          <p>If you have any questions about your application, please contact us at <a href="mailto:support@davel.library.com">support@davel.library.com</a> or call us at +27 11 123 4567.</p>
          
          <p>Best regards,<br>The Davel Library Team</p>
        </div>
        
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 Davel Library. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@davel.library.com",
      to: testData.email,
      subject: `Test: Membership Application Received - ${applicationId}`,
      html: emailContent,
    };

    console.log('Sending test email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Error sending test email:', error);
  }
}

// Test status update email
async function testStatusEmail() {
  try {
    const testData = {
      firstName: "John",
      lastName: "Doe",
      email: "test@example.com",
      status: "APPROVED",
      applicationId: "APP-TEST-123"
    };

    const statusEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
          <h1>🎉 Application Approved!</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Hello ${testData.firstName} ${testData.lastName},</h2>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">Application Status Update</h3>
            <p><strong>Status:</strong> ${testData.status}</p>
            <p><strong>Application ID:</strong> ${testData.applicationId}</p>
            <p><strong>Date Reviewed:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <h3>🎊 Congratulations! Your membership has been approved!</h3>
          <p>Welcome to Davel Library! Here's what happens next:</p>
          <ol>
            <li>Your library card will be mailed to your address within 5-7 business days</li>
            <li>You can start using our online services immediately</li>
            <li>Visit any of our branches to activate your physical card</li>
            <li>Start exploring our collection of books, digital resources, and events</li>
          </ol>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #155724;">📚 Your Library Benefits</h4>
            <ul>
              <li>Borrow up to 10 books at a time</li>
              <li>Access to digital resources and e-books</li>
              <li>Free access to online databases</li>
              <li>Participation in library events and workshops</li>
              <li>Inter-library loan services</li>
            </ul>
          </div>
          
          <p>If you have any questions, please contact us at <a href="mailto:support@davel.library.com">support@davel.library.com</a> or call us at +27 11 123 4567.</p>
          
          <p>Best regards,<br>The Davel Library Team</p>
        </div>
        
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 Davel Library. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@davel.library.com",
      to: testData.email,
      subject: `Test: Membership Application ${testData.status} - ${testData.applicationId}`,
      html: statusEmailContent,
    };

    console.log('Sending test status email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test status email sent successfully!');
    console.log('Message ID:', result.messageId);
    
  } catch (error) {
    console.error('❌ Error sending test status email:', error);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Membership Application Email System...\n');
  
  await testMembershipEmail();
  console.log('');
  await testStatusEmail();
  
  console.log('\n✨ All tests completed!');
}

// Check if running directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testMembershipEmail, testStatusEmail };
