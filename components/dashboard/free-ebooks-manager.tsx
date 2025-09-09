'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Download, BookOpen, ExternalLink, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image'

interface FreeEbook {
  id: string;
  title: string;
  author: string;
  summary?: string;
  coverImage?: string;
  downloadUrl?: string;
  source: string;
  genre?: string[];
  publicationYear?: number;
  language?: string;
  pageCount?: number;
  alreadyInLibrary: boolean;
  libraryBookId?: string;
  canReserve: boolean;
}

interface FreeEbooksResponse {
  books: FreeEbook[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  sources: string[];
}

export default function FreeEbooksManager() {
  const [books, setBooks] = useState<FreeEbook[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchFreeEbooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        source: selectedSource,
        limit: '20',
        page: currentPage.toString()
      });

      const response = await fetch(`/api/books/free-ebooks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch free ebooks');
      
      const data: FreeEbooksResponse = await response.json();
      setBooks(data.books);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching free ebooks:', error);
      toast.error('Failed to fetch free ebooks');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedSource, currentPage]);

  useEffect(() => {
    fetchFreeEbooks();
  }, [fetchFreeEbooks]);

  const importBook = async (book: FreeEbook) => {
    setImporting(book.id);
    try {
      const response = await fetch('/api/books/free-ebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          summary: book.summary,
          coverImage: book.coverImage,
          downloadUrl: book.downloadUrl,
          source: book.source,
          genre: book.genre,
          publicationYear: book.publicationYear,
          language: book.language,
          pageCount: book.pageCount
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to import book');
      }

      const result = await response.json();
      toast.success(`Successfully imported "${book.title}"`);
      
      // Update the book status in the list
      setBooks(prev => prev.map(b => 
        b.id === book.id 
          ? { ...b, alreadyInLibrary: true, libraryBookId: result.book.id }
          : b
      ));
    } catch (error) {
      console.error('Error importing book:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import book');
    } finally {
      setImporting(null);
    }
  };



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFreeEbooks();
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'project gutenberg':
        return <BookOpen className="w-4 h-4" />;
      case 'open library':
        return <ExternalLink className="w-4 h-4" />;
      case 'google books':
        return <Download className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'project gutenberg':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'open library':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'google books':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Free Ebooks Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search free ebooks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="gutenberg">Project Gutenberg</SelectItem>
                  <SelectItem value="openlibrary">Open Library</SelectItem>
                  <SelectItem value="google">Google Books</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Available Free Ebooks</CardTitle>
            <div className="text-sm text-gray-600">
              Showing {books?.length || 0} of {pagination?.total || 0} books
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading free ebooks...</span>
            </div>
          ) : !books || books.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No free ebooks found. Try adjusting your search criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex gap-4">
                    {book.coverImage && (
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        width={64}
                        height={80}
                        className="object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{book.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400">by {book.author}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSourceColor(book.source)}>
                            {getSourceIcon(book.source)}
                            <span className="ml-1">{book.source}</span>
                          </Badge>
                          {book.alreadyInLibrary && (
                            <Badge variant="secondary">Already in Library</Badge>
                          )}
                        </div>
                      </div>
                      
                      {book.summary && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {book.summary}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {book.publicationYear && (
                          <span>{book.publicationYear}</span>
                        )}
                        {book.language && (
                          <span>{book.language.toUpperCase()}</span>
                        )}
                        {book.pageCount && (
                          <span>{book.pageCount} pages</span>
                        )}
                        {book.genre && book.genre.length > 0 && (
                          <span>{book.genre.join(', ')}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {book.downloadUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(book.downloadUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Original
                          </Button>
                        )}
                        
                        {!book.alreadyInLibrary ? (
                          <Button
                            size="sm"
                            onClick={() => importBook(book)}
                            disabled={importing === book.id}
                          >
                            {importing === book.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            ) : (
                              <Plus className="w-4 h-4 mr-1" />
                            )}
                            Import to Library
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                          >
                            Already Imported
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {pagination?.totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(pagination?.totalPages || 1, prev + 1))}
                    disabled={currentPage === (pagination?.totalPages || 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
