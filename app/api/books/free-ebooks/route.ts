import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const searchQuery = searchParams.get('q') || ''
    const source = searchParams.get('source') || 'all'

    // Build where clause for search
    const whereClause: any = {
      isElectronic: true,
      availableCopies: {
        gt: 0
      }
    }

    // Add search functionality
    if (searchQuery) {
      whereClause.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { author: { contains: searchQuery, mode: 'insensitive' } },
        { summary: { contains: searchQuery, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.book.count({ where: whereClause })

    // Fetch free ebooks from the database with pagination
    const freeEbooks = await prisma.book.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        author: true,
        coverImage: true,
        genre: true,
        summary: true,
        availableCopies: true,
        isElectronic: true,
        digitalFile: true,
        isDigital: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Transform the data to match the expected format
    const transformedEbooks = freeEbooks.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      summary: book.summary,
      coverImage: book.coverImage,
      digitalFile: book.digitalFile,
      isDigital: book.isDigital,
      downloadUrl: null, // No download URL for database books
      source: 'Library Database',
      genre: book.genre ? [book.genre] : ['General'],
      publicationYear: null,
      language: 'English',
      pageCount: null,
      alreadyInLibrary: true, // These are already in the library
      libraryBookId: book.id,
      canReserve: book.availableCopies > 0
    }))

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      books: transformedEbooks,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      sources: ['Library Database']
    })
  } catch (error) {
    console.error("Error fetching free ebooks:", error)
    return NextResponse.json(
      { error: "Failed to fetch free ebooks" },
      { status: 500 }
    )
  }
}
