import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reservationId = params.id
    
    // Find the reservation
    const reservation = await prisma.bookReservation.findUnique({
      where: { id: reservationId },
      include: { 
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            isDigital: true
          }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    if (reservation.status !== "PENDING") {
      return NextResponse.json({ error: "Reservation is not pending approval" }, { status: 400 })
    }

    // Update reservation status to approved
    const updatedReservation = await prisma.bookReservation.update({
      where: { id: reservationId },
      data: {
        status: "APPROVED",
        approvedBy: session.user.id,
        approvedAt: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        book: {
          select: {
            title: true,
            author: true
          }
        }
      }
    })

    // If it's a digital book, unlock it for the user
    if (reservation.book.isDigital) {
      await prisma.book.update({
        where: { id: reservation.book.id },
        data: { isLocked: false }
      })
    }
    
    return NextResponse.json({ 
      message: "Reservation approved successfully",
      reservation: {
        id: updatedReservation.id,
        userId: updatedReservation.userId,
        userName: updatedReservation.user.name || 
                  `${updatedReservation.user.profile?.firstName || ''} ${updatedReservation.user.profile?.lastName || ''}`.trim() || 
                  updatedReservation.user.email,
        userEmail: updatedReservation.user.email,
        bookId: updatedReservation.bookId,
        bookTitle: updatedReservation.book.title,
        bookAuthor: updatedReservation.book.author,
        status: updatedReservation.status,
        reservedAt: updatedReservation.reservedAt.toISOString(),
        approvedAt: updatedReservation.approvedAt?.toISOString(),
        dueDate: updatedReservation.dueDate?.toISOString(),
        notes: updatedReservation.notes
      }
    })
  } catch (error) {
    console.error("Error approving reservation:", error)
    return NextResponse.json({ error: "Failed to approve reservation" }, { status: 500 })
  }
}
