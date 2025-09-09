const fs = require('fs')
const path = require('path')

// Test the file reading logic
const bookId = 'cmf5bybe2000037zupcd8ty5q'
const digitalFile = '/uploads/sample-book.txt'

console.log('Testing book content reading...')
console.log('Book ID:', bookId)
console.log('Digital File:', digitalFile)

const filePath = path.join(process.cwd(), 'public', digitalFile)
console.log('Full file path:', filePath)
console.log('File exists:', fs.existsSync(filePath))

if (fs.existsSync(filePath)) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    console.log('Content length:', content.length)
    console.log('First 200 characters:', content.substring(0, 200))
  } catch (error) {
    console.error('Error reading file:', error)
  }
} else {
  console.log('File not found!')
}
