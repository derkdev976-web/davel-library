"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { 
  BookOpen, 
  Download, 
  Search, 
  Filter,
  UserPlus,
  Star,
  Clock,
  FileText
} from "lucide-react"
import Link from "next/link"
import { BookCoverPlaceholder } from "@/components/ui/book-cover-placeholder"
import Image from 'next/image'

interface FreeEbook {
  id: string
  title: string
  author: string
  coverImage?: string
  genre: string
  description?: string
  isAvailable: boolean
  downloadCount: number
  rating?: number
}

export function GuestEbookDashboard() {
  const [ebooks, setEbooks] = useState<FreeEbook[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const { toast } = useToast()

  const genres = [
    "all",
    "fiction",
    "non-fiction",
    "classics",
    "education",
    "children",
    "science",
    "history",
    "philosophy"
  ]

  const fetchFreeEbooks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/books/free-ebooks")
      if (response.ok) {
        const data = await response.json()
        setEbooks(data.books || [])
      } else {
        throw new Error("Failed to fetch free ebooks")
      }
    } catch (error) {
      console.error("Error fetching free ebooks:", error)
      setError("Failed to load free ebooks. Please try again later.")
      setEbooks([]) // Ensure ebooks is always an array
      toast({
        title: "Error",
        description: "Failed to load free ebooks. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchFreeEbooks()
  }, [fetchFreeEbooks])

  const handleDownload = async (ebookId: string) => {
    try {
      const downloadUrl = `/api/books/${ebookId}/download`
      window.open(downloadUrl, '_blank')
      toast({ title: "Download started" })
    } catch (error) {
      console.error("Error downloading ebook:", error)
      toast({ title: "Error downloading ebook", variant: "destructive" })
    }
  }

  const filteredEbooks = Array.isArray(ebooks) ? ebooks.filter(ebook => {
    const matchesSearch = ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ebook.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = selectedGenre === "all" || ebook.genre.toLowerCase() === selectedGenre
    return matchesSearch && matchesGenre
  }) : []

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading free ebooks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BookOpen className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-semibold">Error Loading Ebooks</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <Button onClick={fetchFreeEbooks} className="bg-[#8B4513] hover:bg-[#A0522D]">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient mb-4">Free Ebooks Library</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Access our collection of free digital books, classic literature, and educational resources. 
          No membership required!
        </p>
      </div>

      {/* Membership CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Want Full Access?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Apply for membership to access our complete collection of books, reserve physical copies, and join exclusive events.
              </p>
            </div>
            <Link href="/apply">
              <Button className="bg-[#8B4513] hover:bg-[#A0522D]">
                <UserPlus className="h-4 w-4 mr-2" />
                Apply for Membership
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
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
            <div className="flex gap-2">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ebooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEbooks.map((ebook) => (
          <Card key={ebook.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                {ebook.coverImage ? (
                  <Image 
                    src={ebook.coverImage} 
                    alt={ebook.title}
                    width={300}
                    height={400}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`${ebook.coverImage ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
                  <BookCoverPlaceholder title={ebook.title} size="lg" className="w-full h-full" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm line-clamp-2">{ebook.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">{ebook.author}</p>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {ebook.genre}
                  </Badge>
                  {ebook.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs">{ebook.rating}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{ebook.downloadCount} downloads</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Free
                  </span>
                </div>

                <Button 
                  size="sm" 
                  className="w-full bg-[#8B4513] hover:bg-[#A0522D]"
                  onClick={() => handleDownload(ebook.id)}
                  disabled={!ebook.isAvailable}
                >
                  <Download className="h-3 w-3 mr-1" />
                  {ebook.isAvailable ? "Download" : "Unavailable"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEbooks.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No ebooks found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
