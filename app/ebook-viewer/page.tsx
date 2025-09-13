"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Download, BookOpen, FileText } from "lucide-react"
import Link from "next/link"

interface Ebook {
  id: string
  title: string
  author: string
  coverImage?: string
  downloadUrl?: string
  content?: string
  description?: string
}

export default function EbookViewerPage() {
  const searchParams = useSearchParams()
  const ebookId = searchParams.get('id')
  const { toast } = useToast()
  
  const [ebook, setEbook] = useState<Ebook | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ebookId) {
      fetchEbook()
    }
  }, [ebookId])

  const fetchEbook = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/member/ebooks/${ebookId}`)
      if (response.ok) {
        const data = await response.json()
        setEbook(data.ebook)
      } else {
        toast({ title: "Ebook not found", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error fetching ebook:", error)
      toast({ title: "Error loading ebook", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (ebook?.downloadUrl) {
      window.open(ebook.downloadUrl, '_blank')
    } else {
      toast({ title: "Download not available", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading ebook...</p>
        </div>
      </div>
    )
  }

  if (!ebook) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ebook Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The requested ebook could not be found or you don't have access to it.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ebook Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span>Ebook Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ebook.coverImage && (
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src={ebook.coverImage} 
                      alt={ebook.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {ebook.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    by {ebook.author}
                  </p>
                  
                  {ebook.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {ebook.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={handleDownload}
                    className="w-full"
                    disabled={!ebook.downloadUrl}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Ebook
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ebook Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ebook Content</CardTitle>
              </CardHeader>
              <CardContent>
                {ebook.content ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: ebook.content }} />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Content Not Available
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      The ebook content is not available for online viewing.
                    </p>
                    <Button onClick={handleDownload} disabled={!ebook.downloadUrl}>
                      <Download className="h-4 w-4 mr-2" />
                      Download to Read
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
