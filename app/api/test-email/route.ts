import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    const { to, subject, message } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, message" },
        { status: 400 }
      )
    }

    // Test email configuration
    const emailConfig = {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
      from: process.env.EMAIL_FROM
    }

    const missingConfig = []
    if (!emailConfig.host) missingConfig.push('EMAIL_SERVER_HOST')
    if (!emailConfig.port) missingConfig.push('EMAIL_SERVER_PORT')
    if (!emailConfig.user) missingConfig.push('EMAIL_SERVER_USER')
    if (!emailConfig.pass) missingConfig.push('EMAIL_SERVER_PASSWORD')
    if (!emailConfig.from) missingConfig.push('EMAIL_FROM')

    if (missingConfig.length > 0) {
      return NextResponse.json({
        error: "Email configuration incomplete",
        missing: missingConfig,
        message: "Please configure the following environment variables in your Render deployment:",
        config: {
          EMAIL_SERVER_HOST: "smtp.gmail.com",
          EMAIL_SERVER_PORT: "587",
          EMAIL_SERVER_USER: "your-email@gmail.com",
          EMAIL_SERVER_PASSWORD: "your-app-password",
          EMAIL_FROM: "noreply@davellibrary.com"
        }
      }, { status: 400 })
    }

    // Send test email
    const success = await emailService.sendEmail({
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #8B4513; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">Davel Library - Email Test</h1>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h2>Test Email Configuration</h2>
            <p>This is a test email to verify that your email configuration is working correctly.</p>
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>Message:</strong><br>
              ${message}
            </div>
            <p><strong>Configuration Status:</strong> ✅ Working</p>
            <p><strong>Sent from:</strong> ${emailConfig.from}</p>
            <p><strong>SMTP Server:</strong> ${emailConfig.host}:${emailConfig.port}</p>
          </div>
        </div>
      `,
      text: `Davel Library Email Test\n\nMessage: ${message}\n\nConfiguration Status: Working\nSent from: ${emailConfig.from}\nSMTP Server: ${emailConfig.host}:${emailConfig.port}`
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully!",
        config: {
          host: emailConfig.host,
          port: emailConfig.port,
          from: emailConfig.from,
          user: emailConfig.user ? `${emailConfig.user.substring(0, 3)}***` : 'Not set'
        }
      })
    } else {
      return NextResponse.json({
        error: "Failed to send email",
        message: "Email service is configured but failed to send. Check your SMTP credentials."
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Email test error:", error)
    return NextResponse.json(
      { 
        error: "Email test failed", 
        details: error instanceof Error ? error.message : "Unknown error",
        message: "Check your email configuration and try again."
      },
      { status: 500 }
    )
  }
}
