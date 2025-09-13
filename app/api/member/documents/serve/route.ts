import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentType = searchParams.get("type")

    if (!documentType) {
      return NextResponse.json(
        { error: "Document type is required" },
        { status: 400 }
      )
    }

    const userId = session.user.id

    // Get document from user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        idDocument: true,
        proofOfAddress: true,
        additionalDocuments: true
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    let documentUrl = null

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

    if (!documentUrl) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // Check if it's an external URL (like Cloudinary)
    if (documentUrl.startsWith('http://') || documentUrl.startsWith('https://')) {
      // For external URLs, redirect to the URL
      return NextResponse.redirect(documentUrl)
    }

    // For local files, return error since we don't handle local files in this API
    return NextResponse.json(
      { error: "Local file serving not supported" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Error serving member document:", error)
    return NextResponse.json(
      { error: "Failed to serve document" },
      { status: 500 }
    )
  }
}
