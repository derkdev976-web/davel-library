import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")

    const where: any = {}
    
    // If user is not admin/librarian, only show their own print jobs
    if (session.user.role === "MEMBER" || userId) {
      where.userId = userId || session.user.id
    }
    
    if (status) {
      where.status = status
    }

    const printJobs = await prisma.printJob.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        service: {
          select: { id: true, name: true, description: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ printJobs })
  } catch (error) {
    console.error("Error fetching print jobs:", error)
    return NextResponse.json({ error: "Failed to fetch print jobs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      serviceId, 
      fileName, 
      fileUrl, 
      fileSize, 
      pages, 
      copies, 
      color, 
      paperSize, 
      paperType, 
      pickupLocation, 
      specialInstructions 
    } = body

    // Get service details
    const service = await prisma.printService.findUnique({
      where: { id: serviceId }
    })

    if (!service || !service.isActive) {
      return NextResponse.json({ error: "Print service not available" }, { status: 400 })
    }

    // Calculate total cost
    const baseCost = service.pricePerPage * parseInt(pages) * parseInt(copies)
    const colorCost = color ? service.colorPrice * parseInt(pages) * parseInt(copies) : 0
    const totalCost = baseCost + colorCost

    const newPrintJob = await prisma.printJob.create({
      data: {
        userId: session.user.id,
        serviceId,
        fileName,
        fileUrl,
        fileSize: parseInt(fileSize),
        pages: parseInt(pages),
        copies: parseInt(copies),
        color: color === true || color === "true",
        paperSize,
        paperType,
        pickupLocation,
        specialInstructions,
        totalCost,
        status: "PENDING"
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        service: {
          select: { id: true, name: true, description: true }
        }
      }
    })

    return NextResponse.json({
      message: "Print job created successfully",
      printJob: newPrintJob
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating print job:", error)
    return NextResponse.json({ error: "Failed to create print job" }, { status: 500 })
  }
}