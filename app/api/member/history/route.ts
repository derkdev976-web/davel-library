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

    // Get borrowing history
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

    // Get reading progress
    const readingProgress = await prisma.readingProgress.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Get book reviews
    const reviews = await prisma.bookReview.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format the data
    const formattedReservations = reservations.map(reservation => ({
      id: reservation.id,
      book: {
        id: reservation.book.id,
        title: reservation.book.title,
        author: reservation.book.author,
        coverImage: reservation.book.coverImage,
        isbn: reservation.book.isbn
      },
      status: reservation.status,
      reservedAt: reservation.reservedAt.toISOString(),
      approvedAt: reservation.approvedAt?.toISOString(),
      dueDate: reservation.dueDate?.toISOString(),
      returnedAt: reservation.returnedAt?.toISOString(),
      renewalCount: reservation.renewalCount,
      notes: reservation.notes
    }))

    const formattedReadingProgress = readingProgress.map(progress => ({
      id: progress.id,
      book: {
        id: progress.book.id,
        title: progress.book.title,
        author: progress.book.author,
        coverImage: progress.book.coverImage
      },
      currentPage: progress.currentPage,
      totalPages: progress.totalPages,
      progressPercentage: progress.progressPercentage,
      lastReadAt: progress.lastReadAt?.toISOString(),
      updatedAt: progress.updatedAt.toISOString()
    }))

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      book: {
        id: review.book.id,
        title: review.book.title,
        author: review.book.author,
        coverImage: review.book.coverImage
      },
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString()
    }))

    // Calculate statistics
    const totalBooksBorrowed = reservations.filter(r => r.status === 'RETURNED').length
    const totalBooksRead = formattedReadingProgress.filter(p => p.progressPercentage >= 100).length
    const averageRating = formattedReviews.length > 0 
      ? formattedReviews.reduce((sum, review) => sum + review.rating, 0) / formattedReviews.length 
      : 0

    return NextResponse.json({
      reservations: formattedReservations,
      readingProgress: formattedReadingProgress,
      reviews: formattedReviews,
      statistics: {
        totalBooksBorrowed,
        totalBooksRead,
        totalReviews: formattedReviews.length,
        averageRating: Math.round(averageRating * 10) / 10
      }
    })

  } catch (error) {
    console.error("Error fetching member history:", error)
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    )
  }
}
