import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = params
    const { status } = await request.json()

    // Check if user can update this booking
    const existingBooking = await prisma.studyBooking.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Only admin/librarian can update status, or user can update their own booking
    if (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN" && existingBooking.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedBooking = await prisma.studyBooking.update({
      where: { id },
      data: { status },
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
      booking: updatedBooking
    })

  } catch (error) {
    console.error("Error updating study booking:", error)
    return NextResponse.json(
      { error: "Failed to update study booking" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = params

    // Check if user can delete this booking
    const existingBooking = await prisma.studyBooking.findUnique({
      where: { id }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Only admin/librarian can delete, or user can delete their own booking
    if (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN" && existingBooking.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if booking can be cancelled (not completed or too close to start time)
    const now = new Date()
    const startTime = new Date(existingBooking.startTime)
    const timeDiff = startTime.getTime() - now.getTime()
    const hoursUntilStart = timeDiff / (1000 * 60 * 60)

    if (existingBooking.status === "COMPLETED") {
      return NextResponse.json({ 
        error: "Cannot cancel completed booking" 
      }, { status: 400 })
    }

    if (hoursUntilStart < 1) {
      return NextResponse.json({ 
        error: "Cannot cancel booking less than 1 hour before start time" 
      }, { status: 400 })
    }

    await prisma.studyBooking.update({
      where: { id },
      data: { status: "CANCELLED" }
    })

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully"
    })

  } catch (error) {
    console.error("Error cancelling study booking:", error)
    return NextResponse.json(
      { error: "Failed to cancel study booking" },
      { status: 500 }
    )
  }
}
