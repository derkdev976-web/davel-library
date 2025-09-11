"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  Eye,
  Download
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
  bookings?: StudyBooking[]
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

export function StudySpacesManager() {
  const [spaces, setSpaces] = useState<StudySpace[]>([])
  const [bookings, setBookings] = useState<StudyBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isBookingsDialogOpen, setIsBookingsDialogOpen] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState<StudySpace | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    location: "",
    amenities: [] as string[],
    hourlyRate: "",
    image: ""
  })

  const fetchSpaces = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/study-spaces?includeBookings=true')
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

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch('/api/study-bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast({ title: "Error fetching bookings", variant: "destructive" })
    }
  }, [toast])

  useEffect(() => {
    fetchSpaces()
    fetchBookings()
  }, [fetchSpaces, fetchBookings])

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/study-spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        toast({ title: "Study space created successfully" })
        setIsAddDialogOpen(false)
        resetForm()
        fetchSpaces()
      } else {
        const errorData = await response.json()
        toast({ 
          title: "Error creating study space", 
          description: errorData.error,
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error('Error creating study space:', error)
      toast({ title: "Error creating study space", variant: "destructive" })
    }
  }

  const handleUpdate = async () => {
    if (!selectedSpace) return
    
    try {
      const response = await fetch(`/api/study-spaces/${selectedSpace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        toast({ title: "Study space updated successfully" })
        setIsEditDialogOpen(false)
        resetForm()
        fetchSpaces()
      } else {
        toast({ title: "Error updating study space", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating study space:', error)
      toast({ title: "Error updating study space", variant: "destructive" })
    }
  }

  const handleDelete = async (spaceId: string) => {
    if (!confirm("Are you sure you want to delete this study space?")) return
    
    try {
      const response = await fetch(`/api/study-spaces/${spaceId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast({ title: "Study space deleted successfully" })
        fetchSpaces()
      } else {
        const errorData = await response.json()
        toast({ 
          title: "Error deleting study space", 
          description: errorData.error,
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error('Error deleting study space:', error)
      toast({ title: "Error deleting study space", variant: "destructive" })
    }
  }

  const handleBookingStatusUpdate = async (bookingId: string, status: string) => {
    try {
      const response = await fetch(`/api/study-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        toast({ title: `Booking ${status.toLowerCase()} successfully` })
        fetchBookings()
        fetchSpaces()
      } else {
        toast({ title: "Error updating booking", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      toast({ title: "Error updating booking", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      capacity: "",
      location: "",
      amenities: [],
      hourlyRate: "",
      image: ""
    })
    setSelectedSpace(null)
  }

  const openEditDialog = (space: StudySpace) => {
    setSelectedSpace(space)
    setFormData({
      name: space.name,
      description: space.description,
      capacity: space.capacity.toString(),
      location: space.location,
      amenities: space.amenities,
      hourlyRate: space.hourlyRate.toString(),
      image: space.image || ""
    })
    setIsEditDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getSpaceStatus = (space: StudySpace) => {
    if (!space.isActive) return <Badge variant="destructive">Inactive</Badge>
    if (!space.isAvailable) return <Badge variant="destructive">Unavailable</Badge>
    return <Badge className="bg-green-100 text-green-800">Available</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading study spaces...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Spaces</p>
                <p className="text-2xl font-bold">{spaces.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold">{spaces.filter(s => s.isAvailable && s.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.status === "PENDING").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Today's Bookings</p>
                <p className="text-2xl font-bold">
                  {bookings.filter(b => {
                    const today = new Date().toDateString()
                    return new Date(b.startTime).toDateString() === today && b.status === "CONFIRMED"
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Space
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => setIsBookingsDialogOpen(true)}
        >
          <Calendar className="h-4 w-4 mr-2" />
          View Bookings
        </Button>
        <Button asChild className="bg-[#8B4513] hover:bg-[#A0522D] text-white">
          <a href="/study-spaces" target="_blank">
            <Eye className="h-4 w-4 mr-2" />
            Open Study Spaces
          </a>
        </Button>
      </div>

      {/* Study Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <Card key={space.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{space.name}</CardTitle>
                {getSpaceStatus(space)}
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
                  <div className="flex flex-wrap gap-1">
                    {space.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-green-600">
                  ${space.hourlyRate}/hour
                </span>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => openEditDialog(space)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(space.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {space.bookings && space.bookings.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Upcoming Bookings:</p>
                  <div className="space-y-2">
                    {space.bookings.slice(0, 2).map((booking) => (
                      <div key={booking.id} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium">{booking.user.name}</p>
                          <p className="text-gray-600">
                            {new Date(booking.startTime).toLocaleDateString()} at{" "}
                            {new Date(booking.startTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    ))}
                    {space.bookings.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{space.bookings.length - 2} more bookings
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Space Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Study Space</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Space Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Study Room A"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the study space..."
              />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="Number of people"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Floor 2, Room 201"
              />
            </div>
            <div>
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input
                id="amenities"
                value={formData.amenities.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  amenities: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                placeholder="e.g., Whiteboard, WiFi, Power outlets"
              />
            </div>
            <div>
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Space</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Space Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Study Space</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Space Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Study Room A"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the study space..."
              />
            </div>
            <div>
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="Number of people"
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Floor 2, Room 201"
              />
            </div>
            <div>
              <Label htmlFor="edit-amenities">Amenities (comma-separated)</Label>
              <Input
                id="edit-amenities"
                value={formData.amenities.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  amenities: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                placeholder="e.g., Whiteboard, WiFi, Power outlets"
              />
            </div>
            <div>
              <Label htmlFor="edit-hourlyRate">Hourly Rate ($)</Label>
              <Input
                id="edit-hourlyRate"
                type="number"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Space</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bookings Dialog */}
      <Dialog open={isBookingsDialogOpen} onOpenChange={setIsBookingsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Study Space Bookings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No bookings found</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{booking.space.name}</h3>
                          <p className="text-sm text-gray-600">{booking.space.location}</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">User</p>
                          <p>{booking.user.name}</p>
                          <p className="text-sm text-gray-500">{booking.user.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Date & Time</p>
                          <p>{new Date(booking.startTime).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.startTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {new Date(booking.endTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Duration & Cost</p>
                          <p>{booking.duration} hours</p>
                          <p className="text-sm text-gray-500">${booking.totalCost}</p>
                        </div>
                      </div>

                      {booking.status === "PENDING" && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleBookingStatusUpdate(booking.id, "CONFIRMED")}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleBookingStatusUpdate(booking.id, "CANCELLED")}
                            size="sm"
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
