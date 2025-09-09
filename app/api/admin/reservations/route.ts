import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const reservations = await prisma.bookReservation.findMany({
      include: {
        user: {
          select: {
            id: true,
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
            id: true,
            title: true,
            author: true,
            isbn: true
          }
        }
      },
      orderBy: {
        reservedAt: 'desc'
      }
    })



    const formattedReservations = reservations.map(reservation => ({
      id: reservation.id,
      userId: reservation.userId,
      userName: reservation.user.name || 
                `${reservation.user.profile?.firstName || ''} ${reservation.user.profile?.lastName || ''}`.trim() || 
                reservation.user.email,
      userEmail: reservation.user.email,
      bookId: reservation.bookId,
      bookTitle: reservation.book.title,
      bookAuthor: reservation.book.author,
      status: reservation.status,
      reservedAt: reservation.reservedAt.toISOString(),
      approvedAt: reservation.approvedAt?.toISOString(),
      dueDate: reservation.dueDate?.toISOString(),
      returnedAt: reservation.returnedAt?.toISOString(),
      notes: reservation.notes,
      renewalCount: reservation.renewalCount
    }))


    return NextResponse.json({ reservations: formattedReservations })
  } catch (error) {
    console.error("Error fetching reservations:", error)
    return NextResponse.json({ error: "Failed to fetch reservations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { userId, bookId, status, notes } = body

    // Validate required fields
    if (!userId || !bookId) {
      return NextResponse.json({ 
        error: "User ID and Book ID are required" 
      }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 })
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    })

    if (!book) {
      return NextResponse.json({ 
        error: "Book not found" 
      }, { status: 404 })
    }

    // Check if user already has a reservation for this book
    const existingReservation = await prisma.bookReservation.findFirst({
      where: {
        userId,
        bookId,
        status: {
          in: ["PENDING", "APPROVED", "CHECKED_OUT"]
        }
      }
    })

    if (existingReservation) {
      return NextResponse.json({ 
        error: "User already has an active reservation for this book" 
      }, { status: 400 })
    }

    // Create reservation
    const reservation = await prisma.bookReservation.create({
      data: {
        userId,
        bookId,
        status: status || "PENDING",
        notes,
        approvedBy: status === "APPROVED" ? session.user.id : null,
        approvedAt: status === "APPROVED" ? new Date() : null,
        dueDate: status === "APPROVED" ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null // 14 days from now
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

    return NextResponse.json({ 
      message: "Reservation created successfully",
      reservation: {
        id: reservation.id,
        userId: reservation.userId,
        userName: reservation.user.name || 
                  `${reservation.user.profile?.firstName || ''} ${reservation.user.profile?.lastName || ''}`.trim() || 
                  reservation.user.email,
        userEmail: reservation.user.email,
        bookId: reservation.bookId,
        bookTitle: reservation.book.title,
        bookAuthor: reservation.book.author,
        status: reservation.status,
        reservedAt: reservation.reservedAt.toISOString(),
        approvedAt: reservation.approvedAt?.toISOString(),
        dueDate: reservation.dueDate?.toISOString(),
        notes: reservation.notes
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating reservation:", error)
    return NextResponse.json({ 
      error: "Failed to create reservation" 
    }, { status: 500 })
  }
}
