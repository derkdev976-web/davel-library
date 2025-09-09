"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, Globe } from "lucide-react"

interface ServiceHours {
  monday_friday: string
  saturday: string
  sunday: string
  digital_library: string
}

interface ServiceHoursProps {
  className?: string
}

export function ServiceHoursSection({ className }: ServiceHoursProps) {
  const [hours, setHours] = useState<ServiceHours>({
    monday_friday: "8:00 AM - 10:00 PM",
    saturday: "9:00 AM - 8:00 PM",
    sunday: "10:00 AM - 6:00 PM",
    digital_library: "Available 24/7 online"
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchServiceHours()
  }, [])

  const fetchServiceHours = async () => {
    try {
      const response = await fetch('/api/admin/homepage')
      if (response.ok) {
        const data = await response.json()
        setHours(data.serviceHours)
      }
    } catch (error) {
      console.error('Error fetching service hours:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-[#8B4513] dark:text-[#d2691e]" />
          Service Hours
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Monday - Friday</span>
            <span className="text-gray-600 dark:text-gray-400">{hours.monday_friday}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Saturday</span>
            <span className="text-gray-600 dark:text-gray-400">{hours.saturday}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Sunday</span>
            <span className="text-gray-600 dark:text-gray-400">{hours.sunday}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="font-medium flex items-center">
                <Globe className="h-4 w-4 mr-1 text-[#8B4513] dark:text-[#d2691e]" />
                Digital Library
              </span>
              <span className="text-green-600 dark:text-green-400 font-medium">{hours.digital_library}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

