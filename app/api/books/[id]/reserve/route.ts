import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookId = params.id
    const userId = session.user.id

    // Check if book exists and is digital
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    if (!book.isDigital) {
      return NextResponse.json({ error: "This book is not available in digital format" }, { status: 400 })
    }

    // Check if user already has an active reservation
    const existingReservation = await prisma.bookReservation.findFirst({
      where: {
        userId,
        bookId,
        status: { in: ["PENDING", "APPROVED", "CHECKED_OUT"] }
      }
    })

    if (existingReservation) {
      return NextResponse.json({ 
        error: "You already have an active reservation for this book" 
      }, { status: 400 })
    }

    // Check if book has reached maximum reservations
    if (book.currentReservations >= book.maxReservations) {
      return NextResponse.json({ 
        error: "This book has reached its maximum reservation limit" 
      }, { status: 400 })
    }

    // Create reservation
    const reservation = await prisma.bookReservation.create({
      data: {
        userId,
        bookId,
        status: "PENDING",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      }
    })

    // Update book's current reservations count
    await prisma.book.update({
      where: { id: bookId },
      data: {
        currentReservations: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      message: "Ebook reserved successfully",
      reservation
    })

  } catch (error) {
    console.error("Error reserving ebook:", error)
    return NextResponse.json({ error: "Failed to reserve ebook" }, { status: 500 })
  }
}
