"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Printer, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  FileText,
  Calendar
} from "lucide-react"

interface PrintingRequest {
  id: string
  userId: string
  userName: string
  documentName: string
  pages: number
  copies: number
  paperSize: string
  color: boolean
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  requestedAt: string
  completedAt?: string
  notes?: string
}

interface PrintingRequestsTableProps {
  requests: PrintingRequest[]
  onStatusUpdate?: (id: string, status: string) => void
}

export function PrintingRequestsTable({ requests, onStatusUpdate }: PrintingRequestsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<PrintingRequest | null>(null)

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800 border-blue-200"
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200"
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200"
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
            placeholder="Search by document name or user..."
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
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
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
              <Printer className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
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
              <FileText className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Total Pages</p>
                <p className="text-2xl font-bold text-gray-600">
                  {requests.reduce((sum, r) => sum + (r.pages * r.copies), 0)}
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
            <Printer className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No printing requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {request.documentName}
                      </h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                      {request.color && (
                        <Badge variant="outline" className="text-purple-600 border-purple-600">
                          Color
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{request.userName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{request.pages} pages × {request.copies} copies</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Printer className="h-4 w-4" />
                        <span>{request.paperSize}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(request.requestedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {request.notes && (
                      <p className="text-sm text-gray-500 mt-2 italic">&ldquo;{request.notes}&rdquo;</p>
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
                          <SelectItem value="IN_PROGRESS">Start</SelectItem>
                          <SelectItem value="COMPLETED">Complete</SelectItem>
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
            <CardTitle>Printing Request Details</CardTitle>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              <XCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Document Name</label>
                <p className="text-lg font-semibold">{selectedRequest.documentName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge className={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status.replace('_', ' ')}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User</label>
                <p>{selectedRequest.userName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Pages</label>
                <p>{selectedRequest.pages} pages × {selectedRequest.copies} copies</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Paper Size</label>
                <p>{selectedRequest.paperSize}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Color</label>
                <p>{selectedRequest.color ? "Yes" : "No"}</p>
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
