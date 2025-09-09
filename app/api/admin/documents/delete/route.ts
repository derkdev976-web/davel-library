import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from "fs/promises"
import path from "path"

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const { userId, documentType, deleteReason, requiredAction } = await request.json()

    if (!userId || !documentType) {
      return NextResponse.json(
        { error: "User ID and document type are required" },
        { status: 400 }
      )
    }

    // Get the user's profile to find the document path
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        idDocument: true,
        proofOfAddress: true,
        additionalDocuments: true
      }
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      )
    }

    // Get the document path based on document type
    let documentPath: string | null = null
    switch (documentType) {
      case "idDocument":
        documentPath = userProfile.idDocument
        break
      case "proofOfAddress":
        documentPath = userProfile.proofOfAddress
        break
      case "additionalDocuments":
        documentPath = userProfile.additionalDocuments
        break
      default:
        return NextResponse.json(
          { error: "Invalid document type" },
          { status: 400 }
        )
    }

    if (!documentPath) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // Try to delete the physical file
    try {
      if (documentPath.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', documentPath)
        await fs.unlink(filePath)
        console.log(`Deleted file: ${filePath}`)
      }
    } catch (fileError) {
      console.warn(`Failed to delete physical file: ${documentPath}`, fileError)
      // Don't fail the operation if file deletion fails
    }

    // Update the user profile to remove the document reference
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        [documentType]: null
      }
    })

    // Create a notification for the user about the deleted document
    try {
      await prisma.documentNotification.create({
        data: {
          userId,
          documentType,
          action: "DELETED",
          reason: deleteReason || "Document was removed by admin",
          requiredAction: requiredAction || "Please re-upload the document if needed",
          adminId: session.user.id,
          status: "ACTIVE"
        }
      })
      console.log(`Notification created for user ${userId} about deleted ${documentType}`)
    } catch (notificationError) {
      console.warn(`Failed to create notification for deleted document:`, notificationError)
      // Don't fail the operation if notification creation fails
    }

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
