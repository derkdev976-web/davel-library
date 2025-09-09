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

    // Check if it's a hard copy book (not digital/electronic)
    if (reservation.book.isDigital || reservation.book.isElectronic) {
      return NextResponse.json({ error: "This is a digital book, no barcode needed" }, { status: 400 })
    }

    // Generate a unique barcode for collection
    const barcodeData = {
      reservationId: reservation.id,
      bookId: reservation.book.id,
      bookTitle: reservation.book.title,
      bookAuthor: reservation.book.author,
      userId: reservation.userId,
      userName: reservation.user.name,
      userEmail: reservation.user.email,
      approvedAt: reservation.approvedAt,
      dueDate: reservation.dueDate,
      collectionCode: `DC-${reservation.id.slice(-8).toUpperCase()}`,
      generatedAt: new Date().toISOString()
    }

    // Create a QR code or barcode data
    const barcodeString = JSON.stringify(barcodeData)

    return NextResponse.json({
      barcode: barcodeString,
      collectionCode: barcodeData.collectionCode,
      bookTitle: reservation.book.title,
      bookAuthor: reservation.book.author,
      dueDate: reservation.dueDate,
      qrCodeData: barcodeString // This can be used to generate QR codes on the frontend
    })

  } catch (error) {
    console.error("Error generating barcode:", error)
    return NextResponse.json({ error: "Failed to generate barcode" }, { status: 500 })
  }
}
