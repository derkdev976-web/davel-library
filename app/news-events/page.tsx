"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, MapPin, Users, Eye, Tag, Search, Filter, CheckCircle } from "lucide-react"
import Image from 'next/image'

interface NewsEvent {
  id: string
  title: string
  content: string
  description: string
  date: string
  imageUrl: string
  type: string
  category: string
  tags: string[]
  location?: string
  attendees?: number
  maxAttendees?: number
}

export default function NewsEventsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [items, setItems] = useState<NewsEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<NewsEvent | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [userRegistrations, setUserRegistrations] = useState<string[]>([])

  useEffect(() => {
    fetchNewsEvents()
    if (session?.user) {
      fetchUserRegistrations()
    }
  }, [session])

  const fetchNewsEvents = async () => {
    try {
      const response = await fetch('/api/news')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching news and events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !typeFilter || item.type.toLowerCase() === typeFilter.toLowerCase()
    const matchesDate = !dateFilter || item.date === dateFilter
    return matchesSearch && matchesType && matchesDate
  })

  const fetchUserRegistrations = async () => {
    try {
      const response = await fetch('/api/events/join')
      if (response.ok) {
        const data = await response.json()
        setUserRegistrations(data.registrations.map((reg: any) => reg.eventId))
      }
    } catch (error) {
      console.error('Error fetching user registrations:', error)
    }
  }

  const handleJoinEvent = async (eventId: string) => {
    if (!session?.user) {
      toast({ 
        title: "Authentication required", 
        description: "Please sign in to join events",
        variant: "destructive" 
      })
      return
    }

    if (session.user.role === "GUEST") {
      toast({ 
        title: "Membership required", 
        description: "Only approved members can join events",
        variant: "destructive" 
      })
      return
    }

    try {
      const response = await fetch('/api/events/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      })
      
      if (response.ok) {
        toast({ 
          title: "Successfully joined event!",
          description: "You have been registered for this event"
        })
        fetchUserRegistrations()
        setSelectedItem(null)
      } else {
        const error = await response.json()
        toast({ 
          title: "Error joining event", 
          description: error.error || "Failed to join event",
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error('Error joining event:', error)
      toast({ 
        title: "Error joining event", 
        description: "Please try again later",
        variant: "destructive" 
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#8B4513] via-[#D2691E] to-[#CD853F] bg-clip-text text-transparent mb-4">
            News & Events
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-2xl mx-auto">
            Stay updated with the latest happenings, announcements, and exciting events at Davel Library
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search news or events..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#8B4513]"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Filter by type (NEWS/EVENT)" 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#8B4513]"
              />
            </div>
            <Input 
              type="date" 
              placeholder="Filter by date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-white/50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#8B4513]"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && (
            <>
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </>
          )}
          
          {!loading && filteredItems.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No News or Events Found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Check back soon for updates and upcoming events!
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
                  height={224}
                  className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-4">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div className="absolute top-4 left-4">
                  <Badge 
                    variant={item.type === 'EVENT' ? 'default' : 'secondary'}
                    className="bg-[#8B4513] hover:bg-[#A0522D] text-white"
                  >
                    {item.type}
                  </Badge>
                </div>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-[#8B4513] transition-colors duration-300">
                  {item.title}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {item.description}
                </p>
                {item.type === 'EVENT' && (
                  <div className="space-y-2">
                    {userRegistrations.includes(item.id) ? (
                      <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Already Registered</span>
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-xl transition-all duration-300 hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleJoinEvent(item.id)
                        }}
                        disabled={!session?.user || session.user.role === "GUEST"}
                      >
                        {!session?.user ? "Sign in to Join" : 
                         session.user.role === "GUEST" ? "Members Only" : "Join Event"}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {selectedItem?.title}
              </DialogTitle>
              <Badge 
                variant={selectedItem?.type === 'EVENT' ? 'default' : 'secondary'}
                className="bg-[#8B4513] hover:bg-[#A0522D] text-white"
              >
                {selectedItem?.type}
              </Badge>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden">
              <Image 
                src={selectedItem?.imageUrl || "/placeholder.svg"} 
                alt={selectedItem?.title || "News/Event image"} 
                width={800}
                height={384}
                className="w-full h-96 object-cover" 
              />
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {selectedItem && new Date(selectedItem.date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {selectedItem && new Date(selectedItem.date).toLocaleTimeString()}
                </div>
                {selectedItem?.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedItem.location}
                  </div>
                )}
                {selectedItem?.attendees && selectedItem?.maxAttendees && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {selectedItem.attendees}/{selectedItem.maxAttendees} attendees
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedItem?.description}
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Full Content
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedItem?.content}
                </p>
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
              
              {selectedItem?.type === 'EVENT' && (
                <div className="pt-6">
                  {userRegistrations.includes(selectedItem.id) ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                      <CheckCircle className="h-6 w-6" />
                      <span className="font-medium text-lg">Already Registered for This Event</span>
                    </div>
                  ) : (
                    <Button 
                      className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-xl text-lg py-3 transition-all duration-300 hover:scale-105"
                      onClick={() => {
                        handleJoinEvent(selectedItem.id)
                        setSelectedItem(null)
                      }}
                      disabled={!session?.user || session.user.role === "GUEST"}
                    >
                      {!session?.user ? "Sign in to Join" : 
                       session.user.role === "GUEST" ? "Members Only" : "Join Event"}
                    </Button>
                  )}
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


