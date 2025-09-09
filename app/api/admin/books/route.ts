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
    const books = await prisma.book.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(books)
  } catch (error) {
    console.error("Error fetching books:", error)
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
            const { 
      title, 
      author, 
      isbn, 
      summary, 
      genre, 
      deweyDecimal, 
      totalCopies, 
      availableCopies,
      isElectronic, 
      isDigital, 
      visibility,
      coverImage,
      digitalFile,
      publishedYear,
      publisher,
      language,
      pages
    } = body
    
    // Validate required fields
    if (!title || !author) {
      return NextResponse.json({ 
        error: "Title and Author are required fields" 
      }, { status: 400 })
    }
    
            const book = await prisma.book.create({
          data: {
            title,
            author,
            isbn: isbn || null,
            summary: summary || null,
            genre: genre || "General",
            deweyDecimal: deweyDecimal || "000",
            totalCopies: totalCopies || 1,
            availableCopies: availableCopies || totalCopies || 1,
            isElectronic: isElectronic || false,
            isDigital: isDigital || false,
            visibility: visibility || "PUBLIC",
            coverImage: coverImage || null,
            digitalFile: digitalFile || null,
            publishedYear: publishedYear || null,
            publisher: publisher || null,
            language: language || "English",
            pages: pages || null
          }
        })
    
    return NextResponse.json({ 
      message: "Book added successfully", 
      book 
    }, { status: 201 })
  } catch (error) {
    console.error("Error adding book:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to add book" 
    }, { status: 500 })
  }
}


