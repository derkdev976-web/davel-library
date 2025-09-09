import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
  const limit = Math.max(1, Math.min(24, parseInt(searchParams.get("limit") || "9", 10)))
  const skip = (page - 1) * limit
  const search = searchParams.get("search") || ""
  const genre = searchParams.get("genre") || ""
  
  try {
    // Build where clause for filtering
    const where: any = {
      visibility: "PUBLIC" // Only show public books in catalog
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (genre) {
      where.genre = genre
    }
    
    // Get total count for pagination
    const total = await prisma.book.count({ where })
    
    // Get books with pagination
    const books = await prisma.book.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })
    
    return NextResponse.json({ 
      books, 
      page, 
      total, 
      pageCount: Math.ceil(total / limit) 
    })
  } catch (e) {
    console.error("Error fetching books:", e)
    return NextResponse.json({ 
      books: [], 
      page: 1, 
      total: 0, 
      pageCount: 1 
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    // For public API, we'll just return a success response
    // Book creation should be done through admin API
    return NextResponse.json({ 
      message: "Book reservation request received",
      bookId: data.bookId 
    })
  } catch (_e) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}



