import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const { testType, recipientEmail } = await request.json()

    if (!recipientEmail) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      )
    }

    let emailSent = false
    let emailContent = ""

    switch (testType) {
      case "basic":
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background-color: #8B4513; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Davel Library</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #8B4513; margin-top: 0; text-align: center;">Email System Test</h2>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                Hello! This is a test email from the Davel Library email system.
              </p>
              
              <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="color: #28a745; margin-top: 0;">✅ Email System Status</h3>
                <p style="color: #333; margin: 10px 0 0 0;">The email system is working correctly!</p>
              </div>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">
                If you received this email, it means the admin email system is properly configured and functional.
              </p>
              
              <p style="color: #333; font-size: 16px; line-height: 1.6;">Best regards,<br>
              <strong>The Davel Library Team</strong></p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© 2024 Davel Library. All rights reserved.</p>
              <p>This is a test email. Please do not reply to this message.</p>
            </div>
          </div>
        `
        emailSent = await emailService.sendEmail({
          to: recipientEmail,
          subject: "Davel Library - Email System Test",
          html: emailContent
        })
        break

      case "approval":
        emailSent = await emailService.sendApprovalEmail({
          email: recipientEmail,
          firstName: "Test",
          lastName: "User",
          notes: "This is a test approval email",
          temporaryPassword: "test123"
        })
        break

      case "rejection":
        emailSent = await emailService.sendRejectionEmail({
          email: recipientEmail,
          firstName: "Test",
          lastName: "User",
          notes: "This is a test rejection email"
        })
        break

      case "under_review":
        emailSent = await emailService.sendUnderReviewEmail({
          email: recipientEmail,
          firstName: "Test",
          lastName: "User",
          notes: "This is a test under review email"
        })
        break

      default:
        return NextResponse.json(
          { error: "Invalid test type. Use: basic, approval, rejection, or under_review" },
          { status: 400 }
        )
    }

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: `${testType} test email sent successfully to ${recipientEmail}`,
        testType,
        recipientEmail
      })
    } else {
      return NextResponse.json({
        success: false,
        error: "Failed to send test email. Check email configuration.",
        testType,
        recipientEmail
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Email test error:", error)
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    // Check email configuration
    const emailConfig = {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD ? "***configured***" : undefined,
      from: process.env.EMAIL_FROM
    }

    const missingConfig = []
    if (!emailConfig.host) missingConfig.push('EMAIL_SERVER_HOST')
    if (!emailConfig.port) missingConfig.push('EMAIL_SERVER_PORT')
    if (!emailConfig.user) missingConfig.push('EMAIL_SERVER_USER')
    if (!emailConfig.pass) missingConfig.push('EMAIL_SERVER_PASSWORD')
    if (!emailConfig.from) missingConfig.push('EMAIL_FROM')

    return NextResponse.json({
      configured: missingConfig.length === 0,
      missingConfig,
      config: emailConfig,
      availableTestTypes: [
        { value: "basic", label: "Basic Test Email" },
        { value: "approval", label: "Approval Email" },
        { value: "rejection", label: "Rejection Email" },
        { value: "under_review", label: "Under Review Email" }
      ]
    })

  } catch (error) {
    console.error("Email config check error:", error)
    return NextResponse.json(
      { error: "Failed to check email configuration" },
      { status: 500 }
    )
  }
}
