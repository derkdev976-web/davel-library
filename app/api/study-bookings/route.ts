import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const spaceId = searchParams.get("spaceId")

    // Build where clause
    const where: any = {}
    
    // If user is not admin/librarian, only show their own bookings
    if (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN") {
      where.userId = session.user.id
    }
    
    if (status) {
      where.status = status
    }
    
    if (spaceId) {
      where.spaceId = spaceId
    }

    const bookings = await prisma.studyBooking.findMany({
      where,
      include: {
        space: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { startTime: "desc" }
    })

    return NextResponse.json(bookings)

  } catch (error) {
    console.error("Error fetching study bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch study bookings" },
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

    const { spaceId, startTime, endTime } = await request.json()

    if (!spaceId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Space ID, start time, and end time are required" },
        { status: 400 }
      )
    }

    // Check if space exists and is available
    const space = await prisma.studySpace.findUnique({
      where: { id: spaceId }
    })

    if (!space) {
      return NextResponse.json({ error: "Study space not found" }, { status: 404 })
    }

    if (!space.isAvailable) {
      return NextResponse.json({ error: "Study space is not available" }, { status: 400 })
    }

    // Check for overlapping bookings
    const overlappingBooking = await prisma.studyBooking.findFirst({
      where: {
        spaceId,
        status: "CONFIRMED",
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } }
            ]
          }
        ]
      }
    })

    if (overlappingBooking) {
      return NextResponse.json({ 
        error: "This time slot is already booked" 
      }, { status: 400 })
    }

    // Calculate duration and cost
    const start = new Date(startTime)
    const end = new Date(endTime)
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    const totalCost = durationHours * space.hourlyRate

    const booking = await prisma.studyBooking.create({
      data: {
        userId: session.user.id,
        spaceId,
        startTime: start,
        endTime: end,
        duration: durationHours,
        totalCost,
        status: "CONFIRMED"
      },
      include: {
        space: true,
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
      booking
    })

  } catch (error) {
    console.error("Error creating study booking:", error)
    return NextResponse.json(
      { error: "Failed to create study booking" },
      { status: 500 }
    )
  }
}
