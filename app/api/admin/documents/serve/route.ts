import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from 'fs'
import path from 'path'

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
    const documentType = searchParams.get("type")
    const userType = searchParams.get("userType")

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

    // Check if it's a URL or file path
    if (documentUrl.startsWith('http')) {
      // It's a URL, redirect to it
      return NextResponse.redirect(documentUrl)
    } else {
      // It's a file path, try to serve it
      try {
        const filePath = path.join(process.cwd(), 'public', documentUrl)
        
        if (!fs.existsSync(filePath)) {
          return NextResponse.json(
            { error: "File not found on server" },
            { status: 404 }
          )
        }

        const fileBuffer = fs.readFileSync(filePath)
        const fileExtension = path.extname(filePath).toLowerCase()
        
        // Determine content type
        let contentType = 'application/octet-stream'
        switch (fileExtension) {
          case '.pdf':
            contentType = 'application/pdf'
            break
          case '.jpg':
          case '.jpeg':
            contentType = 'image/jpeg'
            break
          case '.png':
            contentType = 'image/png'
            break
          case '.gif':
            contentType = 'image/gif'
            break
          case '.webp':
            contentType = 'image/webp'
            break
        }

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
            'Cache-Control': 'public, max-age=3600'
          }
        })
      } catch (fileError) {
        console.error('Error serving file:', fileError)
        return NextResponse.json(
          { error: "Error serving file" },
          { status: 500 }
        )
      }
    }

  } catch (error) {
    console.error("Document serve error:", error)
    return NextResponse.json(
      { error: "Failed to serve document" },
      { status: 500 }
    )
  }
}
