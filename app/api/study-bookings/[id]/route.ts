import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookingId = params.id
    const body = await request.json()
    const { status } = body

    // Check if user can modify this booking
    const existingBooking = await prisma.studyBooking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Only admin/librarian can approve/reject, or user can cancel their own booking
    if (session.user.role === "MEMBER" && existingBooking.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role === "MEMBER" && status !== "CANCELLED") {
      return NextResponse.json({ error: "Members can only cancel bookings" }, { status: 400 })
    }

    const updatedBooking = await prisma.studyBooking.update({
      where: { id: bookingId },
      data: { 
        status,
        ...(status === "COMPLETED" && { completedAt: new Date() })
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
      message: "Booking updated successfully",
      booking: updatedBooking
    })
  } catch (error) {
    console.error("Error updating study booking:", error)
    return NextResponse.json({ error: "Failed to update study booking" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookingId = params.id

    // Check if user can delete this booking
    const existingBooking = await prisma.studyBooking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Only admin/librarian can delete any booking, or user can delete their own
    if (session.user.role === "MEMBER" && existingBooking.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.studyBooking.delete({
      where: { id: bookingId }
    })

    return NextResponse.json({
      message: "Booking deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting study booking:", error)
    return NextResponse.json({ error: "Failed to delete study booking" }, { status: 500 })
  }
}