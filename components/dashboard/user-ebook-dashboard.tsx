"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  BookOpen, 
  Download, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Calendar
} from "lucide-react"
import { BookCoverPlaceholder } from "@/components/ui/book-cover-placeholder"
import Image from 'next/image'

interface EbookReservation {
  id: string
  status: string
  reservedAt: string
  dueDate: string
  book: {
    id: string
    title: string
    author: string
    coverImage?: string

    isLocked: boolean
  }
}

export function UserEbookDashboard() {
  const [reservations, setReservations] = useState<EbookReservation[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchReservations = useCallback(async () => {
    try {
      const response = await fetch("/api/user/reservations")
      if (response.ok) {
        const data = await response.json()
        setReservations(data)
      }
    } catch (error) {
      console.error("Error fetching reservations:", error)
      toast({ title: "Error loading reservations", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])



  const handleReserveEbook = async (bookId: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}/reserve`, {
        method: "POST"
      })
      
      if (response.ok) {
        toast({ title: "Ebook reserved successfully" })
        fetchReservations()
      } else {
        const error = await response.json()
        toast({ title: error.error || "Failed to reserve ebook", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error reserving ebook:", error)
      toast({ title: "Error reserving ebook", variant: "destructive" })
    }
  }

  const handleDownloadEbook = async (bookId: string) => {
    try {
      const downloadUrl = `/api/books/${bookId}/download`
      window.open(downloadUrl, '_blank')
      toast({ title: "Download started" })
    } catch (error) {
      console.error("Error downloading ebook:", error)
      toast({ title: "Error downloading ebook", variant: "destructive" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "default"
      case "CHECKED_OUT": return "default"
      case "PENDING": return "secondary"
      case "RETURNED": return "outline"
      default: return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED": return <CheckCircle className="h-4 w-4" />
      case "CHECKED_OUT": return <BookOpen className="h-4 w-4" />
      case "PENDING": return <Clock className="h-4 w-4" />
      case "RETURNED": return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BookOpen className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>Loading your ebook reservations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Ebook Library</h2>
          <p className="text-gray-600">Manage your digital book reservations and downloads</p>
        </div>
      </div>

      {reservations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No ebook reservations yet</h3>
            <p className="text-gray-600 mb-4">
              Browse our digital collection and reserve ebooks to get started.
            </p>
            <Button onClick={() => window.location.href = '/catalog'}>
              Browse Catalog
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(reservation.status)}
                    <Badge variant={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </div>
                  {reservation.book.coverImage ? (
                    <Image 
                      src={reservation.book.coverImage} 
                      alt={reservation.book.title}
                      width={48}
                      height={64}
                      className="object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`${reservation.book.coverImage ? 'hidden' : ''} w-12 h-16`}>
                    <BookCoverPlaceholder title={reservation.book.title} size="sm" className="w-12 h-16" />
                  </div>
                </div>
                <CardTitle className="text-lg">{reservation.book.title}</CardTitle>
                <p className="text-sm text-gray-600">{reservation.book.author}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">File Type:</span>
                    <span>PDF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">File Size:</span>
                    <span>Unknown</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Downloads:</span>
                    <span>0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reserved:</span>
                    <span>{new Date(reservation.reservedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due Date:</span>
                    <span>{new Date(reservation.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {(reservation.status === "APPROVED" || reservation.status === "CHECKED_OUT") && (
                    <Button 
                      className="w-full" 
                      onClick={() => handleDownloadEbook(reservation.book.id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Ebook
                    </Button>
                  )}
                  
                  {reservation.status === "PENDING" && (
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <Clock className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                      <p className="text-sm text-yellow-800">Waiting for approval</p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 text-center">
                    Download feature coming soon
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
