import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get user's membership application
    const application = await prisma.membershipApplication.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: "No membership application found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      application: {
        id: application.id,
        status: application.status,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        createdAt: application.createdAt,
        reviewedAt: application.reviewedAt,
        reviewNotes: application.reviewNotes
      }
    })

  } catch (error) {
    console.error("Membership status error:", error)
    return NextResponse.json(
      { error: "Failed to get application status" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const { applicationId, status, reviewNotes } = await request.json()

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "Application ID and status are required" },
        { status: 400 }
      )
    }

    // Update application status
    const updatedApplication = await prisma.membershipApplication.update({
      where: { id: applicationId },
      data: {
        status: status,
        reviewNotes: reviewNotes || null,
        reviewedBy: session.user.id,
        reviewedAt: new Date()
      }
    })

    // Send status update email to applicant
    const statusEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${status === 'APPROVED' ? '#28a745' : status === 'REJECTED' ? '#dc3545' : '#ffc107'}; color: white; padding: 20px; text-align: center;">
          <h1>${status === 'APPROVED' ? '🎉 Application Approved!' : status === 'REJECTED' ? '❌ Application Update' : '⏳ Application Under Review'}</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Hello ${updatedApplication.firstName} ${updatedApplication.lastName},</h2>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${status === 'APPROVED' ? '#28a745' : status === 'REJECTED' ? '#dc3545' : '#ffc107'};">
            <h3 style="color: ${status === 'APPROVED' ? '#28a745' : status === 'REJECTED' ? '#dc3545' : '#ffc107'}; margin-top: 0;">Application Status Update</h3>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Application ID:</strong> ${updatedApplication.id}</p>
            <p><strong>Date Reviewed:</strong> ${new Date().toLocaleDateString()}</p>
            ${reviewNotes ? `<p><strong>Review Notes:</strong> ${reviewNotes}</p>` : ''}
          </div>
          
          ${status === 'APPROVED' ? `
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
          ` : status === 'REJECTED' ? `
            <h3>Application Review Complete</h3>
            <p>We have completed the review of your membership application. Unfortunately, we are unable to approve your application at this time.</p>
            
            ${reviewNotes ? `
              <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #721c24;">Review Details</h4>
                <p>${reviewNotes}</p>
              </div>
            ` : ''}
            
            <p>If you believe this decision was made in error, or if you would like to provide additional information, please contact us at <a href="mailto:support@davel.library.com">support@davel.library.com</a>.</p>
          ` : `
            <h3>Application Under Review</h3>
            <p>Your application is currently being reviewed by our team. We appreciate your patience during this process.</p>
            
            ${reviewNotes ? `
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #856404;">Additional Information Requested</h4>
                <p>${reviewNotes}</p>
              </div>
            ` : ''}
            
            <p>We will notify you as soon as the review is complete. If you have any questions, please don't hesitate to contact us.</p>
          `}
          
          <p>If you have any questions, please contact us at <a href="mailto:support@davel.library.com">support@davel.library.com</a> or call us at +27 11 123 4567.</p>
          
          <p>Best regards,<br>The Davel Library Team</p>
        </div>
        
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 Davel Library. All rights reserved.</p>
        </div>
      </div>
    `

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@davel.library.com",
      to: updatedApplication.email,
      subject: `Membership Application ${status} - ${updatedApplication.id}`,
      html: statusEmailContent,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
      application: updatedApplication
    })

  } catch (error) {
    console.error("Membership status update error:", error)
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    )
  }
}
