import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const book = await prisma.book.findUnique({
      where: { id: params.id }
    })
    
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }
    
    return NextResponse.json(book)
  } catch (error) {
    console.error("Error fetching book:", error)
    return NextResponse.json({ error: "Failed to fetch book" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    
    // Validate required fields
    if (!data.title || !data.author) {
      return NextResponse.json({ 
        error: "Title and Author are required fields" 
      }, { status: 400 })
    }
    
    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: params.id }
    })
    
    if (!existingBook) {
      console.log("Book not found for update:", params.id)
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }
    
    // Update the book
    const updatedBook = await prisma.book.update({
      where: { id: params.id },
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn || null,
        summary: data.summary || null,
        genre: data.genre || "General",
        deweyDecimal: data.deweyDecimal || "000",
        totalCopies: data.totalCopies || 1,
        availableCopies: data.availableCopies || data.totalCopies || 1,
        isElectronic: data.isElectronic || false,
        isDigital: data.isDigital || false,
        visibility: data.visibility || "PUBLIC",
        coverImage: data.coverImage || null,
        digitalFile: data.digitalFile || null,
        publishedYear: data.publishedYear || null,
        publisher: data.publisher || null,
        language: data.language || "English",
        pages: data.pages || null
      }
    })
    
    return NextResponse.json({ 
      message: "Book updated successfully", 
      book: updatedBook 
    })
  } catch (error) {
    console.error("Error updating book:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to update book" 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id: params.id }
    })
    
    if (!existingBook) {
      console.log("Book not found for deletion:", params.id)
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Use a transaction to safely delete the book and all related records
    const result = await prisma.$transaction(async (tx) => {
      // First, delete all related book reservations
      await tx.bookReservation.deleteMany({
        where: { bookId: params.id }
      })

      // Then, delete all related book reviews
      await tx.bookReview.deleteMany({
        where: { bookId: params.id }
      })

      // Finally, delete the book itself
      const deletedBook = await tx.book.delete({
        where: { id: params.id }
      })

      return deletedBook
    })
    
    return NextResponse.json({ 
      message: "Book and all related records deleted successfully", 
      book: result 
    })
  } catch (error) {
    console.error("Error deleting book:", error)
    
    // Provide more specific error messages
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json({ 
        error: "Cannot delete book due to existing reservations or reviews. Please remove all reservations and reviews first." 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to delete book" 
    }, { status: 500 })
  }
}
