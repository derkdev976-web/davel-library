import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const spaceId = params.id
    const body = await request.json()
    const { name, description, capacity, location, amenities, hourlyRate, image, isActive, isAvailable } = body

    const updatedSpace = await prisma.studySpace.update({
      where: { id: spaceId },
      data: {
        name,
        description,
        capacity: parseInt(capacity),
        location,
        amenities: amenities || [],
        hourlyRate: parseFloat(hourlyRate),
        image,
        isActive,
        isAvailable
      }
    })

    return NextResponse.json({
      message: "Study space updated successfully",
      space: updatedSpace
    })
  } catch (error) {
    console.error("Error updating study space:", error)
    return NextResponse.json({ error: "Failed to update study space" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const spaceId = params.id

    // Check if there are any active bookings
    const activeBookings = await prisma.studyBooking.count({
      where: {
        spaceId,
        status: { in: ["CONFIRMED", "PENDING"] },
        startTime: { gte: new Date() }
      }
    })

    if (activeBookings > 0) {
      return NextResponse.json({ 
        error: "Cannot delete study space with active bookings" 
      }, { status: 400 })
    }

    await prisma.studySpace.delete({
      where: { id: spaceId }
    })

    return NextResponse.json({
      message: "Study space deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting study space:", error)
    return NextResponse.json({ error: "Failed to delete study space" }, { status: 500 })
  }
}
