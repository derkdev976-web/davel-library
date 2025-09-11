import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeBookings = searchParams.get("includeBookings") === "true"
    const status = searchParams.get("status")

    const where: any = { isActive: true }
    if (status) {
      where.isAvailable = status === "available"
    }

    const spaces = await prisma.studySpace.findMany({
      where,
      include: includeBookings ? {
        bookings: {
          where: {
            status: { in: ["CONFIRMED", "PENDING"] },
            startTime: { gte: new Date() }
          },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { startTime: 'asc' }
        }
      } : undefined,
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ spaces })
  } catch (error) {
    console.error("Error fetching study spaces:", error)
    return NextResponse.json({ error: "Failed to fetch study spaces" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, capacity, location, amenities, hourlyRate, image } = body

    const newSpace = await prisma.studySpace.create({
      data: {
        name,
        description,
        capacity: parseInt(capacity),
        location,
        amenities: amenities || [],
        hourlyRate: parseFloat(hourlyRate),
        image
      }
    })

    return NextResponse.json({
      message: "Study space created successfully",
      space: newSpace
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating study space:", error)
    return NextResponse.json({ error: "Failed to create study space" }, { status: 500 })
  }
}