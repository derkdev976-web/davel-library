"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download,
  BookOpen,
  Loader2
} from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

interface PDFViewerProps {
  pdfUrl: string
  bookTitle: string
  bookAuthor: string
  onClose: () => void
}

export function PDFViewer({ pdfUrl, bookTitle, bookAuthor, onClose }: PDFViewerProps) {
  const [pdfDocument, setPdfDocument] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Ensure component is mounted in browser
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const loadPDF = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Ensure we're in the browser environment
      if (typeof window === 'undefined') {
        throw new Error('PDF loading requires browser environment')
      }
      
      // Create full URL for the PDF file
      const fullPdfUrl = pdfUrl.startsWith('http') ? pdfUrl : `${window.location.origin}${pdfUrl}`
      
      const pdf = await pdfjsLib.getDocument({
        url: fullPdfUrl,
        cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
      }).promise
      
      setPdfDocument(pdf)
      setTotalPages(pdf.numPages)
      setCurrentPage(1)
    } catch (err) {
      console.error('Error loading PDF:', err)
      setError(`Failed to load PDF file: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }, [pdfUrl])

  const renderPage = useCallback(async () => {
    if (!pdfDocument || !canvasRef.current) return

    try {
      const page = await pdfDocument.getPage(currentPage)
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      const viewport = page.getViewport({ scale, rotation })
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }

      await page.render(renderContext).promise
    } catch (err) {
      console.error('Error rendering page:', err)
    }
  }, [pdfDocument, currentPage, scale, rotation])

  useEffect(() => {
    if (isMounted) {
      loadPDF()
    }
  }, [pdfUrl, loadPDF, isMounted])

  useEffect(() => {
    if (pdfDocument) {
      renderPage()
    }
  }, [pdfDocument, currentPage, scale, rotation, renderPage])

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const downloadPDF = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Don't render until mounted in browser
  if (!isMounted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Initializing PDF Viewer...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading PDF...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              PDF Viewer Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-destructive">{error}</p>
            <div className="flex space-x-2">
              <Button onClick={loadPDF} variant="outline">
                Retry
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{bookTitle}</h2>
            <p className="text-sm text-muted-foreground">by {bookAuthor}</p>
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <Button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={zoomOut} variant="outline" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button onClick={zoomIn} variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button onClick={rotate} variant="outline" size="sm">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button onClick={downloadPDF} variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto p-4 bg-gray-100"
        >
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="shadow-lg border border-gray-300"
            />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Reading Progress:</span>
            <Progress 
              value={(currentPage / totalPages) * 100} 
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">
              {Math.round((currentPage / totalPages) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
