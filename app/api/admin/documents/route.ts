import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const type = searchParams.get("type") // "applicant" or "member"

    if (userId) {
      // Get documents for specific user
      if (type === "applicant") {
        const application = await prisma.membershipApplication.findUnique({
          where: { userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            idDocument: true,
            proofOfAddress: true,
            additionalDocuments: true,
            createdAt: true,
            status: true
          }
        })

        if (!application) {
          return NextResponse.json(
            { error: "Application not found" },
            { status: 404 }
          )
        }

        return NextResponse.json({ application })
      } else {
        // Get member documents
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                idDocument: true,
                proofOfAddress: true,
                additionalDocuments: true
              }
            }
          }
        })

        if (!user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          )
        }

        return NextResponse.json({ user })
      }
    } else {
      // Get all applications with document status
      const applications = await prisma.membershipApplication.findMany({
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          idDocument: true,
          proofOfAddress: true,
          additionalDocuments: true,
          createdAt: true,
          status: true
        },
        orderBy: { createdAt: "desc" }
      })

             // Also get existing members with their profile documents
       console.log("Fetching members with documents...")
       
       // First, let's see all users and their roles
       const allUsers = await prisma.user.findMany({
         select: {
           id: true,
           name: true,
           email: true,
           role: true,
           profile: {
             select: {
               firstName: true,
               lastName: true,
               idDocument: true,
               proofOfAddress: true,
               additionalDocuments: true
             }
           }
         }
       })
       
       console.log("All users and their roles:", allUsers.map(u => ({ name: u.name, email: u.email, role: u.role })))
       
       const members = await prisma.user.findMany({
         where: {
           OR: [
             { role: "MEMBER" },
             { role: "GUEST" } // Also include GUEST users who might have documents
           ],
           profile: {
             OR: [
               { idDocument: { not: null } },
               { proofOfAddress: { not: null } },
               { additionalDocuments: { not: null } }
             ]
           }
         },
         select: {
           id: true,
           name: true,
           email: true,
           role: true,
           profile: {
             select: {
               firstName: true,
               lastName: true,
               idDocument: true,
               proofOfAddress: true,
               additionalDocuments: true
             }
           }
         }
       })
       
       console.log("Found members with documents:", members.length)
       members.forEach(member => {
         console.log(`Member ${member.name} (${member.email}):`, {
           idDocument: !!member.profile?.idDocument,
           proofOfAddress: !!member.profile?.proofOfAddress,
           additionalDocuments: !!member.profile?.additionalDocuments
         })
       })

      return NextResponse.json({ 
        applications,
        members 
      })
    }

  } catch (error) {
    console.error("Admin documents error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve documents" },
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

    const { userId, documentType, requestReason, dueDate, type } = await request.json()

    if (!userId || !documentType || !requestReason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create document request
    const documentRequest = await prisma.documentRequest.create({
      data: {
        userId,
        requestedBy: session.user.id,
        documentType,
        requestReason,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "PENDING",
        type: type || "MEMBER" // "APPLICANT" or "MEMBER"
      }
    })

    // Get user details for email
    let userDetails
    if (type === "APPLICANT") {
      userDetails = await prisma.membershipApplication.findUnique({
        where: { userId },
        select: { firstName: true, lastName: true, email: true }
      })
    } else {
      userDetails = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true }
      })
    }

    if (userDetails) {
      // Try to send document request email, but don't fail if email fails
      try {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
              <h1>📋 Document Request</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Hello ${type === "APPLICANT" ? (userDetails as any).firstName : (userDetails as any).name || 'there'},</h2>
              
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <h3 style="color: #dc3545; margin-top: 0;">Document Request Details</h3>
                <p><strong>Request ID:</strong> ${documentRequest.id}</p>
                <p><strong>Document Type:</strong> ${documentType}</p>
                <p><strong>Reason:</strong> ${requestReason}</p>
                ${dueDate ? `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>` : ""}
                <p><strong>Status:</strong> Pending</p>
              </div>
              
              <h3>Action Required</h3>
              <p>Please upload the requested document(s) as soon as possible. You can do this by:</p>
              <ol>
                <li>Logging into your account</li>
                <li>Going to the Documents section</li>
                <li>Uploading the required ${documentType}</li>
                <li>Marking the request as completed</li>
              </ol>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #856404;">⚠️ Important Notes</h4>
                <ul>
                  <li>Documents should be clear and legible</li>
                  <li>Accepted formats: PDF, JPG, PNG</li>
                  <li>Maximum file size: 5MB per document</li>
                  ${dueDate ? `<li>Please submit by: ${new Date(dueDate).toLocaleDateString()}</li>` : ""}
                </ul>
              </div>
              
              <p>If you have any questions about this request, please contact us at <a href="mailto:support@davel.library.com">support@davel.library.com</a> or call us at +27 11 123 4567.</p>
              
              <p>Best regards,<br>The Davel Library Team</p>
            </div>
            
            <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>© 2024 Davel Library. All rights reserved.</p>
            </div>
          </div>
        `

        const mailOptions = {
          from: process.env.EMAIL_FROM || "noreply@davel.library.com",
          to: userDetails.email,
          subject: `Document Request - ${documentType}`,
          html: emailContent,
        }

        await transporter.sendMail(mailOptions)
        console.log(`Document request email sent successfully to ${userDetails.email}`)
      } catch (emailError) {
        console.warn(`Email notification failed for document request ${documentRequest.id}:`, (emailError as Error).message)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Document request created successfully",
      request: documentRequest
    })

  } catch (error) {
    console.error("Document request error:", error)
    return NextResponse.json(
      { error: "Failed to create document request" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const { requestId, status, adminNotes } = await request.json()

    if (!requestId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Update document request status
    const updatedRequest = await prisma.documentRequest.update({
      where: { id: requestId },
      data: {
        status,
        adminNotes: adminNotes || null,
        reviewedAt: new Date(),
        reviewedBy: session.user.id
      },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    })

    // Send status update email if status changed
    if (status !== "PENDING" && updatedRequest.user) {
      try {
        const statusEmailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: ${status === 'COMPLETED' ? '#28a745' : '#ffc107'}; color: white; padding: 20px; text-align: center;">
              <h1>${status === 'COMPLETED' ? '✅ Document Request Completed' : '⏳ Document Request Under Review'}</h1>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <h2>Hello ${updatedRequest.user.name},</h2>
              
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${status === 'COMPLETED' ? '#28a745' : '#ffc107'};">
                <h3 style="color: ${status === 'COMPLETED' ? '#28a745' : '#ffc107'}; margin-top: 0;">Document Request Update</h3>
                <p><strong>Request ID:</strong> ${updatedRequest.id}</p>
                <p><strong>Document Type:</strong> ${updatedRequest.documentType}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Date Updated:</strong> ${new Date().toLocaleDateString()}</p>
                ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ""}
              </div>
              
              ${status === 'COMPLETED' ? `
                <h3>🎉 Document Request Completed!</h3>
                <p>Thank you for submitting the requested document. Our team will review it and update your records accordingly.</p>
              ` : `
                <h3>Document Under Review</h3>
                <p>Your submitted document is currently being reviewed by our team. We will notify you once the review is complete.</p>
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
          from: process.env.EMAIL_FROM || "noreply@davel.library.com",
          to: updatedRequest.user.email,
          subject: `Document Request ${status} - ${updatedRequest.documentType}`,
          html: statusEmailContent,
        }

        await transporter.sendMail(mailOptions)
        console.log(`Status update email sent successfully to ${updatedRequest.user.email}`)
      } catch (emailError) {
        console.warn(`Status update email failed for document request ${updatedRequest.id}:`, (emailError as Error).message)
        // Don't fail the status update if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Document request updated successfully",
      request: updatedRequest
    })

  } catch (error) {
    console.error("Document request update error:", error)
    return NextResponse.json(
      { error: "Failed to update document request" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("requestId")

    if (!requestId) {
      return NextResponse.json(
        { error: "Document request ID is required" },
        { status: 400 }
      )
    }

    // Get the document request to check if it's cancelled
    const documentRequest = await prisma.documentRequest.findUnique({
      where: { id: requestId }
    })

    if (!documentRequest) {
      return NextResponse.json(
        { error: "Document request not found" },
        { status: 404 }
      )
    }

    // Only allow deletion of cancelled documents
    if (documentRequest.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Only cancelled documents can be deleted" },
        { status: 400 }
      )
    }

    // Delete the cancelled document request
    await prisma.documentRequest.delete({
      where: { id: requestId }
    })

    return NextResponse.json({
      success: true,
      message: "Cancelled document request deleted successfully"
    })

  } catch (error) {
    console.error("Document deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete document request" },
      { status: 500 }
    )
  }
}
