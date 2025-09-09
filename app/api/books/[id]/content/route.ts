import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookId = params.id

    // Get book details
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        title: true,
        author: true,
        summary: true,
        digitalFile: true,
        isElectronic: true,
        isDigital: true
      }
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    // Check if book is electronic/digital
    if (!book.isElectronic && !book.isDigital) {
      return NextResponse.json({ error: "Book is not available in digital format" }, { status: 400 })
    }

    let content = ""
    let contentType = "text"

    // If book has a digital file, try to read it
    if (book.digitalFile) {
      try {
        const filePath = path.join(process.cwd(), 'public', book.digitalFile)
        
        // Check if file exists
        if (fs.existsSync(filePath)) {
          const fileExtension = path.extname(book.digitalFile).toLowerCase()
          
          if (fileExtension === '.txt') {
            content = fs.readFileSync(filePath, 'utf-8')
            contentType = "text"
          } else if (fileExtension === '.pdf') {
            // For PDF files, return the file URL for PDF viewer
            content = book.digitalFile // Return the file path for PDF viewer
            contentType = "pdf"
          } else {
            content = `This book is available as a ${fileExtension} file. File viewing for this format is not yet implemented.\n\nBook: ${book.title}\nAuthor: ${book.author}`
            contentType = "unsupported"
          }
        } else {
          content = `Digital file not found for this book.\n\nBook: ${book.title}\nAuthor: ${book.author}`
          contentType = "missing"
        }
      } catch (error) {
        console.error("Error reading digital file:", error)
        content = `Error reading digital file for this book.\n\nBook: ${book.title}\nAuthor: ${book.author}`
        contentType = "error"
      }
    } else {
      // If no digital file, use summary or create placeholder content
      content = book.summary || `Welcome to "${book.title}" by ${book.author}.\n\nThis book is available in our digital collection. The full content will be available soon.\n\nSummary:\n${book.summary || "No summary available."}`
      contentType = "placeholder"
    }

    return NextResponse.json({
      bookId: book.id,
      title: book.title,
      author: book.author,
      content: content,
      contentType: contentType,
      hasDigitalFile: !!book.digitalFile
    })

  } catch (error) {
    console.error("Error fetching book content:", error)
    return NextResponse.json(
      { error: "Failed to fetch book content" },
      { status: 500 }
    )
  }
}
