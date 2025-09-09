"use client"

import { useState, useCallback } from "react"
import { Search, Filter, X, BookOpen, User, Calendar, Tag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SearchFilters {
  query: string
  type: "all" | "books" | "ebooks" | "authors" | "genres"
  genre: string
  year: string
  availability: "all" | "available" | "reserved" | "digital"
  sortBy: "relevance" | "title" | "author" | "date" | "popularity"
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  placeholder?: string
  className?: string
}

export function AdvancedSearch({ onSearch, placeholder = "Search library...", className = "" }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    type: "all",
    genre: "all",
    year: "all",
    availability: "all",
    sortBy: "relevance"
  })
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearch = useCallback(() => {
    onSearch(filters)
  }, [filters, onSearch])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      type: "all",
      genre: "all",
      year: "all",
      availability: "all",
      sortBy: "relevance"
    })
    onSearch({
      query: "",
      type: "all",
      genre: "all",
      year: "all",
      availability: "all",
      sortBy: "relevance"
    })
  }

  const hasActiveFilters = filters.query || 
    filters.type !== "all" || 
    filters.genre !== "all" || 
    filters.year !== "all" || 
    filters.availability !== "all" || 
    filters.sortBy !== "relevance"

  const genres = [
    "Fiction", "Non-Fiction", "Mystery", "Romance", "Science Fiction", 
    "Fantasy", "Biography", "History", "Self-Help", "Business", 
    "Technology", "Art", "Music", "Travel", "Cooking", "Health", "Education"
  ]

  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            onKeyPress={handleKeyPress}
            className="pl-10 pr-4"
          />
        </div>
        <Button onClick={handleSearch} size="sm">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Search Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? "Hide" : "Show"} Advanced Filters
            </DropdownMenuItem>
            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Content Type
            </label>
            <Select value={filters.type} onValueChange={(value: any) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="books">Physical Books</SelectItem>
                <SelectItem value="ebooks">E-books</SelectItem>
                <SelectItem value="authors">Authors</SelectItem>
                <SelectItem value="genres">Genres</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Genre
            </label>
            <Select value={filters.genre} onValueChange={(value) => setFilters(prev => ({ ...prev, genre: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre.toLowerCase()}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Publication Year
            </label>
            <Select value={filters.year} onValueChange={(value) => setFilters(prev => ({ ...prev, year: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Year</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <User className="h-4 w-4 mr-2" />
              Availability
            </label>
            <Select value={filters.availability} onValueChange={(value: any) => setFilters(prev => ({ ...prev, availability: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="available">Available Now</SelectItem>
                <SelectItem value="reserved">Currently Reserved</SelectItem>
                <SelectItem value="digital">Digital Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.query && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Query: &quot;{filters.query}&quot;
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, query: "" }))}
              />
            </Badge>
          )}
          {filters.type !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {filters.type}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, type: "all" }))}
              />
            </Badge>
          )}
          {filters.genre !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Genre: {filters.genre}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, genre: "all" }))}
              />
            </Badge>
          )}
          {filters.year !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Year: {filters.year}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, year: "all" }))}
              />
            </Badge>
          )}
          {filters.availability !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Availability: {filters.availability}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilters(prev => ({ ...prev, availability: "all" }))}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
