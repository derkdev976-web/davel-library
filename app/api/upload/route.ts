import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v2 as cloudinary } from 'cloudinary'
import crypto from "crypto"

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// File type configurations
const FILE_CONFIGS = {
  profile: {
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
    folder: "profile"
  },
  gallery: {
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime", "video/webm"],
    maxSize: 10 * 1024 * 1024, // 10MB
    folder: "gallery"
  },
  news: {
    allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    maxSize: 5 * 1024 * 1024, // 5MB
    folder: "news"
  },
  digital: {
    allowedTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
      "application/epub+zip", // .epub
      "text/plain", // .txt
      "application/rtf", // .rtf
      "application/vnd.oasis.opendocument.text", // .odt
      "application/x-iwork-pages-sffpages", // .pages
      "application/x-mobipocket-ebook", // .mobi
      "application/vnd.amazon.ebook" // .azw3
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
    folder: "ebooks"
  },
  document: {
    allowedTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
      "text/plain", // .txt
      "application/rtf", // .rtf
      "application/vnd.oasis.opendocument.text", // .odt
      "application/x-iwork-pages-sffpages" // .pages
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
    folder: "documents"
  },
  print: {
    allowedTypes: [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/msword", // .doc
      "text/plain", // .txt
      "application/rtf", // .rtf
      "application/vnd.oasis.opendocument.text", // .odt
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
      "application/vnd.ms-powerpoint", // .ppt
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "image/jpeg", // .jpg
      "image/png", // .png
      "image/gif", // .gif
      "image/webp" // .webp
    ],
    maxSize: 25 * 1024 * 1024, // 25MB
    folder: "print"
  }
}

// Extension to MIME type mapping for better validation
const EXTENSION_TO_MIME = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.epub': 'application/epub+zip',
  '.txt': 'text/plain',
  '.rtf': 'application/rtf',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.pages': 'application/x-iwork-pages-sffpages',
  '.mobi': 'application/x-mobipocket-ebook',
  '.azw3': 'application/vnd.amazon.ebook',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel'
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or type" }, { status: 400 })
    }

    const config = FILE_CONFIGS[type as keyof typeof FILE_CONFIGS]
    if (!config) {
      return NextResponse.json({ error: "Invalid upload type" }, { status: 400 })
    }

    // Validate file size
    if (file.size > config.maxSize) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${formatFileSize(config.maxSize)}.` 
      }, { status: 400 })
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const expectedMimeType = EXTENSION_TO_MIME[fileExtension as keyof typeof EXTENSION_TO_MIME]
    
    if (!config.allowedTypes.includes(file.type) && (!expectedMimeType || !config.allowedTypes.includes(expectedMimeType))) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const uniqueId = crypto.randomBytes(16).toString('hex')
    const timestamp = Date.now()
    const fileName = `${type}_${timestamp}_${uniqueId}${fileExtension}`

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `davel-library/${config.folder}`,
          public_id: fileName.replace(fileExtension, ''),
          resource_type: 'auto',
          // Add image transformations for images
          ...(config.allowedTypes.some(t => t.startsWith('image/')) && {
            transformation: [
              { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
            ]
          })
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const cloudinaryResult = result as any
    const fileUrl = cloudinaryResult.secure_url
    
    return NextResponse.json({
      message: "File uploaded successfully",
      url: fileUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

