import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emailService } from "@/lib/email-service"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { status, reviewNotes } = body

    // Find the application in database
    const application = await prisma.membershipApplication.findUnique({
      where: { id: params.id }
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const previousStatus = application.status

    // Update application in database
    const updatedApplication = await prisma.membershipApplication.update({
      where: { id: params.id },
      data: {
        status,
        reviewNotes,
        reviewedBy: session.user.id,
        reviewedAt: new Date()
      }
    })

    // Send email notifications based on status change
    if (status !== previousStatus) {
      try {
        if (status === "APPROVED" && previousStatus !== "APPROVED") {
          // Create user account for approved member first
          let temporaryPassword = null
          try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
              where: { email: application.email }
            })

            if (!existingUser) {
              // Generate temporary password
              const bcrypt = await import("bcryptjs")
              temporaryPassword = Math.random().toString(36).slice(-8) // 8-character random password
              const hashedPassword = await bcrypt.hash(temporaryPassword, 10)

              // Create user account for approved member
              await prisma.user.create({
                data: {
                  email: application.email,
                  name: `${application.firstName} ${application.lastName}`,
                  role: "MEMBER",
                  isActive: true,
                  password: hashedPassword,
                  membershipApplication: {
                    connect: { id: application.id }
                  },
                  profile: {
                    create: {
                      firstName: application.firstName,
                      lastName: application.lastName,
                      dateOfBirth: application.dateOfBirth,
                      gender: application.gender,
                      street: application.street,
                      city: application.city,
                      state: application.state,
                      zipCode: application.zipCode,
                      country: application.country,
                      hasDisability: application.hasDisability,
                      disabilityDetails: application.disabilityDetails,
                      preferredGenres: application.preferredGenres,
                      readingFrequency: application.readingFrequency
                    }
                  }
                }
              })
            }
          } catch (error) {
            console.error('Error creating user account for approved member:', error)
            // Don't fail the application update if user creation fails
          }

          // Send approval email with login credentials
          await emailService.sendApprovalEmail({
            email: application.email,
            firstName: application.firstName,
            lastName: application.lastName,
            notes: reviewNotes,
            temporaryPassword: temporaryPassword || undefined
          })
        } else if (status === "REJECTED" && previousStatus !== "REJECTED") {
          // Send rejection email
          await emailService.sendRejectionEmail({
            email: application.email,
            firstName: application.firstName,
            lastName: application.lastName,
            notes: reviewNotes
          })
        } else if (status === "UNDER_REVIEW" && previousStatus !== "UNDER_REVIEW") {
          // Send under review email
          await emailService.sendUnderReviewEmail({
            email: application.email,
            firstName: application.firstName,
            lastName: application.lastName,
            notes: reviewNotes
          })
        }
      } catch (error) {
        console.error('Error sending email notification:', error)
        // Don't fail the application update if email sending fails
      }
    }

    return NextResponse.json({ 
      message: "Application updated successfully",
      application: {
        id: updatedApplication.id,
        firstName: updatedApplication.firstName,
        lastName: updatedApplication.lastName,
        email: updatedApplication.email,
        status: updatedApplication.status,
        reviewNotes: updatedApplication.reviewNotes,
        reviewedBy: updatedApplication.reviewedBy,
        reviewedAt: updatedApplication.reviewedAt,
        updatedAt: updatedApplication.updatedAt
      }
    })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


