"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ResponsiveContainer } from "@/components/layout/responsive-container"
import { 
  Eye, Calendar, User, MapPin, Users, BookOpen, 
  Download, Share, Heart, Bookmark, Star, Clock
} from "lucide-react"
import NextImage from "next/image"

interface ContentDetailModalProps {
  type: "book" | "news" | "gallery"
  item: any
  children: React.ReactNode
  onReserve?: (id: string) => void
  onDownload?: (id: string) => void
  onShare?: (id: string) => void
}

export function ContentDetailModal({ 
  type, 
  item, 
  children, 
  onReserve, 
  onDownload, 
  onShare 
}: ContentDetailModalProps) {
  const [open, setOpen] = useState(false)

  const renderBookDetails = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3">
          <NextImage 
            src={item.coverImage || "/placeholder-book.jpg"} 
            alt={item.title}
            width={400}
            height={384}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="lg:w-2/3 space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-gradient">{item.title}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">by {item.author}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {item.genre?.map((genre: string) => (
              <Badge key={genre} variant="secondary">{genre}</Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">ISBN:</span> {item.isbn || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Publisher:</span> {item.publisher || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Published:</span> {item.publishedYear || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Pages:</span> {item.pages || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Language:</span> {item.language || "English"}
            </div>
            <div>
              <span className="font-semibold">Available:</span> {item.availableCopies}/{item.totalCopies}
            </div>
          </div>

          {item.summary && (
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.summary}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4">
            {onReserve && (
              <Button 
                onClick={() => onReserve(item.id)}
                className="bg-[#8B4513] hover:bg-[#A0522D]"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Reserve Book
              </Button>
            )}
            {item.isDigital && onDownload && (
              <Button variant="outline" onClick={() => onDownload(item.id)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {onShare && (
              <Button variant="outline" onClick={() => onShare(item.id)}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderNewsDetails = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {item.image && (
          <div className="lg:w-1/3">
            <NextImage 
              src={item.image} 
              alt={item.title}
              width={400}
              height={256}
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}
        <div className="lg:w-2/3 space-y-4">
          <div>
            <Badge variant={item.type === "EVENT" ? "default" : "secondary"}>
              {item.type}
            </Badge>
            <h2 className="text-3xl font-bold text-gradient mt-2">{item.title}</h2>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {item.eventDate ? new Date(item.eventDate).toLocaleDateString() : "TBD"}
            </div>
            {item.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {item.location}
              </div>
            )}
            {item.maxAttendees && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {item.currentAttendees}/{item.maxAttendees} attendees
              </div>
            )}
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: item.content }} />
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            {item.type === "EVENT" && (
              <Button className="bg-[#8B4513] hover:bg-[#A0522D]">
                <Users className="h-4 w-4 mr-2" />
                Register for Event
              </Button>
            )}
            {onShare && (
              <Button variant="outline" onClick={() => onShare(item.id)}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderGalleryDetails = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <NextImage 
            src={item.imageUrl} 
            alt={item.title}
            width={800}
            height={384}
            className="w-full h-96 object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="lg:w-1/3 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gradient">{item.title}</h2>
            {item.category && (
              <Badge variant="secondary" className="mt-2">{item.category}</Badge>
            )}
          </div>

          {item.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
            </div>
          )}

          <div className="text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-1 mb-1">
              <User className="h-4 w-4" />
              Uploaded by: {item.uploadedBy}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            {onShare && (
              <Button variant="outline" onClick={() => onShare(item.id)}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (type) {
      case "book":
        return renderBookDetails()
      case "news":
        return renderNewsDetails()
      case "gallery":
        return renderGalleryDetails()
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {type === "book" ? "Book Details" : 
             type === "news" ? "News Details" : "Gallery Details"}
          </DialogTitle>
        </DialogHeader>
        <ResponsiveContainer maxWidth="full" padding="none">
          {renderContent()}
        </ResponsiveContainer>
      </DialogContent>
    </Dialog>
  )
}

// Specialized components for each content type
export function BookDetailModal({ item, children, onReserve, onDownload, onShare }: any) {
  return (
    <ContentDetailModal 
      type="book" 
      item={item} 
      onReserve={onReserve}
      onDownload={onDownload}
      onShare={onShare}
    >
      {children}
    </ContentDetailModal>
  )
}

export function NewsDetailModal({ item, children, onShare }: any) {
  return (
    <ContentDetailModal 
      type="news" 
      item={item} 
      onShare={onShare}
    >
      {children}
    </ContentDetailModal>
  )
}

export function GalleryDetailModal({ item, children, onShare }: any) {
  return (
    <ContentDetailModal 
      type="gallery" 
      item={item} 
      onShare={onShare}
    >
      {children}
    </ContentDetailModal>
  )
}
