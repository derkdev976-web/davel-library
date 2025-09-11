"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Image from 'next/image'

interface NewsItem {
  id: string
  type: string
  title: string
  description?: string
  content?: string
  date: string
  location?: string
  attendees?: number
  maxAttendees?: number
  imageUrl?: string
}

export function NewsSection() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [previousItemCount, setPreviousItemCount] = useState(0)

  useEffect(() => {
    fetchNews()
  }, [])

  // Auto-refresh content every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNews()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Refresh when user returns to tab/window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNews()
      }
    }

    const handleFocus = () => {
      fetchNews()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      // Add cache-busting parameter
      const response = await fetch(`/api/news?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        const newItems = data.items || []
        
        // Check if new content was added
        if (previousItemCount > 0 && newItems.length > previousItemCount) {
          // Subtle notification for homepage (no toast to avoid interrupting user experience)
          console.log(`New content available: ${newItems.length - previousItemCount} new item(s) added`)
        }
        
        setNewsItems(newItems)
        setPreviousItemCount(newItems.length)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">Latest News & Events</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Stay updated with the latest happenings at Davel Library
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-4">Latest News & Events</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Stay updated with the latest happenings at Davel Library
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshes every 30 seconds
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {newsItems.slice(0, 6).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <Image
                    src={item.imageUrl || "/placeholder.svg"}
                    alt={item.title}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.type === "EVENT" ? "bg-[#8B4513] dark:bg-[#d2691e] text-white" : "bg-[#D2691E] dark:bg-[#f4a460] text-white"
                      }`}
                    >
                      {item.type === "EVENT" ? "Event" : "News"}
                    </span>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{item.title}</CardTitle>
                </CardHeader>

                <CardContent className="flex-1">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {item.description || item.content?.substring(0, 100) + "..."}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    
                    {item.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{item.location}</span>
                      </div>
                    )}
                    
                    {item.attendees !== undefined && item.maxAttendees && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{item.attendees} / {item.maxAttendees} attendees</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild className="bg-[#8B4513] hover:bg-[#A0522D] text-white">
            <Link href="/news-events">
              View All News & Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
