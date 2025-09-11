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
    
    // If user is not admin/librarian, only show their own bookings
    if (session.user.role === "MEMBER" || userId) {
      where.userId = userId || session.user.id
    }
    
    if (status) {
      where.status = status
    }

    const bookings = await prisma.studyBooking.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        space: {
          select: { id: true, name: true, location: true, capacity: true }
        }
      },
      orderBy: { startTime: 'desc' }
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching study bookings:", error)
    return NextResponse.json({ error: "Failed to fetch study bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { spaceId, startTime, endTime, duration } = body

    // Check if space exists and is available
    const space = await prisma.studySpace.findUnique({
      where: { id: spaceId }
    })

    if (!space || !space.isActive || !space.isAvailable) {
      return NextResponse.json({ error: "Study space not available" }, { status: 400 })
    }

    // Check for conflicting bookings
    const conflictingBooking = await prisma.studyBooking.findFirst({
      where: {
        spaceId,
        status: { in: ["CONFIRMED", "PENDING"] },
        OR: [
          {
            startTime: { lte: new Date(startTime) },
            endTime: { gt: new Date(startTime) }
          },
          {
            startTime: { lt: new Date(endTime) },
            endTime: { gte: new Date(endTime) }
          },
          {
            startTime: { gte: new Date(startTime) },
            endTime: { lte: new Date(endTime) }
          }
        ]
      }
    })

    if (conflictingBooking) {
      return NextResponse.json({ 
        error: "Time slot is already booked" 
      }, { status: 400 })
    }

    const totalCost = space.hourlyRate * parseFloat(duration)
    const status = session.user.role === "MEMBER" ? "PENDING" : "CONFIRMED"

    const newBooking = await prisma.studyBooking.create({
      data: {
        userId: session.user.id,
        spaceId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: parseFloat(duration),
        totalCost,
        status
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        space: {
          select: { id: true, name: true, location: true, capacity: true }
        }
      }
    })

    return NextResponse.json({
      message: "Study space booking created successfully",
      booking: newBooking
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating study booking:", error)
    return NextResponse.json({ error: "Failed to create study booking" }, { status: 500 })
  }
}