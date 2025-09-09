"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Video, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  Users,
  Play,
  Pause,
  Settings
} from "lucide-react"

interface OnlineMeeting {
  id: string
  title: string
  description: string
  hostId: string
  hostName: string
  meetingType: "STUDY_GROUP" | "TUTORIAL" | "CONSULTATION" | "PRESENTATION"
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED"
  scheduledAt: string
  duration: number
  maxParticipants: number
  currentParticipants: number
  meetingLink?: string
  notes?: string
}

interface OnlineMeetingsTableProps {
  meetings: OnlineMeeting[]
  onStatusUpdate?: (id: string, status: string) => void
}

export function OnlineMeetingsTable({ meetings, onStatusUpdate }: OnlineMeetingsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedMeeting, setSelectedMeeting] = useState<OnlineMeeting | null>(null)

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.hostName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || meeting.status === statusFilter
    const matchesType = typeFilter === "all" || meeting.meetingType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "bg-blue-100 text-blue-800 border-blue-200"
      case "ONGOING": return "bg-green-100 text-green-800 border-green-200"
      case "COMPLETED": return "bg-gray-100 text-gray-800 border-gray-200"
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "STUDY_GROUP": return "bg-purple-100 text-purple-800 border-purple-200"
      case "TUTORIAL": return "bg-blue-100 text-blue-800 border-blue-200"
      case "CONSULTATION": return "bg-green-100 text-green-800 border-green-200"
      case "PRESENTATION": return "bg-orange-100 text-orange-800 border-orange-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleStatusChange = (meetingId: string, newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(meetingId, newStatus)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by meeting title or host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="ONGOING">Ongoing</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="STUDY_GROUP">Study Group</SelectItem>
            <SelectItem value="TUTORIAL">Tutorial</SelectItem>
            <SelectItem value="CONSULTATION">Consultation</SelectItem>
            <SelectItem value="PRESENTATION">Presentation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {meetings.filter(m => m.status === "SCHEDULED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Ongoing</p>
                <p className="text-2xl font-bold text-green-600">
                  {meetings.filter(m => m.status === "ONGOING").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-gray-600">
                  {meetings.filter(m => m.status === "COMPLETED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Total Participants</p>
                <p className="text-2xl font-bold text-purple-600">
                  {meetings.reduce((sum, m) => sum + m.currentParticipants, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meetings List */}
      <div className="space-y-3">
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Video className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No online meetings found</p>
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {meeting.title}
                      </h3>
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                      <Badge className={getTypeColor(meeting.meetingType)}>
                        {meeting.meetingType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Host: {meeting.hostName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(meeting.scheduledAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(meeting.duration)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{meeting.currentParticipants}/{meeting.maxParticipants}</span>
                      </div>
                    </div>
                    {meeting.description && (
                      <p className="text-sm text-gray-500 mt-2">{meeting.description}</p>
                    )}
                    {meeting.meetingLink && meeting.status === "ONGOING" && (
                      <div className="mt-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                            <Play className="h-4 w-4 mr-1" />
                            Join Meeting
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMeeting(meeting)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {meeting.status === "SCHEDULED" && (
                      <Select
                        value={meeting.status}
                        onValueChange={(value) => handleStatusChange(meeting.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ONGOING">Start</SelectItem>
                          <SelectItem value="CANCELLED">Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {meeting.status === "ONGOING" && (
                      <Select
                        value={meeting.status}
                        onValueChange={(value) => handleStatusChange(meeting.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COMPLETED">End</SelectItem>
                          <SelectItem value="CANCELLED">Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <Card className="fixed inset-4 z-50 bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Meeting Details</CardTitle>
            <Button variant="outline" onClick={() => setSelectedMeeting(null)}>
              <XCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Meeting Title</label>
                <p className="text-lg font-semibold">{selectedMeeting.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge className={getStatusColor(selectedMeeting.status)}>
                  {selectedMeeting.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <Badge className={getTypeColor(selectedMeeting.meetingType)}>
                  {selectedMeeting.meetingType.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Host</label>
                <p>{selectedMeeting.hostName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Scheduled At</label>
                <p>{new Date(selectedMeeting.scheduledAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Duration</label>
                <p>{formatDuration(selectedMeeting.duration)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Participants</label>
                <p>{selectedMeeting.currentParticipants}/{selectedMeeting.maxParticipants}</p>
              </div>
              {selectedMeeting.meetingLink && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Meeting Link</label>
                  <Button size="sm" variant="outline" asChild className="mt-1">
                    <a href={selectedMeeting.meetingLink} target="_blank" rel="noopener noreferrer">
                      <Play className="h-4 w-4 mr-1" />
                      Join Meeting
                    </a>
                  </Button>
                </div>
              )}
            </div>
            {selectedMeeting.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">{selectedMeeting.description}</p>
              </div>
            )}
            {selectedMeeting.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">{selectedMeeting.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
