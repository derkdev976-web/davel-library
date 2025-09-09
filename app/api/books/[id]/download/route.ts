import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(
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
    // Note: Access token validation will be implemented in future update

    // Find the reservation
    const reservation = await prisma.bookReservation.findFirst({
      where: {
        userId,
        bookId,
        status: { in: ["APPROVED", "CHECKED_OUT"] }
      },
      include: { 
        book: {
          select: {
            id: true,
            title: true,
            isDigital: true,
            digitalFile: true
          }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json({ error: "Invalid or expired access token" }, { status: 403 })
    }

    if (!reservation.book.isDigital || !reservation.book.digitalFile) {
      return NextResponse.json({ error: "Digital file not available" }, { status: 404 })
    }

    // Check if file exists
    const filePath = join(process.cwd(), "public", "uploads", "ebooks", reservation.book.digitalFile)
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(filePath)

    // Note: Download tracking will be implemented in future update

    // Return file with appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', 'application/octet-stream')
    headers.set('Content-Disposition', `attachment; filename="${reservation.book.title}.pdf"`)
    headers.set('Content-Length', fileBuffer.length.toString())

    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error("Error downloading ebook:", error)
    return NextResponse.json({ error: "Failed to download ebook" }, { status: 500 })
  }
}
