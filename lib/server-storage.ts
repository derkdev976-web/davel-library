import { writeFile, readFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Storage paths
const STORAGE_DIR = join(process.cwd(), 'data')
const BOOKS_FILE = join(STORAGE_DIR, 'books.json')
const CONTENT_FILE = join(STORAGE_DIR, 'content.json')
const THEME_FILE = join(STORAGE_DIR, 'theme.json')

// Initial data - Empty arrays for real data
const initialBooks: any[] = []
const initialContent: any[] = []
const initialTheme = {
  id: "mahogany-brown",
  name: "Mahogany Brown",
  primary: "#8B4513",
  secondary: "#800020",
  accent: "#CD853F",
  background: "#2D1810",
  text: "#F5F5DC"
}

// Helper functions
const ensureStorageDir = async () => {
  if (!existsSync(STORAGE_DIR)) {
    await mkdir(STORAGE_DIR, { recursive: true })
  }
}

const readFromFile = async (filePath: string, defaultValue: any) => {
  try {
    await ensureStorageDir()
    if (!existsSync(filePath)) {
      await writeFile(filePath, JSON.stringify(defaultValue, null, 2))
      return defaultValue
    }
    const data = await readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading from file (${filePath}):`, error)
    return defaultValue
  }
}

const writeToFile = async (filePath: string, data: any) => {
  try {
    await ensureStorageDir()
    await writeFile(filePath, JSON.stringify(data, null, 2))
    console.log(`Successfully wrote to file: ${filePath}`)
  } catch (error) {
    console.error(`Error writing to file (${filePath}):`, error)
    throw error
  }
}

// Initialize data with lazy loading
let books: any[] = initialBooks
let contentItems: any[] = initialContent
let currentTheme: any = initialTheme
let booksInitialized = false
let contentInitialized = false
let themeInitialized = false

const initializeBooks = async () => {
  if (!booksInitialized) {
    books = await readFromFile(BOOKS_FILE, initialBooks)
    booksInitialized = true
  }
  return books
}

const initializeContent = async () => {
  if (!contentInitialized) {
    contentItems = await readFromFile(CONTENT_FILE, initialContent)
    contentInitialized = true
  }
  return contentItems
}

const initializeTheme = async () => {
  if (!themeInitialized) {
    currentTheme = await readFromFile(THEME_FILE, initialTheme)
    themeInitialized = true
  }
  return currentTheme
}

// Book management functions
export const addBook = async (book: any) => {
  try {
    await initializeBooks()
    const newBook = {
      ...book,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      availableCopies: book.totalCopies || 1
    }
    books.push(newBook)
    await writeToFile(BOOKS_FILE, books)
    console.log('Book added successfully:', newBook.id)
    return newBook
  } catch (error) {
    console.error('Error in addBook:', error)
    throw error
  }
}

export const updateBook = async (id: string, updates: any) => {
  try {
    await initializeBooks()
    const index = books.findIndex(book => book.id === id)
    if (index === -1) {
      console.log('Book not found for update:', id)
      return null
    }
    
    books[index] = { ...books[index], ...updates }
    await writeToFile(BOOKS_FILE, books)
    console.log('Book updated successfully:', id)
    return books[index]
  } catch (error) {
    console.error('Error in updateBook:', error)
    throw error
  }
}

export const deleteBook = async (id: string) => {
  await initializeBooks()
  const index = books.findIndex(book => book.id === id)
  if (index === -1) return null
  
  const deleted = books.splice(index, 1)[0]
  await writeToFile(BOOKS_FILE, books)
  return deleted
}

export const getBooks = async (filters?: {
  published?: boolean
  category?: string
  search?: string
}) => {
  await initializeBooks()
  let filtered = books

  if (filters?.published) {
    filtered = filtered.filter(book => book.visibility === "PUBLIC")
  }

  if (filters?.category) {
    filtered = filtered.filter(book => book.category === filters.category)
  }

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(book => 
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.description.toLowerCase().includes(searchTerm)
    )
  }

  return filtered
}

// Content management functions
export const addContent = async (content: any) => {
  await initializeContent()
  const newContent = {
    ...content,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  contentItems.push(newContent)
  await writeToFile(CONTENT_FILE, contentItems)
  return newContent
}

export const updateContent = async (id: string, updates: any) => {
  await initializeContent()
  const index = contentItems.findIndex(item => item.id === id)
  if (index === -1) return null
  
  contentItems[index] = { ...contentItems[index], ...updates }
  await writeToFile(CONTENT_FILE, contentItems)
  return contentItems[index]
}

export const deleteContent = async (id: string) => {
  await initializeContent()
  const index = contentItems.findIndex(item => item.id === id)
  if (index === -1) return null
  
  const deleted = contentItems.splice(index, 1)[0]
  await writeToFile(CONTENT_FILE, contentItems)
  return deleted
}

export const getContent = async (filters?: {
  type?: string
  published?: boolean
  featured?: boolean
}) => {
  await initializeContent()
  let filtered = contentItems

  if (filters?.type) {
    filtered = filtered.filter(item => item.type === filters.type)
  }

  if (filters?.published) {
    filtered = filtered.filter(item => item.isPublished)
  }

  if (filters?.featured) {
    filtered = filtered.filter(item => item.isFeatured)
  }

  return filtered
}

// Theme management functions
export const getGlobalTheme = async () => {
  await initializeTheme()
  return currentTheme
}

export const setGlobalTheme = async (theme: any) => {
  await initializeTheme()
  currentTheme = theme
  await writeToFile(THEME_FILE, currentTheme)
  return currentTheme
}

// Export the arrays for direct access (will be initialized when first accessed)
export { books, contentItems }
