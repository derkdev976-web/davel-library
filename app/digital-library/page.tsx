"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  Users, 
  FileText,
  Eye,
  Lock,
  Unlock
} from "lucide-react"
import Image from 'next/image'

interface Ebook {
  id: string
  title: string
  author: string
  summary?: string
  coverImage?: string

  isLocked: boolean
  currentReservations: number
  maxReservations: number
  visibility: string
  genre: string[]
  publishedYear?: number
  isDigital: boolean
}

export default function DigitalLibraryPage() {
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [filteredEbooks, setFilteredEbooks] = useState<Ebook[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const { toast } = useToast()

  const fetchEbooks = useCallback(async () => {
    try {
      const response = await fetch("/api/books?digital=true")
      if (response.ok) {
        const data = await response.json()
        setEbooks(data)
      }
    } catch (error) {
      console.error("Error fetching ebooks:", error)
      toast({ title: "Error loading digital library", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const filterEbooks = useCallback(() => {
    let filtered = ebooks.filter(book => book.isDigital)

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedGenre !== "all") {
      filtered = filtered.filter(book =>
        book.genre.includes(selectedGenre)
      )
    }

    if (selectedYear !== "all") {
      filtered = filtered.filter(book =>
        book.publishedYear?.toString() === selectedYear
      )
    }

    setFilteredEbooks(filtered)
  }, [ebooks, searchTerm, selectedGenre, selectedYear])

  useEffect(() => {
    fetchEbooks()
  }, [fetchEbooks])

  useEffect(() => {
    filterEbooks()
  }, [filterEbooks])



  const handleReserveEbook = async (bookId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}/reserve`, {
        method: "POST"
      })
      
      if (response.ok) {
        toast({ title: "Ebook reserved successfully! Awaiting approval." })
        fetchEbooks() // Refresh to update reservation counts
      } else {
        const error = await response.json()
        toast({ title: error.error || "Failed to reserve ebook", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error reserving ebook:", error)
      toast({ title: "Error reserving ebook", variant: "destructive" })
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown"
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatFileType = (type?: string) => {
    if (!type) return "Unknown"
    return type.split('/')[1]?.toUpperCase() || type
  }

  const getGenres = () => {
    const genres = new Set<string>()
    ebooks.forEach(book => {
      book.genre.forEach(g => genres.add(g))
    })
    return Array.from(genres).sort()
  }

  const getYears = () => {
    const years = new Set<string>()
    ebooks.forEach(book => {
      if (book.publishedYear) {
        years.add(book.publishedYear.toString())
      }
    })
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>Loading Digital Library...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-4">Digital Library</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Access thousands of ebooks, audiobooks, and digital resources from anywhere
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by title or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {getGenres().map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {getYears().map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredEbooks.length} ebooks found
              </p>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {ebooks.reduce((sum, book) => sum + book.currentReservations, 0)} active reservations
              </Badge>
            </div>
          </div>

          {/* Ebooks Grid */}
          {filteredEbooks.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No ebooks found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or browse all available ebooks.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEbooks.map((ebook) => (
                <Card key={ebook.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {ebook.isLocked ? (
                          <Lock className="h-4 w-4 text-red-500" />
                        ) : (
                          <Unlock className="h-4 w-4 text-green-500" />
                        )}
                        <Badge variant={ebook.isLocked ? "destructive" : "default"}>
                          {ebook.isLocked ? "Locked" : "Available"}
                        </Badge>
                      </div>
                      {ebook.coverImage && (
                        <Image 
                          src={ebook.coverImage} 
                          alt={ebook.title}
                          width={48}
                          height={64}
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{ebook.title}</CardTitle>
                    <p className="text-sm text-gray-600">{ebook.author}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {ebook.summary && (
                      <p className="text-sm text-gray-600 line-clamp-3">{ebook.summary}</p>
                    )}
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Format:</span>
                        <span>PDF</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Size:</span>
                        <span>Unknown</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reservations:</span>
                        <span>{ebook.currentReservations}/{ebook.maxReservations}</span>
                      </div>
                      {ebook.publishedYear && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Year:</span>
                          <span>{ebook.publishedYear}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {ebook.genre.slice(0, 2).map(genre => (
                        <Badge key={genre} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                      {ebook.genre.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{ebook.genre.length - 2} more
                        </Badge>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => handleReserveEbook(ebook.id)}
                      disabled={ebook.currentReservations >= ebook.maxReservations}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {ebook.currentReservations >= ebook.maxReservations 
                        ? "Fully Reserved" 
                        : "Reserve Ebook"
                      }
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
