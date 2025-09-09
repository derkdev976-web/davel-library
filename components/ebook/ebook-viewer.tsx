"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PDFViewer } from "./dynamic-pdf-viewer"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Bookmark, 
  BookmarkCheck,
  Settings,
  Sun,
  Moon,
  Type,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EbookViewerProps {
  book: {
    id: string
    title: string
    author: string
    content?: string
    coverImage?: string
    genre?: string
    summary?: string
  }
  onClose: () => void
}

interface ReadingProgress {
  bookId: string
  currentPage: number
  totalPages: number
  lastReadPosition: number
  bookmarks: number[]
  readingTime: number
}

export function EbookViewer({ book, onClose }: EbookViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [readingProgress, setReadingProgress] = useState(0)
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.6)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [bookmarks, setBookmarks] = useState<number[]>([])
  const [readingTime, setReadingTime] = useState(0)
  const [speechRate, setSpeechRate] = useState(1)
  const [speechPitch, setSpeechPitch] = useState(1)
  const [speechVolume, setSpeechVolume] = useState(1)
  const [bookContent, setBookContent] = useState<string>("")
  const [contentLoading, setContentLoading] = useState(true)
  const [contentError, setContentError] = useState<string | null>(null)
  const [contentType, setContentType] = useState<string>("text")
  const [showPDFViewer, setShowPDFViewer] = useState(false)
  
  const contentRef = useRef<HTMLDivElement>(null)
  const speechSynthesis = useRef<SpeechSynthesisUtterance | null>(null)
  const readingTimer = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()


  // Fetch actual book content
  const fetchBookContent = useCallback(async () => {
    try {
      setContentLoading(true)
      setContentError(null)
      
      const response = await fetch(`/api/books/${book.id}/content`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Book content data:', data)
        console.log('Content type:', data.contentType)
        console.log('Content (first 100 chars):', data.content?.substring(0, 100))
        setBookContent(data.content)
        setContentType(data.contentType || "text")
      } else {
        const errorData = await response.json()
        setContentError(errorData.error || "Failed to load book content")
        // Fallback to summary or placeholder content
        const fallbackContent = book.summary || `Welcome to "${book.title}" by ${book.author}.\n\nThis book is available in our digital collection. The full content will be available soon.`
        setBookContent(fallbackContent)
      }
    } catch (error) {
      console.error("Error fetching book content:", error)
      setContentError("Failed to load book content")
      // Fallback to summary or placeholder content
      const fallbackContent = book.summary || `Welcome to "${book.title}" by ${book.author}.\n\nThis book is available in our digital collection. The full content will be available soon.`
      setBookContent(fallbackContent)
    } finally {
      setContentLoading(false)
    }
  }, [book.id, book.title, book.author, book.summary])

  // Load book content when component mounts
  useEffect(() => {
    fetchBookContent()
  }, [fetchBookContent])

  // Initialize reading progress
  useEffect(() => {
    const savedProgress = localStorage.getItem(`reading-progress-${book.id}`)
    if (savedProgress) {
      const progress: ReadingProgress = JSON.parse(savedProgress)
      setCurrentPage(progress.currentPage)
      setBookmarks(progress.bookmarks)
      setReadingTime(progress.readingTime)
    }
  }, [book.id])

  // Save reading progress to server
  const saveReadingProgress = useCallback(async () => {
    try {
      await fetch('/api/user/reading-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookId: book.id,
          currentPage,
          totalPages,
          readingTime,
          bookmarks
        })
      })
    } catch (error) {
      console.error('Failed to save reading progress:', error)
    }
  }, [book.id, currentPage, totalPages, readingTime, bookmarks])

  // Calculate total pages based on content
  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight
      const containerHeight = contentRef.current.clientHeight
      const pages = Math.ceil(contentHeight / containerHeight)
      setTotalPages(pages)
    }
  }, [fontSize, lineHeight])

  // Update reading progress
  useEffect(() => {
    const progress = (currentPage / totalPages) * 100
    setReadingProgress(progress)
    
    // Save progress to localStorage
    const readingProgress: ReadingProgress = {
      bookId: book.id,
      currentPage,
      totalPages,
      lastReadPosition: currentPage,
      bookmarks,
      readingTime
    }
    localStorage.setItem(`reading-progress-${book.id}`, JSON.stringify(readingProgress))
    
    // Save progress to server
    saveReadingProgress()
  }, [currentPage, totalPages, bookmarks, readingTime, book.id, saveReadingProgress])

  // Reading timer
  useEffect(() => {
    if (isPlaying && !isPaused) {
      readingTimer.current = setInterval(() => {
        setReadingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (readingTimer.current) {
        clearInterval(readingTimer.current)
      }
    }

    return () => {
      if (readingTimer.current) {
        clearInterval(readingTimer.current)
      }
    }
  }, [isPlaying, isPaused])

  // Text-to-speech functionality
  const speakText = useCallback(async (text?: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel()
      
      let textToSpeak = text || bookContent
      
              // If it's a PDF and we don't have extracted text, try to extract it
        if (contentType === "pdf" && (!textToSpeak || textToSpeak === bookContent)) {
          try {
            console.log('Attempting to extract text from PDF for text-to-speech...')
            console.log('Book ID:', book.id)
            console.log('API URL:', `/api/books/${book.id}/extract-text`)
            toast({
              title: "Extracting PDF text...",
              description: "Please wait while we extract text from the PDF for audio reading.",
            })
            
            const response = await fetch(`/api/books/${book.id}/extract-text`)
          console.log('PDF text extraction response status:', response.status)
          console.log('PDF text extraction response ok:', response.ok)
          
          if (response.ok) {
            const data = await response.json()
            console.log('PDF text extraction response data:', data)
            if (data.extracted && data.text && data.text.trim()) {
              textToSpeak = data.text
              console.log('PDF text extracted successfully for TTS')
              toast({
                title: "PDF text extracted!",
                description: `Successfully extracted text from ${data.pages || 'unknown'} pages. Starting audio reading...`,
              })
            } else {
              console.log('No text could be extracted from PDF')
              textToSpeak = `This is a PDF document titled "${book.title}" by ${book.author}. The PDF content cannot be read aloud automatically. Please use the PDF viewer to read the document visually.`
              toast({
                title: "PDF text extraction failed",
                description: "This PDF may be image-based or contain no extractable text.",
                variant: "destructive"
              })
            }
                      } else {
              console.log('Failed to extract text from PDF - Response not ok')
              const errorText = await response.text()
              console.log('Error response:', errorText)
              
              // Provide a helpful fallback message
              textToSpeak = `This is a PDF document titled "${book.title}" by ${book.author}. This PDF contains valuable content about the Davel Library in Mpumalanga. While we cannot read the PDF content aloud automatically at this time, you can use the PDF viewer to read the document visually. The PDF contains information about library services, community programs, and local resources.`
              
              toast({
                title: "PDF Audio Reading Unavailable",
                description: "Please use the PDF viewer to read this document. Audio reading for PDFs is being improved.",
                variant: "default"
              })
            }
        } catch (error) {
          console.error('Error extracting PDF text:', error)
          textToSpeak = `This is a PDF document titled "${book.title}" by ${book.author}. This PDF contains valuable content about the Davel Library in Mpumalanga. While we cannot read the PDF content aloud automatically at this time, you can use the PDF viewer to read the document visually. The PDF contains information about library services, community programs, and local resources.`
          toast({
            title: "PDF Audio Reading Unavailable",
            description: "Please use the PDF viewer to read this document. Audio reading for PDFs is being improved.",
            variant: "default"
          })
        }
      }
      
      if (!textToSpeak) {
        toast({
          title: "No content to read",
          description: "Book content is not available for text-to-speech.",
          variant: "destructive"
        })
        return
      }
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.rate = speechRate
      utterance.pitch = speechPitch
      utterance.volume = speechVolume
      
      utterance.onstart = () => {
        setIsPlaying(true)
        setIsPaused(false)
      }
      
      utterance.onend = () => {
        setIsPlaying(false)
        setIsPaused(false)
      }
      
      utterance.onpause = () => {
        setIsPaused(true)
      }
      
      utterance.onresume = () => {
        setIsPaused(false)
      }
      
      speechSynthesis.current = utterance
      window.speechSynthesis.speak(utterance)
    } else {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support text-to-speech functionality.",
        variant: "destructive"
      })
    }
  }, [speechRate, speechPitch, speechVolume, toast, bookContent, contentType, book.id, book.title, book.author])

  const pauseSpeech = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
    }
  }

  const resumeSpeech = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    }
  }

  const stopSpeech = () => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }

  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(prev => prev.filter(page => page !== currentPage))
      toast({
        title: "Bookmark removed",
        description: `Removed bookmark from page ${currentPage}`,
      })
    } else {
      setBookmarks(prev => [...prev, currentPage])
      toast({
        title: "Bookmark added",
        description: `Added bookmark to page ${currentPage}`,
      })
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)))
    if (contentRef.current) {
      const pageHeight = contentRef.current.scrollHeight / totalPages
      contentRef.current.scrollTop = (page - 1) * pageHeight
    }
  }

  const nextPage = () => goToPage(currentPage + 1)
  const prevPage = () => goToPage(currentPage - 1)

  return (
    <div className={`fixed inset-0 z-50 bg-background ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`h-full flex flex-col ${isFullscreen ? 'rounded-none' : 'rounded-lg border shadow-lg'}`}>
        {/* Header */}
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <CardTitle className="text-lg">{book.title}</CardTitle>
                <p className="text-sm text-muted-foreground">by {book.author}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{book.genre}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleBookmark}
              >
                {bookmarks.includes(currentPage) ? (
                  <BookmarkCheck className="h-4 w-4 text-yellow-500" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Page {currentPage} of {totalPages}</span>
              <span>{formatTime(readingTime)}</span>
            </div>
            <Progress value={readingProgress} className="h-2" />
          </div>
        </CardHeader>

        {/* Content Area */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="h-full flex">
            {/* Main Reading Area */}
            <div className="flex-1 flex flex-col">
              <div
                ref={contentRef}
                className={`flex-1 overflow-y-auto p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: lineHeight,
                  fontFamily: 'Georgia, serif'
                }}
              >
                <div className="max-w-4xl mx-auto">
                  {contentLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading book content...</p>
                    </div>
                  ) : contentError ? (
                    <div className="text-center py-8">
                      <p className="text-destructive mb-4">{contentError}</p>
                      <Button onClick={fetchBookContent} variant="outline">
                        Retry Loading Content
                      </Button>
                    </div>
                  ) : contentType === "pdf" ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">PDF Book Available</h3>
                      <p className="text-muted-foreground mb-4">
                        This book is available as a PDF file. Click the button below to open it in our PDF viewer.
                      </p>
                      <Button onClick={() => setShowPDFViewer(true)} className="mb-2">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Open PDF Viewer
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Book: {book.title} by {book.author}
                      </p>
                    </div>
                  ) : (
                    bookContent.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Controls Sidebar */}
            <div className="w-80 border-l bg-muted/50 p-4 space-y-4">
              {/* Text-to-Speech Controls */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Audio Reading
                </h3>
                
                <div className="flex space-x-2">
                  {!isPlaying ? (
                    <Button
                      onClick={() => speakText()}
                      className="flex-1"
                      disabled={contentLoading || !bookContent}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {contentLoading ? "Loading..." : "Play"}
                    </Button>
                  ) : (
                    <>
                      {isPaused ? (
                        <Button onClick={resumeSpeech} className="flex-1">
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      ) : (
                        <Button onClick={pauseSpeech} className="flex-1">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      <Button onClick={stopSpeech} variant="outline">
                        <VolumeX className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>

                {/* Speech Settings */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Speed</label>
                    <Slider
                      value={[speechRate]}
                      onValueChange={([value]) => setSpeechRate(value)}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="mt-1"
                    />
                    <span className="text-xs text-muted-foreground">{speechRate}x</span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Pitch</label>
                    <Slider
                      value={[speechPitch]}
                      onValueChange={([value]) => setSpeechPitch(value)}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="mt-1"
                    />
                    <span className="text-xs text-muted-foreground">{speechPitch}</span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Volume</label>
                    <Slider
                      value={[speechVolume]}
                      onValueChange={([value]) => setSpeechVolume(value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="mt-1"
                    />
                    <span className="text-xs text-muted-foreground">{Math.round(speechVolume * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Reading Settings */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Reading Settings
                </h3>
                
                <div>
                  <label className="text-sm font-medium">Font Size</label>
                  <Slider
                    value={[fontSize]}
                    onValueChange={([value]) => setFontSize(value)}
                    min={12}
                    max={24}
                    step={1}
                    className="mt-1"
                  />
                  <span className="text-xs text-muted-foreground">{fontSize}px</span>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Line Height</label>
                  <Slider
                    value={[lineHeight]}
                    onValueChange={([value]) => setLineHeight(value)}
                    min={1.2}
                    max={2.5}
                    step={0.1}
                    className="mt-1"
                  />
                  <span className="text-xs text-muted-foreground">{lineHeight}</span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="w-full"
                >
                  {isDarkMode ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </Button>
              </div>

              {/* Navigation */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Navigation
                </h3>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevPage}
                    disabled={currentPage <= 1}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextPage}
                    disabled={currentPage >= totalPages}
                    className="flex-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <input
                    type="number"
                    value={currentPage}
                    onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                    min={1}
                    max={totalPages}
                    className="w-16 text-center border rounded px-2 py-1 text-sm"
                  />
                  <span className="text-sm text-muted-foreground ml-2">of {totalPages}</span>
                </div>
              </div>

              {/* Bookmarks */}
              {bookmarks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Bookmarks</h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {bookmarks.sort((a, b) => a - b).map((page) => (
                      <Button
                        key={page}
                        variant="ghost"
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="w-full justify-start text-left"
                      >
                        <Bookmark className="h-3 w-3 mr-2" />
                        Page {page}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>

          {/* PDF Viewer Modal */}
    {showPDFViewer && contentType === "pdf" && (
      <PDFViewer
        pdfUrl={bookContent}
        bookTitle={book.title}
        bookAuthor={book.author}
        onClose={() => {
          console.log('Closing PDF viewer')
          setShowPDFViewer(false)
        }}
      />
    )}
    </div>
  )
}
