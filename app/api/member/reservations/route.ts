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
            isElectronic: true,
            digitalFile: true,
            isLocked: true
          }
        }
      },
      orderBy: { reservedAt: "desc" }
    })

    const formattedReservations = reservations.map(reservation => ({
      id: reservation.id,
      bookTitle: reservation.book.title,
      bookAuthor: reservation.book.author,
      status: reservation.status,
      reservedAt: reservation.reservedAt.toISOString(),
      dueDate: reservation.dueDate?.toISOString(),
      renewalCount: reservation.renewalCount,
      returnedAt: reservation.returnedAt?.toISOString(),
      bookId: reservation.book.id,
      isDigital: reservation.book.isDigital,
      isElectronic: reservation.book.isElectronic,
      digitalFile: reservation.book.digitalFile
    }))

    return NextResponse.json(formattedReservations)
  } catch (error) {
    console.error("Error fetching member reservations:", error)
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    )
  }
}
