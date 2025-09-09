import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import nodemailer from "nodemailer"

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER || "",
    pass: process.env.EMAIL_SERVER_PASSWORD || "",
  },
})

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists and has approved application
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { membershipApplication: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "MEMBER") {
      return NextResponse.json({ error: "Only members can verify emails" }, { status: 403 })
    }

    if (!user.membershipApplication || user.membershipApplication.status !== "APPROVED") {
      return NextResponse.json({ error: "Membership application not approved" }, { status: 403 })
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID()
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store verification token
    await prisma.emailVerification.create({
      data: {
        email: email.toLowerCase(),
        token: verificationToken,
        expiresAt: tokenExpiry,
        type: "MEMBER_VERIFICATION"
      }
    })

    // Send verification email
    const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@davellibrary.com",
      to: email,
      subject: "Welcome to Davel Library - Verify Your Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #8B4513; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Davel Library</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #8B4513; margin-top: 0; text-align: center;">Welcome to Davel Library!</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Congratulations! Your membership application has been approved. 
              To complete your account setup, please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #8B4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                Verify Email & Set Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #8B4513; font-size: 14px; word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
              ${verificationUrl}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px; margin: 0;">
                This verification link will expire in 24 hours. If you didn't request this email, please contact our support team.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© 2024 Davel Library. All rights reserved.</p>
          </div>
        </div>
      `
    }

    try {
      await transporter.sendMail(mailOptions)
      console.log(`Verification email sent successfully to ${email}`)
    } catch (emailError) {
      console.warn(`Verification email failed:`, (emailError as Error).message)
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: "Verification email sent successfully",
      email: email
    })

  } catch (error) {
    console.error("Error sending verification email:", error)
    return NextResponse.json({ 
      error: "Failed to send verification email" 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { token, email, password } = await request.json()

    if (!token || !email || !password) {
      return NextResponse.json({ 
        error: "Token, email, and password are required" 
      }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ 
        error: "Password must be at least 8 characters long" 
      }, { status: 400 })
    }

    // Find and validate verification token
    const verification = await prisma.emailVerification.findFirst({
      where: {
        email: email.toLowerCase(),
        token: token,
        type: "MEMBER_VERIFICATION",
        expiresAt: { gt: new Date() }
      }
    })

    if (!verification) {
      return NextResponse.json({ 
        error: "Invalid or expired verification token" 
      }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user with verified email and password
    const updatedUser = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        emailVerified: new Date(),
        password: hashedPassword,
        isActive: true
      }
    })

    // Delete the used verification token
    await prisma.emailVerification.delete({
      where: { id: verification.id }
    })

    return NextResponse.json({ 
      message: "Email verified and password set successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    })

  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json({ 
      error: "Failed to verify email" 
    }, { status: 500 })
  }
}
