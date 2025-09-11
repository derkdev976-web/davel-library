"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { 
  Users, 
  MapPin, 
  Clock, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Star,
  Wifi,
  Monitor,
  Coffee,
  BookOpen,
  Lightbulb,
  Zap,
  Heart,
  Sparkles,
  Crown,
  Gift,
  Trophy,
  Target,
  Rocket
} from "lucide-react"

interface StudySpace {
  id: string
  name: string
  description: string
  capacity: number
  location: string
  amenities: string[]
  hourlyRate: number
  image?: string
  isActive: boolean
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

interface StudyBooking {
  id: string
  userId: string
  spaceId: string
  startTime: string
  endTime: string
  duration: number
  totalCost: number
  status: "CONFIRMED" | "PENDING" | "CANCELLED" | "COMPLETED"
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  space: {
    id: string
    name: string
    location: string
    capacity: number
  }
}

export default function StudySpacesPage() {
  const { data: session } = useSession()
  const [spaces, setSpaces] = useState<StudySpace[]>([])
  const [userBookings, setUserBookings] = useState<StudyBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<StudySpace | null>(null)
  const { toast } = useToast()

  const [bookingData, setBookingData] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    duration: ""
  })

  const fetchSpaces = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/study-spaces')
      if (response.ok) {
        const data = await response.json()
        setSpaces(data.spaces || [])
      }
    } catch (error) {
      console.error('Error fetching study spaces:', error)
      toast({ title: "Error fetching study spaces", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchUserBookings = useCallback(async () => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch(`/api/study-bookings?userId=${session.user.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchSpaces()
    if (session?.user?.id) {
      fetchUserBookings()
    }
  }, [fetchSpaces, fetchUserBookings, session?.user?.id])

  const openBookingDialog = (space: StudySpace) => {
    if (!session) {
      toast({ 
        title: "Please sign in to book a study space", 
        variant: "destructive" 
      })
      return
    }
    
    setSelectedSpace(space)
    setIsBookingDialogOpen(true)
  }

  const handleBookingSubmit = async () => {
    if (!selectedSpace || !session?.user?.id) return

    try {
      const startDateTime = new Date(`${bookingData.startDate}T${bookingData.startTime}`)
      const endDateTime = new Date(`${bookingData.endDate}T${bookingData.endTime}`)
      const duration = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60) // hours

      if (duration <= 0) {
        toast({ 
          title: "End time must be after start time", 
          variant: "destructive" 
        })
        return
      }

      const response = await fetch('/api/study-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: selectedSpace.id,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          duration: duration.toString()
        })
      })

      if (response.ok) {
        toast({ title: "Study space booking requested successfully!" })
        setIsBookingDialogOpen(false)
        setBookingData({
          startDate: "",
          startTime: "",
          endDate: "",
          endTime: "",
          duration: ""
        })
        fetchUserBookings()
      } else {
        const errorData = await response.json()
        toast({ 
          title: "Error booking study space", 
          description: errorData.error,
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error('Error booking study space:', error)
      toast({ title: "Error booking study space", variant: "destructive" })
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-4 w-4" />
      case 'monitor':
      case 'screen':
        return <Monitor className="h-4 w-4" />
      case 'coffee':
      case 'refreshments':
        return <Coffee className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading study spaces...</p>
          </div>
        </div>
      </div>
    )
  }

  // Random elements for enhanced design
  const randomIcons = [BookOpen, Lightbulb, Zap, Heart, Sparkles, Crown, Gift, Trophy, Target, Rocket]
  const randomIcon = randomIcons[Math.floor(Math.random() * randomIcons.length)]
  const RandomIcon = randomIcon

  // Random motivational quotes
  const quotes = [
    "Knowledge is power, but enthusiasm pulls the switch!",
    "Study hard, dream big, achieve more!",
    "Every expert was once a beginner!",
    "Success is the sum of small efforts repeated day in and day out!",
    "The future belongs to those who believe in the beauty of their dreams!"
  ]
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                <RandomIcon className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Study Spaces
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
              Book a quiet study space for your academic work. Choose from our variety of rooms 
              equipped with modern amenities to enhance your learning experience.
            </p>
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-700/30">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 italic">
                💡 "{randomQuote}"
              </p>
            </div>
          </div>
        </div>

        {/* Free Classes Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-500 text-white">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                    Free Study Sessions Available!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Join our free study groups and collaborative learning sessions
                  </p>
                </div>
              </div>
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                <Sparkles className="h-3 w-3 mr-1" />
                FREE
              </Badge>
            </div>
          </div>
        </div>

        {/* User Bookings Section */}
        {session && userBookings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                My Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{booking.space.name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.startTime).toLocaleDateString()} at{" "}
                        {new Date(booking.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {new Date(booking.endTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.duration} hours • ${booking.totalCost}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                ))}
                {userBookings.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{userBookings.length - 3} more bookings
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Study Spaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((space, index) => {
            const cardColors = [
              "from-blue-500 to-purple-600",
              "from-green-500 to-teal-600", 
              "from-pink-500 to-rose-600",
              "from-orange-500 to-red-600",
              "from-indigo-500 to-blue-600",
              "from-emerald-500 to-green-600"
            ]
            const randomColor = cardColors[index % cardColors.length]
            
            return (
            <Card key={space.id} className="group hover:shadow-2xl transition-all duration-500 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden hover:scale-105">
              <div className={`h-2 bg-gradient-to-r ${randomColor}`}></div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors duration-300">{space.name}</CardTitle>
                  <Badge className={
                    space.isAvailable && space.isActive 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-red-100 text-red-800 border-red-200"
                  }>
                    {space.isAvailable && space.isActive ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {space.capacity} people
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {space.location}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{space.description}</p>
                
                {space.amenities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Amenities:</p>
                    <div className="flex flex-wrap gap-2">
                      {space.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${space.hourlyRate}/hour
                    </span>
                    {Math.random() > 0.7 && (
                      <span className="text-xs text-orange-600 font-medium">
                        <Crown className="h-3 w-3 inline mr-1" />
                        Premium Space
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={() => openBookingDialog(space)}
                    disabled={!space.isAvailable || !space.isActive}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>

        {spaces.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No study spaces available at the moment.</p>
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book {selectedSpace?.name}</DialogTitle>
          </DialogHeader>
          {selectedSpace && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold">{selectedSpace.name}</h3>
                <p className="text-sm text-gray-600">{selectedSpace.location}</p>
                <p className="text-sm text-gray-600">Capacity: {selectedSpace.capacity} people</p>
                <p className="text-lg font-semibold text-green-600">${selectedSpace.hourlyRate}/hour</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={bookingData.startTime}
                    onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                    min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={bookingData.endTime}
                    onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                  />
                </div>
              </div>

              {bookingData.startDate && bookingData.startTime && bookingData.endDate && bookingData.endTime && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Duration:</strong> {
                      (() => {
                        const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`)
                        const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`)
                        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                        return hours > 0 ? `${hours.toFixed(1)} hours` : "Invalid time range"
                      })()
                    }
                  </p>
                  <p className="text-sm">
                    <strong>Total Cost:</strong> {
                      (() => {
                        const start = new Date(`${bookingData.startDate}T${bookingData.startTime}`)
                        const end = new Date(`${bookingData.endDate}T${bookingData.endTime}`)
                        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                        return hours > 0 ? `$${(hours * selectedSpace.hourlyRate).toFixed(2)}` : "$0.00"
                      })()
                    }
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBookingSubmit}
              disabled={!bookingData.startDate || !bookingData.startTime || !bookingData.endDate || !bookingData.endTime}
            >
              Request Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}