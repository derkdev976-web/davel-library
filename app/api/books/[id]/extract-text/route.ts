import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import fs from 'fs'
import path from 'path'
// @ts-ignore - pdf-parse doesn't have type definitions
import pdf from 'pdf-parse'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PDF text extraction API called for book ID:', params.id)
    
    const session = await getServerSession(authOptions)
    console.log('Session found:', !!session, 'User ID:', session?.user?.id)
    
    if (!session?.user?.id) {
      console.log('Unauthorized access attempt')
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
        digitalFile: true,
        isElectronic: true,
        isDigital: true
      }
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    if (!book.isElectronic && !book.isDigital) {
      return NextResponse.json({ error: "Book is not available in digital format" }, { status: 400 })
    }

    if (book.digitalFile) {
      try {
        const filePath = path.join(process.cwd(), 'public', book.digitalFile)
        
        if (!fs.existsSync(filePath)) {
          return NextResponse.json({
            bookId: book.id,
            title: book.title,
            author: book.author,
            text: `Digital file not found for this book.`,
            extracted: false,
            message: "Digital file not found"
          }, { status: 404 })
        }

        const fileExtension = path.extname(book.digitalFile).toLowerCase()
        
        if (fileExtension === '.txt') {
          const content = fs.readFileSync(filePath, 'utf-8')
          return NextResponse.json({
            bookId: book.id,
            title: book.title,
            author: book.author,
            text: content,
            extracted: true
          })
        } else if (fileExtension === '.pdf') {
          // For PDF files, extract text using pdf-parse
          try {
            console.log('Attempting to extract text from PDF:', filePath)
            console.log('File exists:', fs.existsSync(filePath))
            
            const pdfBuffer = fs.readFileSync(filePath)
            console.log('PDF buffer size:', pdfBuffer.length, 'bytes')
            
            const pdfData = await pdf(pdfBuffer)
            console.log('PDF parsed successfully - Pages:', pdfData.numpages, 'Text length:', pdfData.text ? pdfData.text.length : 0)
            
            if (pdfData.text && pdfData.text.trim()) {
              // Clean up the extracted text
              const cleanedText = pdfData.text
                .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
                .replace(/\n\s*\n/g, '\n\n') // Clean up multiple newlines
                .trim()
              
              console.log('Text extraction successful, returning cleaned text')
              return NextResponse.json({
                bookId: book.id,
                title: book.title,
                author: book.author,
                text: cleanedText,
                extracted: true,
                pages: pdfData.numpages,
                message: "PDF text extracted successfully"
              })
            } else {
              console.log('No text could be extracted from PDF')
              return NextResponse.json({
                bookId: book.id,
                title: book.title,
                author: book.author,
                text: `This is a PDF document titled "${book.title}" by ${book.author}. This PDF appears to be an image-based document or contains no extractable text. For the best reading experience, please use the PDF viewer to read the document visually. You can also download the PDF to read it with your preferred PDF reader.`,
                extracted: false,
                message: "No text could be extracted from PDF"
              })
            }
          } catch (pdfError: any) {
            console.error("Error parsing PDF:", pdfError)
            console.error("PDF Error details:", {
              message: pdfError?.message,
              stack: pdfError?.stack,
              name: pdfError?.name
            })
            return NextResponse.json({
              bookId: book.id,
              title: book.title,
              author: book.author,
              text: `This is a PDF document titled "${book.title}" by ${book.author}. There was an error extracting text from the PDF: ${pdfError?.message || 'Unknown error'}. Please use the PDF viewer to read the document visually.`,
              extracted: false,
              message: "PDF parsing failed",
              error: pdfError?.message || 'Unknown error'
            })
          }
        } else {
          return NextResponse.json({
            bookId: book.id,
            title: book.title,
            author: book.author,
            text: `This book is available as a ${fileExtension} file. Text extraction for this format is not yet implemented. Please use the PDF viewer to read the document visually.`,
            extracted: false,
            message: "Unsupported file type for text extraction"
          })
        }
      } catch (error) {
        console.error("Error processing digital file for text extraction:", error)
        return NextResponse.json(
          { error: "Failed to process digital file for text extraction" },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json({
        bookId: book.id,
        title: book.title,
        author: book.author,
        text: `No digital file found for this book.`,
        extracted: false,
        message: "No digital file found"
      })
    }

  } catch (error) {
    console.error("Error fetching book text for extraction:", error)
    return NextResponse.json(
      { error: "Failed to fetch book text for extraction" },
      { status: 500 }
    )
  }
}