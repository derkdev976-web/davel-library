const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addSampleBook() {
  try {
    // Check if sample book already exists
    const existingBook = await prisma.book.findFirst({
      where: {
        title: "Sample Digital Book"
      }
    })

    if (existingBook) {
      console.log("Sample book already exists")
      return
    }

    // Add sample book
    const book = await prisma.book.create({
      data: {
        title: "Sample Digital Book",
        author: "Digital Library Team",
        isbn: "978-0-123456-78-9",
        genre: "Technology",
        deweyDecimal: "025.04",
        isElectronic: true,
        isDigital: true,
        digitalFile: "/uploads/sample-book.txt",
        summary: "A sample book demonstrating the digital library's ebook reading functionality with text-to-speech, progress tracking, and modern reading features.",
        totalCopies: 1,
        availableCopies: 1,
        isLocked: false,
        maxReservations: 10,
        currentReservations: 0,
        publishedYear: 2024,
        publisher: "Digital Library",
        language: "English",
        pages: 5,
        isActive: true,
        visibility: "PUBLIC"
      }
    })

    console.log("Sample book added successfully:", book)
  } catch (error) {
    console.error("Error adding sample book:", error)
  } finally {
    await prisma.$disconnect()
  }
}

addSampleBook()
