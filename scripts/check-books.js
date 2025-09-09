const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkBooks() {
  try {
    const books = await prisma.book.findMany({
      where: { isElectronic: true },
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

    console.log('Electronic books found:', books.length)
    books.forEach(book => {
      console.log(`\nBook: ${book.title}`)
      console.log(`ID: ${book.id}`)
      console.log(`Author: ${book.author}`)
      console.log(`Digital File: ${book.digitalFile}`)
      console.log(`Summary: ${book.summary ? book.summary.substring(0, 100) + '...' : 'No summary'}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkBooks()
