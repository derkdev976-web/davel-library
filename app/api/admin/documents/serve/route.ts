import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

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

    if (!documentUrl) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // Check if file exists
    const filePath = join(process.cwd(), "public", documentUrl)
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: "File not found on server" },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = await readFile(filePath)
    
    // Determine content type based on file extension
    const extension = documentUrl.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (extension) {
      case 'pdf':
        contentType = 'application/pdf'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'webp':
        contentType = 'image/webp'
        break
    }

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${documentUrl.split('/').pop()}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error("Error serving document:", error)
    return NextResponse.json(
      { error: "Failed to serve document" },
      { status: 500 }
    )
  }
}