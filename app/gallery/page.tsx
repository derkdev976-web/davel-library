"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Tag, Eye, Search, Image as ImageIcon, RefreshCw } from "lucide-react"
import Image from 'next/image'

interface GalleryItem {
  id: string
  title: string
  description: string
  imageUrl: string
  createdAt: string
  category: string
  tags: string[]
}

export default function GalleryPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [previousItemCount, setPreviousItemCount] = useState(0)

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  // Auto-refresh content every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGallery()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [fetchGallery])

  // Refresh when user returns to tab/window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchGallery()
      }
    }

    const handleFocus = () => {
      fetchGallery()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchGallery])

  const fetchGallery = async () => {
    try {
      setLoading(true)
      // Add cache-busting parameter
      const response = await fetch(`/api/gallery?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        const newItems = data.items || []
        
        // Check if new content was added
        if (previousItemCount > 0 && newItems.length > previousItemCount) {
          toast({
            title: "New content available!",
            description: `${newItems.length - previousItemCount} new item(s) added`,
            duration: 3000
          })
        }
        
        setItems(newItems)
        setPreviousItemCount(newItems.length)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#8B4513] via-[#D2691E] to-[#CD853F] bg-clip-text text-transparent mb-4">
            Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-2xl mx-auto">
            Explore our stunning collection of images and videos showcasing library events, exhibitions, and moments
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshes every 30 seconds
            </p>
          )}
        </div>
        
        {/* Search Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                className="pl-10 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#8B4513]"
                placeholder="Search gallery..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={fetchGallery}
              disabled={loading}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white flex items-center justify-center gap-2 min-w-[120px]"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading && (
            <>
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
            </>
          )}
          
          {!loading && filteredItems.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-6xl mb-4">🖼️</div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Gallery Items Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Check back soon for new gallery content!
                </p>
              </div>
            </div>
          )}

          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className="group cursor-pointer hover:shadow-2xl transition-all duration-500 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden hover:scale-105"
              onClick={() => setSelectedItem(item)}
            >
              <div className="relative overflow-hidden">
                <Image 
                  src={item.imageUrl} 
                  alt={item.title} 
                  width={400}
                  height={256}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-4">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300">
                    {item.category}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-[#8B4513] transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(item.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden">
              <Image 
                src={selectedItem?.imageUrl || "/placeholder.svg"} 
                alt={selectedItem?.title || "Gallery image"} 
                width={800}
                height={384}
                className="w-full h-96 object-cover" 
              />
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedItem?.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  {selectedItem && new Date(selectedItem.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <Badge variant="outline" className="w-fit">
                  {selectedItem?.category}
                </Badge>
              </div>
              
              {selectedItem?.tags && selectedItem.tags.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm bg-gray-100 dark:bg-gray-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}


