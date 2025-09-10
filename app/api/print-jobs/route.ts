import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    // Build where clause
    const where: any = {}
    
    // If user is not admin/librarian, only show their own print jobs
    if (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN") {
      where.userId = session.user.id
    }
    
    if (status) {
      where.status = status
    }

    const printJobs = await prisma.printJob.findMany({
      where,
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(printJobs)

  } catch (error) {
    console.error("Error fetching print jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch print jobs" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const serviceId = formData.get("serviceId") as string
    const pages = parseInt(formData.get("pages") as string)
    const copies = parseInt(formData.get("copies") as string)
    const color = formData.get("color") === "true"
    const paperSize = formData.get("paperSize") as string
    const paperType = formData.get("paperType") as string
    const pickupLocation = formData.get("pickupLocation") as string
    const specialInstructions = formData.get("specialInstructions") as string

    if (!file || !serviceId || !pages || !copies) {
      return NextResponse.json(
        { error: "File, service ID, pages, and copies are required" },
        { status: 400 }
      )
    }

    // Check if service exists
    const service = await prisma.printService.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json({ error: "Print service not found" }, { status: 404 })
    }

    // Validate file type using the same logic as main upload route
    const allowedTypes = [
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
    ]

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const extensionToMime: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.txt': 'text/plain',
      '.rtf': 'application/rtf',
      '.odt': 'application/vnd.oasis.opendocument.text',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    }

    const expectedMimeType = extensionToMime[fileExtension]
    
    if (!allowedTypes.includes(file.type) && (!expectedMimeType || !allowedTypes.includes(expectedMimeType))) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Validate file size (25MB max for print jobs)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 25MB." 
      }, { status: 400 })
    }

    // Upload file to Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'davel-library/print',
          public_id: `print_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          resource_type: 'auto'
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const cloudinaryResult = result as any
    const fileUrl = cloudinaryResult.secure_url

    // Calculate cost
    const baseCost = service.pricePerPage * pages * copies
    const colorCost = color ? service.colorPrice * pages * copies : 0
    const totalCost = baseCost + colorCost

    const printJob = await prisma.printJob.create({
      data: {
        userId: session.user.id,
        serviceId,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        pages,
        copies,
        color,
        paperSize,
        paperType,
        pickupLocation,
        specialInstructions,
        totalCost,
        status: "PENDING"
      },
      include: {
        service: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      printJob
    })

  } catch (error) {
    console.error("Error creating print job:", error)
    return NextResponse.json(
      { error: "Failed to create print job" },
      { status: 500 }
    )
  }
}
