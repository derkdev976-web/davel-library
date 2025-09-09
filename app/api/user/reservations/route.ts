import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reservations = await prisma.bookReservation.findMany({
      where: { userId: session.user.id },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true,
            isDigital: true,
            isLocked: true
          }
        }
      },
      orderBy: { reservedAt: "desc" }
    })

    const formattedReservations = reservations.map(reservation => ({
      id: reservation.id,
      status: reservation.status,
      reservedAt: reservation.reservedAt.toISOString(),
      dueDate: reservation.dueDate?.toISOString(),
      book: {
        id: reservation.book.id,
        title: reservation.book.title,
        author: reservation.book.author,
        coverImage: reservation.book.coverImage || "/images/catalog/placeholder.svg",
        isLocked: reservation.book.isLocked
      }
    }))

    return NextResponse.json(formattedReservations)
  } catch (error) {
    console.error("Error fetching user reservations:", error)
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    )
  }
}
