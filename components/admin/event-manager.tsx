"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Calendar, Users, MapPin, Clock, Plus, Edit, Trash, Eye, 
  CheckCircle, XCircle, UserCheck, Settings
} from "lucide-react"

interface Event {
  id: string
  title: string
  content: string
  type: string
  image?: string
  isPublished: boolean
  publishedAt?: string
  eventDate?: string
  location?: string
  maxAttendees?: number
  currentAttendees: number
  visibility: string
  createdAt: string
  updatedAt: string
  attendees: Attendee[]
}

interface Attendee {
  id: string
  userId: string
  status: string
  registeredAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export function EventManager() {
  const [events, setEvents] = useState<Event[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isAttendeesDialogOpen, setIsAttendeesDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    eventDate: "",
    location: "",
    maxAttendees: "",
    visibility: "PUBLIC"
  })

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      } else {
        toast({ title: "Error fetching events", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast({ title: "Error fetching events", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      eventDate: "",
      location: "",
      maxAttendees: "",
      visibility: "PUBLIC"
    })
  }

  const openAddDialog = () => {
    setEditingEvent(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const openEditDialog = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      content: event.content,
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : "",
      location: event.location || "",
      maxAttendees: event.maxAttendees?.toString() || "",
      visibility: event.visibility
    })
    setIsDialogOpen(true)
  }

  const openAttendeesDialog = (event: Event) => {
    setSelectedEvent(event)
    setIsAttendeesDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events'
      const method = editingEvent ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({ 
          title: editingEvent ? "Event updated successfully" : "Event created successfully" 
        })
        setIsDialogOpen(false)
        fetchEvents()
      } else {
        const error = await response.json()
        toast({ title: error.error || "Error saving event", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error saving event:', error)
      toast({ title: "Error saving event", variant: "destructive" })
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({ title: "Event deleted successfully" })
        fetchEvents()
      } else {
        toast({ title: "Error deleting event", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({ title: "Error deleting event", variant: "destructive" })
    }
  }

  const handlePublishToggle = async (eventId: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished })
      })

      if (response.ok) {
        toast({ 
          title: isPublished ? "Event unpublished" : "Event published" 
        })
        fetchEvents()
      } else {
        toast({ title: "Error updating event", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast({ title: "Error updating event", variant: "destructive" })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTERED': return 'bg-blue-100 text-blue-800'
      case 'ATTENDED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading events...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Management</h2>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openAttendeesDialog(event)}
                    title="View Attendees"
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(event)}
                    title="Edit Event"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                    title="Delete Event"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {event.eventDate ? formatDate(event.eventDate) : 'No date set'}
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge variant={event.isPublished ? "default" : "secondary"}>
                    {event.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <Badge variant="outline">
                    {event.visibility}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  {event.currentAttendees}
                  {event.maxAttendees && ` / ${event.maxAttendees}`} attendees
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={event.isPublished ? "outline" : "default"}
                    onClick={() => handlePublishToggle(event.id, event.isPublished)}
                  >
                    {event.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Create New Event"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="content">Event Description</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventDate">Event Date & Time</Label>
                <Input
                  id="eventDate"
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="maxAttendees">Max Attendees (Optional)</Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                  placeholder="No limit"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Event location"
              />
            </div>

            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => setFormData({ ...formData, visibility: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="MEMBERS_ONLY">Members Only</SelectItem>
                  <SelectItem value="PRIVATE">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingEvent ? "Update Event" : "Create Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attendees Dialog */}
      <Dialog open={isAttendeesDialogOpen} onOpenChange={setIsAttendeesDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Event Attendees - {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <span>Total Attendees: {selectedEvent.attendees.length}</span>
                <span>Current: {selectedEvent.currentAttendees}</span>
                {selectedEvent.maxAttendees && (
                  <span>Max: {selectedEvent.maxAttendees}</span>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {selectedEvent.attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{attendee.user.name}</div>
                        <div className="text-sm text-gray-600">{attendee.user.email}</div>
                        <div className="text-xs text-gray-500">
                          Registered: {formatDate(attendee.registeredAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(attendee.status)}>
                          {attendee.status}
                        </Badge>
                        <Badge variant="outline">{attendee.user.role}</Badge>
                      </div>
                    </div>
                  ))}
                  
                  {selectedEvent.attendees.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No attendees registered yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
