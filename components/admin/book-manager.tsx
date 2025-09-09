"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/ui/file-upload"
import { DigitalFileUpload } from "@/components/ui/digital-file-upload"
import { Plus, Edit, Trash2, Search, Filter, BookOpen, Eye, Download, CheckCircle } from "lucide-react"
import Image from 'next/image'

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

interface Book {
  id: string
  title: string
  author: string
  summary?: string
  isbn?: string
  genre: string
  deweyDecimal: string
  isElectronic: boolean
  isDigital: boolean
  coverImage?: string
  digitalFile?: string
  totalCopies: number
  availableCopies: number
  publishedYear?: number
  publisher?: string
  language: string
  pages?: number
  visibility: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function BookManager() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    summary: "",
    isbn: "",
    isElectronic: false,
    isDigital: false,
    visibility: "PUBLIC",
    totalCopies: 1,
    availableCopies: 1,
    genre: "",
    publishedYear: new Date().getFullYear(),
    coverImage: "",
    deweyDecimal: "",
    digitalFile: "",
    publisher: "",
    language: "English",
    pages: 0
  })

  const fetchBooks = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/books')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched books:', data)
        setBooks(data)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
      toast({
        title: "Error",
        description: "Failed to fetch books",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      summary: "",
      isbn: "",
      isElectronic: false,
      isDigital: false,
      visibility: "PUBLIC",
      totalCopies: 1,
      availableCopies: 1,
      genre: "",
      publishedYear: new Date().getFullYear(),
      coverImage: "",
      deweyDecimal: "",
      digitalFile: "",
      publisher: "",
      language: "English",
      pages: 0
    })
  }

  const openAddDialog = () => {
    setEditingBook(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (book: Book) => {
    console.log('Opening edit dialog for book:', book)
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      summary: book.summary || "",
      isbn: book.isbn || "",
      isElectronic: book.isElectronic,
      isDigital: book.isDigital,
      visibility: book.visibility,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      genre: book.genre || "",
      publishedYear: book.publishedYear || new Date().getFullYear(),
      coverImage: book.coverImage || "",
      deweyDecimal: book.deweyDecimal || "",
      digitalFile: book.digitalFile || "",
      publisher: book.publisher || "",
      language: book.language || "English",
      pages: book.pages || 0
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingBook ? `/api/admin/books/${editingBook.id}` : '/api/admin/books'
      const method = editingBook ? 'PUT' : 'POST'
      
      console.log('Submitting book:', { url, method, editingBook, formData })
      
      // Validate required fields
      if (!formData.title.trim() || !formData.author.trim()) {
        toast({
          title: "Validation Error",
          description: "Title and Author are required fields",
          variant: "destructive"
        })
        return
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: editingBook ? "Book updated successfully" : "Book added successfully",
        })
        setIsDialogOpen(false)
        fetchBooks()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to save book')
      }
    } catch (error) {
      console.error('Error saving book:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save book",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (bookId: string) => {
    const book = books.find(b => b.id === bookId)
    if (!book) return

    const confirmMessage = `Are you sure you want to delete "${book.title}" by ${book.author}"?\n\nThis will also delete:\n• All reservations for this book\n• All reviews for this book\n\nThis action cannot be undone.`
    
    if (!confirm(confirmMessage)) return

    try {
      console.log('Deleting book with ID:', bookId)
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Book and all related records deleted successfully",
        })
        fetchBooks()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to delete book')
      }
    } catch (error) {
      console.error('Error deleting book:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete book",
        variant: "destructive"
      })
    }
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !filterCategory || filterCategory === "all" || book.genre === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(books.map(book => book.genre)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Book Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage the library&apos;s book collection</p>
        </div>
        <Button onClick={openAddDialog} className="bg-[#8B4513] hover:bg-[#A0522D] text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="search">Search Books</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
                <div>
          <Label htmlFor="genre">Filter by Genre</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genres</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
                     <Button 
             variant="outline" 
             onClick={() => { setSearchTerm(""); setFilterCategory("all") }}
             className="w-full"
           >
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredBooks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No books found</p>
          </div>
        ) : (
          filteredBooks.map((book) => (
            <Card key={book.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      by {book.author}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {book.genre}
                      </Badge>
                      {book.isElectronic && (
                        <Badge variant="secondary" className="text-xs">Electronic</Badge>
                      )}
                      {book.isDigital && (
                        <Badge variant="secondary" className="text-xs">Digital</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(book)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(book.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {book.isbn && (
                    <div className="flex justify-between">
                      <span>ISBN:</span>
                      <span>{book.isbn}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Copies:</span>
                    <span>{book.availableCopies}/{book.totalCopies}</span>
                  </div>
                  {book.publishedYear && (
                    <div className="flex justify-between">
                      <span>Year:</span>
                      <span>{book.publishedYear}</span>
                    </div>
                  )}
                  {book.deweyDecimal && (
                    <div className="flex justify-between">
                      <span>Dewey:</span>
                      <span>{book.deweyDecimal}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBook ? "Edit Book" : "Add New Book"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="deweyDecimal">Dewey Decimal</Label>
                <Input
                  id="deweyDecimal"
                  value={formData.deweyDecimal}
                  onChange={(e) => setFormData({ ...formData, deweyDecimal: e.target.value })}
                  placeholder="000.000"
                />
              </div>
            </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="genre">Genre</Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="publishedYear">Published Year</Label>
                <Input
                  id="publishedYear"
                  type="number"
                  value={formData.publishedYear}
                  onChange={(e) => setFormData({ ...formData, publishedYear: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={formData.visibility} onValueChange={(value) => setFormData({ ...formData, visibility: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="RESTRICTED">Restricted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  value={formData.publisher}
                  onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                  placeholder="Publisher name"
                />
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="English"
                />
              </div>
              <div>
                <Label htmlFor="pages">Pages</Label>
                <Input
                  id="pages"
                  type="number"
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })}
                  placeholder="Number of pages"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalCopies">Total Copies</Label>
                <Input
                  id="totalCopies"
                  type="number"
                  value={formData.totalCopies}
                  onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="availableCopies">Available Copies</Label>
                <Input
                  id="availableCopies"
                  type="number"
                  value={formData.availableCopies}
                  onChange={(e) => setFormData({ ...formData, availableCopies: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isElectronic"
                  checked={formData.isElectronic}
                  onChange={(e) => setFormData({ ...formData, isElectronic: e.target.checked })}
                />
                <Label htmlFor="isElectronic">Electronic</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDigital"
                  checked={formData.isDigital}
                  onChange={(e) => setFormData({ ...formData, isDigital: e.target.checked })}
                />
                <Label htmlFor="isDigital">Digital</Label>
              </div>
            </div>

            {/* Digital File Upload Section */}
            {formData.isDigital && (
              <div className="space-y-4">
                <div>
                  <Label>Digital Book File</Label>
                  <DigitalFileUpload
                    onFileSelect={async (file) => {
                      try {
                        const uploadFormData = new FormData()
                        uploadFormData.append('file', file)
                        uploadFormData.append('type', 'digital')
                        
                        const response = await fetch('/api/upload', {
                          method: 'POST',
                          body: uploadFormData
                        })
                        
                        if (response.ok) {
                          const result = await response.json()
                          setFormData({ ...formData, digitalFile: result.url })
                          toast({
                            title: "Success",
                            description: "Digital file uploaded successfully",
                          })
                        } else {
                          const errorData = await response.json()
                          toast({
                            title: "Upload Failed",
                            description: errorData.error || "Failed to upload digital file",
                            variant: "destructive"
                          })
                        }
                      } catch (error) {
                        console.error('Upload error:', error)
                        toast({
                          title: "Upload Error",
                          description: "Failed to upload digital file",
                          variant: "destructive"
                        })
                      }
                    }}
                    onFileRemove={() => {
                      setFormData({ ...formData, digitalFile: "" })
                    }}
                    selectedFile={null}
                    uploadedFileUrl={formData.digitalFile}
                  />
                </div>
                
                {formData.digitalFile && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">Digital file uploaded successfully</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">{formData.digitalFile}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>Cover Page</Label>
              <FileUpload
                onFileSelect={async (file) => {
                  try {
                    const uploadFormData = new FormData()
                    uploadFormData.append('file', file)
                    uploadFormData.append('type', 'gallery')
                    
                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: uploadFormData
                    })
                    
                    if (response.ok) {
                      const result = await response.json()
                      setFormData({ ...formData, coverImage: result.url })
                      toast({
                        title: "Success",
                        description: "Cover image uploaded successfully",
                      })
                    } else {
                      const errorData = await response.json()
                      toast({
                        title: "Upload Failed",
                        description: errorData.error || "Failed to upload cover image",
                        variant: "destructive"
                      })
                    }
                  } catch (error) {
                    console.error('Upload error:', error)
                    toast({
                      title: "Upload Error",
                      description: "Failed to upload cover image",
                      variant: "destructive"
                    })
                  }
                }}
                onFileRemove={() => {
                  setFormData({ ...formData, coverImage: "" })
                }}
                type="gallery"
              />
              {formData.coverImage && (
                <div className="mt-2">
                  <Image src={formData.coverImage} alt="Book cover preview" width={128} height={128} className="object-cover rounded-lg border" />
                </div>
              )}
            </div>



            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#8B4513] hover:bg-[#A0522D] text-white">
                {editingBook ? "Update Book" : "Add Book"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
