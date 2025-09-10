import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const services = await prisma.printService.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    })

    return NextResponse.json(services)

  } catch (error) {
    console.error("Error fetching print services:", error)
    return NextResponse.json(
      { error: "Failed to fetch print services" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      name, 
      description, 
      pricePerPage, 
      colorPrice, 
      paperSizes, 
      paperTypes, 
      maxPages, 
      turnaroundTime 
    } = await request.json()

    if (!name || !description || !pricePerPage) {
      return NextResponse.json(
        { error: "Name, description, and price per page are required" },
        { status: 400 }
      )
    }

    const printService = await prisma.printService.create({
      data: {
        name,
        description,
        pricePerPage: parseFloat(pricePerPage),
        colorPrice: parseFloat(colorPrice || "0"),
        paperSizes: paperSizes || ["A4"],
        paperTypes: paperTypes || ["Standard"],
        maxPages: parseInt(maxPages || "100"),
        turnaroundTime: turnaroundTime || "24 hours",
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      service: printService
    })

  } catch (error) {
    console.error("Error creating print service:", error)
    return NextResponse.json(
      { error: "Failed to create print service" },
      { status: 500 }
    )
  }
}
