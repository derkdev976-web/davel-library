import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { reservationId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "MEMBER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const reservation = await prisma.bookReservation.findUnique({
      where: { id: params.reservationId },
      include: {
        book: true,
        user: true
      }
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    // Check if the reservation belongs to the current user
    if (reservation.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the reservation is approved
    if (reservation.status !== "APPROVED") {
      return NextResponse.json({ error: "Reservation not approved" }, { status: 400 })
    }

    // Check if it's a digital/electronic book
    if (!reservation.book.isDigital && !reservation.book.isElectronic) {
      return NextResponse.json({ error: "This is not a digital book" }, { status: 400 })
    }

    // Check if the book has a digital file
    if (!reservation.book.digitalFile) {
      return NextResponse.json({ error: "Digital file not available" }, { status: 404 })
    }

    // Check if the book is locked (should be unlocked for approved reservations)
    if (reservation.book.isLocked) {
      return NextResponse.json({ error: "Book is currently locked" }, { status: 403 })
    }

    // Check if the due date has passed (lock the book)
    if (reservation.dueDate && new Date() > new Date(reservation.dueDate)) {
      return NextResponse.json({ error: "Access expired - book is now locked" }, { status: 403 })
    }

    // Return the ebook access information
    return NextResponse.json({
      bookId: reservation.book.id,
      bookTitle: reservation.book.title,
      bookAuthor: reservation.book.author,
      digitalFile: reservation.book.digitalFile,
      isDigital: reservation.book.isDigital,
      isElectronic: reservation.book.isElectronic,
      approvedAt: reservation.approvedAt,
      dueDate: reservation.dueDate,
      accessExpires: reservation.dueDate,
      isAccessible: true,
      downloadUrl: `/api/member/ebook/${reservation.id}/download`
    })

  } catch (error) {
    console.error("Error accessing ebook:", error)
    return NextResponse.json({ error: "Failed to access ebook" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { reservationId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "MEMBER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const reservation = await prisma.bookReservation.findUnique({
      where: { id: params.reservationId },
      include: {
        book: true
      }
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    // Check if the reservation belongs to the current user
    if (reservation.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the reservation is approved
    if (reservation.status !== "APPROVED") {
      return NextResponse.json({ error: "Reservation not approved" }, { status: 400 })
    }

    // Check if it's a digital/electronic book
    if (!reservation.book.isDigital && !reservation.book.isElectronic) {
      return NextResponse.json({ error: "This is not a digital book" }, { status: 400 })
    }

    // Check if the due date has passed
    if (reservation.dueDate && new Date() > new Date(reservation.dueDate)) {
      return NextResponse.json({ error: "Access expired" }, { status: 403 })
    }

    // Log the download attempt
    console.log(`Ebook download requested: ${reservation.book.title} by ${session.user.email}`)

    // Return success response
    return NextResponse.json({
      message: "Ebook access granted",
      bookTitle: reservation.book.title,
      accessGranted: true
    })

  } catch (error) {
    console.error("Error processing ebook access:", error)
    return NextResponse.json({ error: "Failed to process ebook access" }, { status: 500 })
  }
}
