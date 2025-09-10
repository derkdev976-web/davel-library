import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      )
    }

    // Check email configuration
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

    const isConfigured = missingConfig.length === 0

    return NextResponse.json({
      configured: isConfigured,
      missing: missingConfig,
      config: {
        host: emailConfig.host || 'Not set',
        port: emailConfig.port || 'Not set',
        user: emailConfig.user ? `${emailConfig.user.substring(0, 3)}***` : 'Not set',
        from: emailConfig.from || 'Not set',
        hasPassword: !!emailConfig.pass
      },
      setupGuide: {
        gmail: {
          host: 'smtp.gmail.com',
          port: '587',
          requirements: [
            'Enable 2-Factor Authentication',
            'Generate App Password',
            'Use App Password (not regular password)'
          ]
        },
        outlook: {
          host: 'smtp-mail.outlook.com',
          port: '587',
          requirements: [
            'Use your regular email and password',
            'Enable SMTP authentication'
          ]
        }
      }
    })

  } catch (error) {
    console.error("Email status check error:", error)
    return NextResponse.json(
      {
        error: "Failed to check email status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
