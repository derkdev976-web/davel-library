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

    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')

    if (bookId) {
      // Get specific book progress
      const progress = await prisma.readingProgress.findFirst({
        where: {
          userId: session.user.id,
          bookId: bookId
        }
      })

      if (progress) {
        // Parse bookmarks from JSON string back to array
        const parsedProgress = {
          ...progress,
          bookmarks: JSON.parse(progress.bookmarks || '[]')
        }
        return NextResponse.json(parsedProgress)
      }
      return NextResponse.json(null)
    } else {
      // Get all reading progress for user
      const progress = await prisma.readingProgress.findMany({
        where: {
          userId: session.user.id
        },
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
        orderBy: {
          updatedAt: 'desc'
        }
      })

      // Parse bookmarks from JSON string back to array for each progress item
      const parsedProgress = progress.map(item => ({
        ...item,
        bookmarks: JSON.parse(item.bookmarks || '[]')
      }))

      return NextResponse.json(parsedProgress)
    }
  } catch (error) {
    console.error("Error fetching reading progress:", error)
    return NextResponse.json(
      { error: "Failed to fetch reading progress" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bookId, currentPage, totalPages, readingTime, bookmarks } = body

    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      )
    }

    // Upsert reading progress
    const progress = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId: session.user.id,
          bookId: bookId
        }
      },
      update: {
        currentPage: currentPage || 0,
        totalPages: totalPages || 0,
        readingTime: readingTime || 0,
        bookmarks: JSON.stringify(bookmarks || []),
        lastReadAt: new Date()
      },
      create: {
        userId: session.user.id,
        bookId: bookId,
        currentPage: currentPage || 0,
        totalPages: totalPages || 0,
        readingTime: readingTime || 0,
        bookmarks: JSON.stringify(bookmarks || []),
        lastReadAt: new Date()
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error("Error saving reading progress:", error)
    return NextResponse.json(
      { error: "Failed to save reading progress" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('bookId')

    if (!bookId) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      )
    }

    await prisma.readingProgress.deleteMany({
      where: {
        userId: session.user.id,
        bookId: bookId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting reading progress:", error)
    return NextResponse.json(
      { error: "Failed to delete reading progress" },
      { status: 500 }
    )
  }
}
