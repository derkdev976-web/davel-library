import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeJobs = searchParams.get("includeJobs") === "true"

    const where: any = { isActive: true }

    const services = await prisma.printService.findMany({
      where,
      include: includeJobs ? {
        printJobs: {
          where: {
            status: { in: ["PENDING", "PROCESSING"] }
          },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      } : false,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error("Error fetching print services:", error)
    return NextResponse.json({ error: "Failed to fetch print services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      pricePerPage, 
      colorPrice, 
      paperSizes, 
      paperTypes, 
      maxPages, 
      turnaroundTime 
    } = body

    const newService = await prisma.printService.create({
      data: {
        name,
        description,
        pricePerPage: parseFloat(pricePerPage),
        colorPrice: parseFloat(colorPrice || 0),
        paperSizes: paperSizes || ["A4"],
        paperTypes: paperTypes || ["Standard"],
        maxPages: parseInt(maxPages || 100),
        turnaroundTime: turnaroundTime || "24 hours"
      }
    })

    return NextResponse.json({
      message: "Print service created successfully",
      service: newService
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating print service:", error)
    return NextResponse.json({ error: "Failed to create print service" }, { status: 500 })
  }
}