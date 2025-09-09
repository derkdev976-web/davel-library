"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Calendar, Globe } from "lucide-react"

interface Statistics {
  books_available: string
  active_members: string
  events_this_year: string
  digital_resources: string
}

interface ImpactStatsProps {
  className?: string
}

export function ImpactStats({ className }: ImpactStatsProps) {
  const [stats, setStats] = useState<Statistics>({
    books_available: "10,000+",
    active_members: "2,500+",
    events_this_year: "150+",
    digital_resources: "5,000+"
  })
  const [impactMessage, setImpactMessage] = useState("Join thousands of readers who have made Davel Library their literary home")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/homepage')
      if (response.ok) {
        const data = await response.json()
        setStats(data.statistics)
        setImpactMessage(data.hero.impact_message)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const statsData = [
    {
      label: "Books Available",
      value: stats.books_available,
      icon: BookOpen,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      label: "Active Members",
      value: stats.active_members,
      icon: Users,
      color: "text-green-600 dark:text-green-400"
    },
    {
      label: "Events This Year",
      value: stats.events_this_year,
      icon: Calendar,
      color: "text-orange-600 dark:text-orange-400"
    },
    {
      label: "Digital Resources",
      value: stats.digital_resources,
      icon: Globe,
      color: "text-purple-600 dark:text-purple-400"
    }
  ]

  return (
    <section className={`py-16 bg-white dark:bg-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gradient">Our Impact in Numbers</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {impactMessage}
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
                <div className="text-3xl font-bold text-[#8B4513] dark:text-[#d2691e] mb-1">
                  {stat.value}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

