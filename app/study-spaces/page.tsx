"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { 
  Search, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Wifi, 
  Power, 
  Monitor,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"
import Image from "next/image"

interface StudySpace {
  id: string
  name: string
  description: string
  capacity: number
  location: string
  amenities: string[]
  hourlyRate: number
  isAvailable: boolean
  image?: string
}

interface Booking {
  id: string
  spaceId: string
  userId: string
  startTime: string
  endTime: string
  status: string
  createdAt: string
  space: StudySpace
  user: {
    id: string
    name: string
    email: string
  }
}

export default function StudySpacesPage() {
  const [spaces, setSpaces] = useState<StudySpace[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredSpaces, setFilteredSpaces] = useState<StudySpace[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCapacity, setSelectedCapacity] = useState("all")
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<StudySpace | null>(null)
  const [bookingDetails, setBookingDetails] = useState({
    startTime: "",
    endTime: "",
    date: ""
  })
  const { toast } = useToast()

  const fetchSpaces = useCallback(async () => {
    try {
      const response = await fetch("/api/study-spaces")
      if (response.ok) {
        const data = await response.json()
        setSpaces(data)
      }
    } catch (error) {
      console.error("Error fetching study spaces:", error)
      toast({ title: "Error loading study spaces", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch("/api/study-bookings")
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error("Error fetching bookings:", error)
    }
  }, [])

  const filterSpaces = useCallback(() => {
    let filtered = spaces

    if (searchTerm) {
      filtered = filtered.filter(space =>
        space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCapacity !== "all") {
      const capacity = parseInt(selectedCapacity)
      filtered = filtered.filter(space => space.capacity >= capacity)
    }

    setFilteredSpaces(filtered)
  }, [spaces, searchTerm, selectedCapacity])

  useEffect(() => {
    fetchSpaces()
    fetchBookings()
  }, [fetchSpaces, fetchBookings])

  useEffect(() => {
    filterSpaces()
  }, [filterSpaces])

  const handleBookSpace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSpace) return

    try {
      const response = await fetch("/api/study-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spaceId: selectedSpace.id,
          startTime: `${bookingDetails.date}T${bookingDetails.startTime}`,
          endTime: `${bookingDetails.date}T${bookingDetails.endTime}`
        })
      })
      
      if (response.ok) {
        toast({ title: "Study space booked successfully!" })
        setShowBookingForm(false)
        setSelectedSpace(null)
        setBookingDetails({ startTime: "", endTime: "", date: "" })
        fetchBookings()
      } else {
        const error = await response.json()
        toast({ title: error.error || "Failed to book space", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error booking space:", error)
      toast({ title: "Error booking space", variant: "destructive" })
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/study-bookings/${bookingId}`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        toast({ title: "Booking cancelled successfully" })
        fetchBookings()
      } else {
        toast({ title: "Failed to cancel booking", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
      toast({ title: "Error cancelling booking", variant: "destructive" })
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi": return <Wifi className="h-4 w-4" />
      case "power outlets": return <Power className="h-4 w-4" />
      case "monitor": return <Monitor className="h-4 w-4" />
      case "whiteboard": return <BookOpen className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "default"
      case "PENDING": return "secondary"
      case "CANCELLED": return "outline"
      case "COMPLETED": return "secondary"
      default: return "outline"
    }
  }

  const getBookingStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED": return <CheckCircle className="h-4 w-4" />
      case "PENDING": return <Clock className="h-4 w-4" />
      case "CANCELLED": return <XCircle className="h-4 w-4" />
      case "COMPLETED": return <CheckCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const isSpaceBooked = (spaceId: string, date: string) => {
    return bookings.some(booking => 
      booking.spaceId === spaceId && 
      booking.status === "CONFIRMED" &&
      booking.startTime.startsWith(date)
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>Loading Study Spaces...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gradient mb-4">Study Spaces</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Book quiet study rooms, group spaces, and collaborative areas
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search spaces by name, location, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedCapacity} onValueChange={setSelectedCapacity}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Minimum Capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Capacity</SelectItem>
                  <SelectItem value="1">1+ people</SelectItem>
                  <SelectItem value="2">2+ people</SelectItem>
                  <SelectItem value="4">4+ people</SelectItem>
                  <SelectItem value="6">6+ people</SelectItem>
                  <SelectItem value="8">8+ people</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredSpaces.length} spaces available
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {spaces.filter(s => s.isAvailable).length} Available
                </Badge>
                <Badge variant="secondary">
                  {bookings.filter(b => b.status === "CONFIRMED").length} Active Bookings
                </Badge>
              </div>
            </div>
          </div>

          {/* Study Spaces Grid */}
          {filteredSpaces.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No study spaces found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or check back later.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredSpaces.map((space) => (
                <Card key={space.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={space.isAvailable ? "default" : "secondary"}>
                          {space.isAvailable ? "Available" : "Occupied"}
                        </Badge>
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {space.capacity}
                        </Badge>
                      </div>
                      {space.image && (
                        <Image 
                          src={space.image} 
                          alt={space.name}
                          width={64}
                          height={48}
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                    <CardTitle className="text-lg">{space.name}</CardTitle>
                    <p className="text-sm text-gray-600">{space.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{space.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>${space.hourlyRate}/hour</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Amenities:</p>
                      <div className="flex flex-wrap gap-2">
                        {space.amenities.map(amenity => (
                          <Badge key={amenity} variant="secondary" className="text-xs">
                            {getAmenityIcon(amenity)}
                            <span className="ml-1">{amenity}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setSelectedSpace(space)
                        setShowBookingForm(true)
                      }}
                      disabled={!space.isAvailable}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {space.isAvailable ? "Book Space" : "Unavailable"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Booking Form Modal */}
          {showBookingForm && selectedSpace && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle>Book Study Space</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBookSpace} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Space</label>
                      <p className="text-sm text-gray-600">{selectedSpace.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={bookingDetails.date}
                        onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Start Time</label>
                        <Input
                          type="time"
                          value={bookingDetails.startTime}
                          onChange={(e) => setBookingDetails({...bookingDetails, startTime: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">End Time</label>
                        <Input
                          type="time"
                          value={bookingDetails.endTime}
                          onChange={(e) => setBookingDetails({...bookingDetails, endTime: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button type="submit" className="flex-1">Confirm Booking</Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowBookingForm(false)
                          setSelectedSpace(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* My Bookings */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                  <p className="text-gray-600">
                    Book a study space to see your reservations here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getBookingStatusIcon(booking.status)}
                            <Badge variant={getBookingStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-2">{booking.space.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{booking.space.location}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Date:</span>
                              <p>{new Date(booking.startTime).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Time:</span>
                              <p>
                                {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Capacity:</span>
                              <p>{booking.space.capacity} people</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Rate:</span>
                              <p>${booking.space.hourlyRate}/hour</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {booking.status === "CONFIRMED" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
