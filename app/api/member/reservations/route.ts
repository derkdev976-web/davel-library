import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const reservations = await prisma.bookReservation.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            isbn: true
          }
        }
      },
      orderBy: { reservedAt: 'desc' }
    })

    const formattedReservations = reservations.map(reservation => ({
      id: reservation.id,
      bookId: reservation.bookId,
      bookTitle: reservation.book.title,
      bookAuthor: reservation.book.author,
      bookCover: reservation.book.coverImage,
      bookIsbn: reservation.book.isbn,
      status: reservation.status,
      reservedAt: reservation.reservedAt.toISOString(),
      approvedAt: reservation.approvedAt?.toISOString(),
      dueDate: reservation.dueDate?.toISOString(),
      returnedAt: reservation.returnedAt?.toISOString(),
      renewalCount: reservation.renewalCount,
      notes: reservation.notes
    }))

    return NextResponse.json({ reservations: formattedReservations })

  } catch (error) {
    console.error("Error fetching member reservations:", error)
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { bookId } = await request.json()

    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      )
    }

    // Check if book exists and is available
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        title: true,
        availableCopies: true,
        isLocked: true
      }
    })

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      )
    }

    if (book.isLocked || book.availableCopies <= 0) {
      return NextResponse.json(
        { error: "Book is not available for reservation" },
        { status: 400 }
      )
    }

    // Check if user already has a reservation for this book
    const existingReservation = await prisma.bookReservation.findFirst({
      where: {
        userId,
        bookId,
        status: {
          in: ['PENDING', 'ACTIVE']
        }
      }
    })

    if (existingReservation) {
      return NextResponse.json(
        { error: "You already have a reservation for this book" },
        { status: 400 }
      )
    }

    // Create reservation
    const reservation = await prisma.bookReservation.create({
      data: {
        userId,
        bookId,
        status: 'PENDING',
        reservedAt: new Date()
      },
      include: {
        book: {
          select: {
            title: true,
            author: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.id,
        bookTitle: reservation.book.title,
        bookAuthor: reservation.book.author,
        status: reservation.status,
        reservedAt: reservation.reservedAt.toISOString()
      }
    })

  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    )
  }
}