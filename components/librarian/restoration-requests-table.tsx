"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BookMarked, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  BookOpen,
  Calendar,
  AlertTriangle,
  Wrench
} from "lucide-react"

interface RestorationRequest {
  id: string
  userId: string
  userName: string
  bookTitle: string
  bookAuthor: string
  bookIsbn?: string
  damageType: string
  damageDescription: string
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  status: "PENDING" | "ASSESSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  estimatedCost?: number
  actualCost?: number
  requestedAt: string
  completedAt?: string
  notes?: string
}

interface RestorationRequestsTableProps {
  requests: RestorationRequest[]
  onStatusUpdate?: (id: string, status: string) => void
}

export function RestorationRequestsTable({ requests, onStatusUpdate }: RestorationRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<RestorationRequest | null>(null)

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.bookAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesUrgency = urgencyFilter === "all" || request.urgency === urgencyFilter
    return matchesSearch && matchesStatus && matchesUrgency
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "ASSESSED": return "bg-blue-100 text-blue-800 border-blue-200"
      case "IN_PROGRESS": return "bg-orange-100 text-orange-800 border-orange-200"
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200"
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "LOW": return "bg-green-100 text-green-800 border-green-200"
      case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200"
      case "CRITICAL": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleStatusChange = (requestId: string, newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(requestId, newStatus)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by book title, author, or user..."
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
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="ASSESSED">Assessed</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === "PENDING").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-orange-600">
                  {requests.filter(r => r.status === "IN_PROGRESS").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === "COMPLETED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.urgency === "CRITICAL").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookMarked className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No restoration requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {request.bookTitle}
                      </h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {request.urgency}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4" />
                        <span>by {request.bookAuthor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{request.userName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{request.damageType}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(request.requestedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{request.damageDescription}</p>
                    {request.estimatedCost && (
                      <p className="text-sm text-blue-600 mt-1">
                        Estimated Cost: R{request.estimatedCost}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {request.status === "PENDING" && (
                      <Select
                        value={request.status}
                        onValueChange={(value) => handleStatusChange(request.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ASSESSED">Assess</SelectItem>
                          <SelectItem value="IN_PROGRESS">Start</SelectItem>
                          <SelectItem value="CANCELLED">Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {request.status === "ASSESSED" && (
                      <Select
                        value={request.status}
                        onValueChange={(value) => handleStatusChange(request.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="IN_PROGRESS">Start</SelectItem>
                          <SelectItem value="CANCELLED">Cancel</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {request.status === "IN_PROGRESS" && (
                      <Select
                        value={request.status}
                        onValueChange={(value) => handleStatusChange(request.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="COMPLETED">Complete</SelectItem>
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

      {/* Request Details Modal */}
      {selectedRequest && (
        <Card className="fixed inset-4 z-50 bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Restoration Request Details</CardTitle>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              <XCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Book Title</label>
                <p className="text-lg font-semibold">{selectedRequest.bookTitle}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Author</label>
                <p>{selectedRequest.bookAuthor}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Urgency</label>
                <Badge className={getUrgencyColor(selectedRequest.urgency)}>
                  {selectedRequest.urgency}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User</label>
                <p>{selectedRequest.userName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Damage Type</label>
                <p>{selectedRequest.damageType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Requested At</label>
                <p>{new Date(selectedRequest.requestedAt).toLocaleString()}</p>
              </div>
              {selectedRequest.completedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Completed At</label>
                  <p>{new Date(selectedRequest.completedAt).toLocaleString()}</p>
                </div>
              )}
              {selectedRequest.estimatedCost && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Estimated Cost</label>
                  <p>R{selectedRequest.estimatedCost}</p>
                </div>
              )}
              {selectedRequest.actualCost && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Actual Cost</label>
                  <p>R{selectedRequest.actualCost}</p>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Damage Description</label>
              <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">{selectedRequest.damageDescription}</p>
            </div>
            {selectedRequest.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">{selectedRequest.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
