import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailContent {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const emailConfig: EmailConfig = {
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER || '',
        pass: process.env.EMAIL_SERVER_PASSWORD || '',
      },
    }

    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig)
    }
  }

  async sendEmail(content: EmailContent): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured. Skipping email send.')
      return false
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@davellibrary.com',
        to: content.to,
        subject: content.subject,
        html: content.html,
        text: content.text || this.stripHtml(content.html),
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log(`Email sent successfully to ${content.to}`, result.messageId)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      
      // Provide more detailed error information
      if (error instanceof Error) {
        if (error.message.includes('authentication')) {
          console.error('Authentication failed. Check your email credentials.')
        } else if (error.message.includes('connection')) {
          console.error('Connection failed. Check your SMTP server settings.')
        } else if (error.message.includes('timeout')) {
          console.error('Connection timeout. Check your network and SMTP server.')
        }
      }
      
      return false
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '')
  }

  async sendRejectionEmail(application: {
    email: string
    firstName: string
    lastName: string
    notes?: string
  }): Promise<boolean> {
    const subject = 'Membership Application Update - Davel Library'
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #8B4513; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Davel Library</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background-color: #dc3545; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">!</span>
            </div>
            <h2 style="color: #dc3545; margin: 0; font-size: 20px;">Application Status Update</h2>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear ${application.firstName} ${application.lastName},</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Thank you for your interest in becoming a member of Davel Library. After careful review of your application, we regret to inform you that we are unable to approve your membership at this time.</p>
          
          ${application.notes ? `
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <strong style="color: #dc3545;">Review Notes:</strong><br>
            <p style="color: #333; margin: 10px 0 0 0;">${application.notes}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">What You Can Do:</h3>
            <ul style="margin: 10px 0; padding-left: 20px; color: #333;">
              <li>Review the information provided in your application</li>
              <li>Ensure all required documentation is complete and accurate</li>
              <li>Consider applying again after addressing any concerns</li>
            </ul>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">If you have any questions about this decision or would like to discuss your application further, please don't hesitate to contact us.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #8B4513; margin-top: 0;">Contact Information:</h3>
            <p style="color: #333; margin: 5px 0;">📧 Email: info@davellibrary.com</p>
            <p style="color: #333; margin: 5px 0;">📞 Phone: +1 (555) 123-4567</p>
            <p style="color: #333; margin: 5px 0;">📍 Address: 123 Library Street, City, State 12345</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Thank you for your understanding.</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Best regards,<br>
          <strong>The Davel Library Team</strong></p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 Davel Library. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: application.email,
      subject,
      html,
    })
  }

  async sendApprovalEmail(application: {
    email: string
    firstName: string
    lastName: string
    notes?: string
    temporaryPassword?: string
  }): Promise<boolean> {
    const subject = 'Welcome to Davel Library - Membership Approved!'
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #8B4513; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Davel Library</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background-color: #28a745; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">✓</span>
            </div>
            <h2 style="color: #28a745; margin: 0; font-size: 20px;">Welcome to Davel Library!</h2>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear ${application.firstName} ${application.lastName},</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Congratulations! We are pleased to inform you that your membership application has been approved. Welcome to the Davel Library community!</p>
          
          ${application.notes ? `
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <strong style="color: #28a745;">Welcome Notes:</strong><br>
            <p style="color: #333; margin: 10px 0 0 0;">${application.notes}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">Your Member Benefits:</h3>
            <ul style="margin: 10px 0; padding-left: 20px; color: #333;">
              <li>📚 Access to our extensive book collection</li>
              <li>💻 Digital book downloads</li>
              <li>📖 Reservation services</li>
              <li>🎉 Library events and workshops</li>
              <li>💬 Online chat support</li>
            </ul>
          </div>
          
          ${application.temporaryPassword ? `
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
            <h3 style="color: #0c5460; margin-top: 0;">🔐 Your Login Credentials:</h3>
            <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 10px 0;">
              <p style="margin: 5px 0; color: #333;"><strong>Email:</strong> ${application.email}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Temporary Password:</strong> <code style="background-color: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 14px;">${application.temporaryPassword}</code></p>
            </div>
            <div style="background-color: #fff3cd; padding: 10px; border-radius: 4px; margin: 10px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;"><strong>⚠️ Important:</strong> Please change your password after your first login for security reasons.</p>
            </div>
          </div>
          ` : ''}
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Next Steps:</h3>
            <ol style="margin: 10px 0; padding-left: 20px; color: #333;">
              <li>Use your login credentials above to access your member portal</li>
              <li>Change your temporary password to something secure</li>
              <li>Explore our book collection and make your first reservation</li>
              <li>Check out upcoming events and workshops</li>
              <li>Download our mobile app for easy access</li>
            </ol>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #8B4513; margin-top: 0;">Member Portal:</h3>
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/member" 
               style="background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-top: 10px;">
              Access Your Member Dashboard
            </a>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">If you have any questions or need assistance, please don't hesitate to contact us.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #8B4513; margin-top: 0;">Contact Information:</h3>
            <p style="color: #333; margin: 5px 0;">📧 Email: info@davellibrary.com</p>
            <p style="color: #333; margin: 5px 0;">📞 Phone: +1 (555) 123-4567</p>
            <p style="color: #333; margin: 5px 0;">📍 Address: 123 Library Street, City, State 12345</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Welcome to the Davel Library family!</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Best regards,<br>
          <strong>The Davel Library Team</strong></p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 Davel Library. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: application.email,
      subject,
      html,
    })
  }

  async sendUnderReviewEmail(application: {
    email: string
    firstName: string
    lastName: string
    notes?: string
  }): Promise<boolean> {
    const subject = 'Membership Application Update - Under Review'
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #8B4513; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Davel Library</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background-color: #ffc107; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">⏳</span>
            </div>
            <h2 style="color: #ffc107; margin: 0; font-size: 20px;">Application Status Update</h2>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear ${application.firstName} ${application.lastName},</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Thank you for your interest in becoming a member of Davel Library. We wanted to inform you that your membership application is currently under review by our team.</p>
          
          ${application.notes ? `
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <strong style="color: #ffc107;">Review Notes:</strong><br>
            <p style="color: #333; margin: 10px 0 0 0;">${application.notes}</p>
          </div>
          ` : ''}
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">What This Means:</h3>
            <ul style="margin: 10px 0; padding-left: 20px; color: #333;">
              <li>🔍 Our team is carefully reviewing your application</li>
              <li>📋 We may need additional information or clarification</li>
              <li>⏰ This process typically takes 3-5 business days</li>
              <li>📧 You will receive another email once the review is complete</li>
            </ul>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Please note that this is a normal part of our application process, and we appreciate your patience during this time.</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">If you have any questions or need to provide additional information, please don't hesitate to contact us.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #8B4513; margin-top: 0;">Contact Information:</h3>
            <p style="color: #333; margin: 5px 0;">📧 Email: info@davellibrary.com</p>
            <p style="color: #333; margin: 5px 0;">📞 Phone: +1 (555) 123-4567</p>
            <p style="color: #333; margin: 5px 0;">📍 Address: 123 Library Street, City, State 12345</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Thank you for your patience and understanding.</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Best regards,<br>
          <strong>The Davel Library Team</strong></p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 Davel Library. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: application.email,
      subject,
      html,
    })
  }

  async sendBroadcastEmail(data: {
    to: string
    name: string
    subject: string
    message: string
    senderName: string
  }): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #8B4513; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Davel Library</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 60px; height: 60px; background-color: #8B4513; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">📢</span>
            </div>
            <h2 style="color: #8B4513; margin: 0; font-size: 20px;">Important Message from Davel Library</h2>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Dear ${data.name},</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B4513;">
            <h3 style="color: #8B4513; margin-top: 0;">${data.subject}</h3>
            <div style="color: #333; line-height: 1.6; white-space: pre-wrap;">${data.message}</div>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">Stay Connected</h3>
            <p style="color: #333; margin: 10px 0;">Visit our website to stay updated with the latest library news, events, and resources.</p>
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" 
               style="background-color: #8B4513; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-top: 10px;">
              Visit Davel Library
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #8B4513; margin-top: 0;">Contact Information:</h3>
            <p style="color: #333; margin: 5px 0;">📧 Email: info@davellibrary.com</p>
            <p style="color: #333; margin: 5px 0;">📞 Phone: +1 (555) 123-4567</p>
            <p style="color: #333; margin: 5px 0;">📍 Address: 123 Library Street, City, State 12345</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Thank you for being part of the Davel Library community!</p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">Best regards,<br>
          <strong>${data.senderName}</strong><br>
          <em>Davel Library Team</em></p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 Davel Library. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `

    return this.sendEmail({
      to: data.to,
      subject: data.subject,
      html,
    })
  }
}

export const emailService = new EmailService()
