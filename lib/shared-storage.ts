// Shared storage for all application data to ensure consistency
// between admin dashboard and public web app
// Using localStorage for persistence across server reloads

// Storage keys
const BOOKS_STORAGE_KEY = 'davel-library-books'
const CONTENT_STORAGE_KEY = 'davel-library-content'

// Initial data - Empty arrays for real data
const initialBooks: any[] = []
const initialContent: any[] = []

// Helper functions for localStorage
const getFromStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') {
    return defaultValue
  }
  
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error)
    return defaultValue
  }
}

const saveToStorage = (key: string, data: any) => {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error)
  }
}

// Initialize data from localStorage or use defaults
let books = getFromStorage(BOOKS_STORAGE_KEY, initialBooks)
let contentItems = getFromStorage(CONTENT_STORAGE_KEY, initialContent)

// Book management functions
export const addBook = (book: any) => {
  const newBook = {
    ...book,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    availableCopies: book.totalCopies || 1
  }
  books.push(newBook)
  saveToStorage(BOOKS_STORAGE_KEY, books)
  return newBook
}

export const updateBook = (id: string, updates: any) => {
  const index = books.findIndex((book: any) => book.id === id)
  if (index === -1) return null
  
  books[index] = { ...books[index], ...updates }
  saveToStorage(BOOKS_STORAGE_KEY, books)
  return books[index]
}

export const deleteBook = (id: string) => {
  const index = books.findIndex((book: any) => book.id === id)
  if (index === -1) return null
  
  const deleted = books.splice(index, 1)[0]
  saveToStorage(BOOKS_STORAGE_KEY, books)
  return deleted
}

export const getBooks = (filters?: {
  published?: boolean
  category?: string
  search?: string
}) => {
  let filtered = books

  if (filters?.published) {
    filtered = filtered.filter((book: any) => book.visibility === "PUBLIC")
  }

  if (filters?.category) {
    filtered = filtered.filter((book: any) => book.category === filters.category)
  }

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter((book: any) => 
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.description.toLowerCase().includes(searchTerm)
    )
  }

  return filtered
}

// Content management functions
export const addContent = (content: any) => {
  const newContent = {
    ...content,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  contentItems.push(newContent)
  saveToStorage(CONTENT_STORAGE_KEY, contentItems)
  return newContent
}

export const updateContent = (id: string, updates: any) => {
  const index = contentItems.findIndex((item: any) => item.id === id)
  if (index === -1) return null
  
  contentItems[index] = { ...contentItems[index], ...updates }
  saveToStorage(CONTENT_STORAGE_KEY, contentItems)
  return contentItems[index]
}

export const deleteContent = (id: string) => {
  const index = contentItems.findIndex((item: any) => item.id === id)
  if (index === -1) return null
  
  const deleted = contentItems.splice(index, 1)[0]
  saveToStorage(CONTENT_STORAGE_KEY, contentItems)
  return deleted
}

export const getContent = (filters?: {
  type?: string
  published?: boolean
  featured?: boolean
}) => {
  let filtered = contentItems

  if (filters?.type) {
    filtered = filtered.filter((item: any) => item.type === filters.type)
  }

  if (filters?.published) {
    filtered = filtered.filter((item: any) => item.isPublished)
  }

  if (filters?.featured) {
    filtered = filtered.filter((item: any) => item.isFeatured)
  }

  return filtered
}

// Export the arrays for direct access (for API routes)
export { books, contentItems }
