import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import nodemailer from "nodemailer"
import { prisma } from "@/lib/prisma"

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
    // Get session to check if user is authenticated (optional for membership applications)
    const session = await getServerSession(authOptions)
    
    // Note: We allow unauthenticated users to submit membership applications
    // as they need to apply before they can be authenticated

    const formData = await request.json()
    console.log("Received form data:", formData)
    
    // Validate required fields
    const requiredFields = [
      "firstName", "lastName", "email", "phone", "street", 
      "city", "state", "zipCode", "country", "dateOfBirth", 
      "gender", "preferredGenres", "readingFrequency"
    ]
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Generate application ID
    const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Prepare email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8B4513; color: white; padding: 20px; text-align: center;">
          <h1>🎉 Membership Application Received!</h1>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2>Hello ${formData.firstName} ${formData.lastName},</h2>
          
          <p>Thank you for applying for membership at Davel Library! We have received your application and it is currently under review.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B4513;">
            <h3 style="color: #8B4513; margin-top: 0;">Application Details</h3>
            <p><strong>Application ID:</strong> ${applicationId}</p>
            <p><strong>Application Fee:</strong> R${formData.applicationFee}</p>
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
            <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone}</p>
            <p><strong>Address:</strong> ${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}</p>
            <p><strong>Preferred Genres:</strong> ${formData.preferredGenres?.join(", ") || "None selected"}</p>
            <p><strong>Reading Frequency:</strong> ${formData.readingFrequency}</p>
          </div>
          
          <p>If you have any questions about your application, please contact us at <a href="mailto:support@davel.library.com">support@davel.library.com</a> or call us at +27 11 123 4567.</p>
          
          <p>Best regards,<br>The Davel Library Team</p>
        </div>
        
        <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666;">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>© 2024 Davel Library. All rights reserved.</p>
        </div>
      </div>
    `

    // Send confirmation email
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || "noreply@davel.library.com",
        to: formData.email,
        subject: `Membership Application Received - ${applicationId}`,
        html: emailContent,
      }

      await transporter.sendMail(mailOptions)
      console.log(`Application confirmation email sent successfully to ${formData.email}`)
    } catch (emailError) {
      console.warn(`Application confirmation email failed:`, (emailError as Error).message)
      // Don't fail the application if email fails
    }

    // Send notification email to admin/librarian
    try {
      const adminNotification = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
            <h1>📝 New Membership Application</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>New Application Received</h2>
            
            <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="color: #dc3545; margin-top: 0;">Application Details</h3>
              <p><strong>Application ID:</strong> ${applicationId}</p>
              <p><strong>Applicant:</strong> ${formData.firstName} ${formData.lastName}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Phone:</strong> ${formData.phone}</p>
              <p><strong>Application Fee:</strong> R${formData.applicationFee}</p>
              <p><strong>Date Submitted:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <h3>Contact Information</h3>
            <p><strong>Address:</strong> ${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}</p>
            <p><strong>Date of Birth:</strong> ${formData.dateOfBirth}</p>
            <p><strong>Gender:</strong> ${formData.gender}</p>
            
            <h3>Preferences</h3>
            <p><strong>Preferred Genres:</strong> ${formData.preferredGenres?.join(", ") || "None selected"}</p>
            <p><strong>Reading Frequency:</strong> ${formData.readingFrequency}</p>
            <p><strong>Accessibility Needs:</strong> ${formData.hasDisability ? "Yes" : "No"}</p>
            ${formData.hasDisability && formData.disabilityDetails ? `<p><strong>Details:</strong> ${formData.disabilityDetails}</p>` : ""}
            
            <h3>Documents</h3>
            <p><strong>ID Documents:</strong> ${formData.idDocument?.length || 0} file(s)</p>
            <p><strong>Proof of Address:</strong> ${formData.proofOfAddress?.length || 0} file(s)</p>
            ${formData.additionalDocuments && formData.additionalDocuments.length > 0 ? `<p><strong>Additional Documents:</strong> ${formData.additionalDocuments.length} file(s)</p>` : ""}
            
            <p>Please review this application and take appropriate action.</p>
          </div>
        </div>
      `

      const adminMailOptions = {
        from: process.env.EMAIL_FROM || "noreply@davel.library.com",
        to: process.env.ADMIN_EMAIL || "admin@davel.library.com",
        subject: `New Membership Application - ${applicationId}`,
        html: adminNotification,
      }

      await transporter.sendMail(adminMailOptions)
      console.log(`Admin notification email sent successfully`)
    } catch (emailError) {
      console.warn(`Admin notification email failed:`, (emailError as Error).message)
      // Don't fail the application if email fails
    }

    // Save application to database
    console.log("Saving application to database...")
    const savedApplication = await prisma.membershipApplication.create({
      data: {
        userId: session?.user?.id || null, // Allow null for unauthenticated applications
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        alternatePhone: formData.alternatePhone || null,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        hasDisability: formData.hasDisability || false,
        disabilityDetails: formData.disabilityDetails || null,
        preferredGenres: Array.isArray(formData.preferredGenres) ? formData.preferredGenres.join(", ") : (formData.preferredGenres || ""),
        readingFrequency: formData.readingFrequency,
        subscribeNewsletter: formData.subscribeNewsletter || false,
        idDocument: formData.idDocument || null,
        proofOfAddress: formData.proofOfAddress || null,
        additionalDocuments: formData.additionalDocuments || null,
        status: "PENDING"
      }
    })
    console.log("Application saved successfully:", savedApplication.id)
    
    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: savedApplication.id,
      applicationFee: formData.applicationFee
    })

  } catch (error) {
    console.error("Membership application error:", error)
    
    return NextResponse.json(
      { 
        error: "Failed to submit application",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
