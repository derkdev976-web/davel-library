import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const documentType = searchParams.get("type") // "idDocument", "proofOfAddress", "additionalDocuments"
    const userType = searchParams.get("userType") // "applicant" or "member"

    if (!userId || !documentType) {
      return NextResponse.json(
        { error: "User ID and document type are required" },
        { status: 400 }
      )
    }

    let documentUrl = null

    if (userType === "applicant") {
      // Get document from membership application
      const application = await prisma.membershipApplication.findUnique({
        where: { userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          idDocument: true,
          proofOfAddress: true,
          additionalDocuments: true
        }
      })

      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        )
      }

      // Get the specific document URL
      switch (documentType) {
        case "idDocument":
          documentUrl = application.idDocument
          break
        case "proofOfAddress":
          documentUrl = application.proofOfAddress
          break
        case "additionalDocuments":
          documentUrl = application.additionalDocuments
          break
        default:
          return NextResponse.json(
            { error: "Invalid document type" },
            { status: 400 }
          )
      }
    } else {
      // Get document from user profile
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

      if (!user || !user.profile) {
        return NextResponse.json(
          { error: "User or profile not found" },
          { status: 404 }
        )
      }

      // Get the specific document URL
      switch (documentType) {
        case "idDocument":
          documentUrl = user.profile.idDocument
          break
        case "proofOfAddress":
          documentUrl = user.profile.proofOfAddress
          break
        case "additionalDocuments":
          documentUrl = user.profile.additionalDocuments
          break
        default:
          return NextResponse.json(
            { error: "Invalid document type" },
            { status: 400 }
          )
      }
    }

    if (!documentUrl) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // Return the document URL for viewing
    return NextResponse.json({
      success: true,
      documentUrl,
      documentType,
      userId,
      userType
    })

  } catch (error) {
    console.error("Document view error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve document" },
      { status: 500 }
    )
  }
}
