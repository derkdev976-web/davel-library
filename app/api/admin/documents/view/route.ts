import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const documentType = searchParams.get("type")
    const userType = searchParams.get("userType") || "applicant"

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
          idDocument: true,
          proofOfAddress: true,
          additionalDocuments: true
        }
      })

      if (application) {
        switch (documentType) {
          case "id":
            documentUrl = application.idDocument
            break
          case "address":
            documentUrl = application.proofOfAddress
            break
          case "additional":
            documentUrl = application.additionalDocuments
            break
        }
      }
    } else if (userType === "member") {
      // Get document from user profile
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
        select: {
          idDocument: true,
          proofOfAddress: true,
          additionalDocuments: true
        }
      })

      if (profile) {
        switch (documentType) {
          case "id":
            documentUrl = profile.idDocument
            break
          case "address":
            documentUrl = profile.proofOfAddress
            break
          case "additional":
            documentUrl = profile.additionalDocuments
            break
        }
      }
    }

    return NextResponse.json({
      documentUrl,
      exists: !!documentUrl
    })

  } catch (error) {
    console.error("Error checking document:", error)
    return NextResponse.json(
      { error: "Failed to check document" },
      { status: 500 }
    )
  }
}