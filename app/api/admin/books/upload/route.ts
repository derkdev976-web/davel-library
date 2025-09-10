import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from 'cloudinary'
import crypto from "crypto"

const ALLOWED_FILE_TYPES = ["application/pdf", "application/epub+zip", "text/plain"]
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const bookId = formData.get("bookId") as string
    const file = formData.get("file") as File

    if (!bookId || !file) {
      return NextResponse.json({ error: "Missing bookId or file" }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only PDF, EPUB, and TXT files are allowed." 
      }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 100MB." 
      }, { status: 400 })
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueId = crypto.randomBytes(16).toString('hex')
    const fileName = `ebook_${bookId}_${uniqueId}`

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'davel-library/ebooks',
          public_id: fileName,
          resource_type: 'raw', // For PDFs and other documents
          format: fileExtension
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const cloudinaryResult = result as any
    const fileUrl = cloudinaryResult.secure_url

    // Update book with digital file information
    const updatedBook = await prisma.book.update({
      where: { id: bookId },
      data: {
        isDigital: true,
        digitalFile: fileUrl,
        isLocked: true, // Locked by default
        maxReservations: 10,
        currentReservations: 0
      }
    })

    return NextResponse.json({
      message: "Ebook uploaded successfully",
      book: updatedBook
    })

  } catch (error) {
    console.error("Error uploading ebook:", error)
    return NextResponse.json({ error: "Failed to upload ebook" }, { status: 500 })
  }
}
