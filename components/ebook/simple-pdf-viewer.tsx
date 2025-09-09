"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Download,
  BookOpen,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react'

interface SimplePDFViewerProps {
  pdfUrl: string
  bookTitle: string
  bookAuthor: string
  onClose: () => void
}

export function SimplePDFViewer({ pdfUrl, bookTitle, bookAuthor, onClose }: SimplePDFViewerProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'embedded' | 'external'>('embedded')
  const [zoom, setZoom] = useState(100)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const downloadPDF = () => {
    const link = document.createElement('a')
    const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `${window.location.origin}${pdfUrl}`
    link.href = fullUrl
    link.download = `${bookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openInNewTab = () => {
    const fullUrl = pdfUrl.startsWith('http') ? pdfUrl : `${window.location.origin}${pdfUrl}`
    window.open(fullUrl, '_blank')
  }

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'embedded' ? 'external' : 'embedded')
  }

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.max(50, Math.min(200, prev + delta)))
  }

  const resetZoom = () => {
    setZoom(100)
  }

  if (!isMounted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading PDF Viewer...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const fullPdfUrl = pdfUrl.startsWith('http') ? pdfUrl : `${window.location.origin}${pdfUrl}`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              {bookTitle} - {bookAuthor}
            </CardTitle>
            <div className="flex items-center gap-2">
              {viewMode === 'embedded' && (
                <div className="flex items-center gap-1">
                  <Button onClick={() => adjustZoom(-10)} variant="outline" size="sm">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-2">{zoom}%</span>
                  <Button onClick={() => adjustZoom(10)} variant="outline" size="sm">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button onClick={resetZoom} variant="outline" size="sm">
                    Reset
                  </Button>
                </div>
              )}
              <Button onClick={toggleViewMode} variant="outline" size="sm">
                {viewMode === 'embedded' ? 'External View' : 'Embedded View'}
              </Button>
              <Button onClick={downloadPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden">
          {viewMode === 'embedded' ? (
            <div className="h-full w-full relative">
              <iframe
                ref={iframeRef}
                src={`${fullPdfUrl}#toolbar=1&navpanes=1&scrollbar=1&zoom=${zoom}`}
                className="w-full h-full border-0"
                title={`PDF: ${bookTitle}`}
                onLoad={() => console.log('PDF iframe loaded')}
                onError={() => console.error('PDF iframe failed to load')}
              />
              <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                PDF Viewer - Zoom: {zoom}%
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
              <h3 className="text-xl font-semibold">External PDF View</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Click the button below to open the PDF in a new tab with your browser&apos;s built-in PDF viewer.
              </p>
              <Button onClick={openInNewTab} className="flex items-center">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open PDF in New Tab
              </Button>
              <div className="mt-4 p-3 bg-muted rounded text-sm max-w-md">
                <p><strong>PDF URL:</strong></p>
                <p className="break-all text-xs">{fullPdfUrl}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
