import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get user's document requests
    const documentRequests = await prisma.documentRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    // Get user's uploaded documents (from profile or application)
    console.log("Fetching documents for user:", session.user.id)
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        profile: {
          select: {
            idDocument: true,
            proofOfAddress: true,
            additionalDocuments: true
          }
        },
        membershipApplication: {
          select: {
            idDocument: true,
            proofOfAddress: true,
            additionalDocuments: true
          }
        }
      }
    })
    
    console.log("Raw user data from database:", user)

    const uploadedDocuments = {
      idDocument: user?.profile?.idDocument || user?.membershipApplication?.idDocument,
      proofOfAddress: user?.profile?.proofOfAddress || user?.membershipApplication?.proofOfAddress,
      additionalDocuments: user?.profile?.additionalDocuments || user?.membershipApplication?.additionalDocuments
    }
    
    // Check if user has a profile
    if (!user?.profile) {
      console.log("User has no profile, will create one when documents are uploaded")
    } else {
      console.log("User profile found:", user.profile)
    }

    console.log("User documents response:", {
      userId: session.user.id,
      profile: user?.profile,
      membershipApplication: user?.membershipApplication,
      uploadedDocuments
    })

    // Check if we have any documents
    const hasDocuments = Object.values(uploadedDocuments).some(doc => doc !== null && doc !== undefined)
    console.log("Has any documents:", hasDocuments)

    return NextResponse.json({
      documentRequests,
      uploadedDocuments
    })

  } catch (error) {
    console.error("User documents error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve documents" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { documentType, filePath, requestId } = await request.json()
    
    console.log("Received document upload request:", { documentType, filePath, requestId })

    if (!documentType || !filePath) {
      console.log("Missing required fields:", { documentType: !!documentType, filePath: !!filePath })
      return NextResponse.json(
        { error: "Document type and file path are required" },
        { status: 400 }
      )
    }

    // Check if documentType is already a valid field name
    let fieldName = documentType
    
    // If it's not a valid field name, try to map it
    if (!["idDocument", "proofOfAddress", "additionalDocuments"].includes(documentType)) {
      const fieldMapping: { [key: string]: string } = {
        "government id": "idDocument",
        "proof of address": "proofOfAddress",
        "additional documents": "additionalDocuments"
      }
      fieldName = fieldMapping[documentType.toLowerCase()]
    }
    
    if (!fieldName) {
      return NextResponse.json(
        { error: `Invalid document type: ${documentType}. Valid types are: idDocument, proofOfAddress, additionalDocuments` },
        { status: 400 }
      )
    }

    // Update user profile with document
    console.log("Updating profile for user:", session.user.id, "with field:", fieldName, "and path:", filePath)
    
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        [fieldName]: filePath
      },
      create: {
        userId: session.user.id,
        firstName: session.user.name || "",
        lastName: "",
        preferredGenres: "General", // Default value for required field
        [fieldName]: filePath
      }
    })
    
    console.log("Profile updated successfully:", updatedProfile)

    // If there's a request ID, mark it as completed
    if (requestId) {
      await prisma.documentRequest.update({
        where: { id: requestId },
        data: {
          status: "COMPLETED",
          reviewedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      profile: updatedProfile
    })

  } catch (error) {
    console.error("Document upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const documentType = searchParams.get("documentType")

    if (!documentType) {
      return NextResponse.json(
        { error: "Document type is required" },
        { status: 400 }
      )
    }

    // Map document types to the correct field names
    const fieldMapping: { [key: string]: string } = {
      "government id": "idDocument",
      "idDocument": "idDocument",
      "proof of address": "proofOfAddress",
      "proofOfAddress": "proofOfAddress",
      "additional documents": "additionalDocuments",
      "additionalDocuments": "additionalDocuments"
    }

    const fieldName = fieldMapping[documentType.toLowerCase()]
    if (!fieldName) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      )
    }

    // Remove the document from user profile
    const updatedProfile = await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: {
        [fieldName]: null
      }
    })

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
      profile: updatedProfile
    })

  } catch (error) {
    console.error("Document deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    )
  }
}
