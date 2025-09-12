"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  UserCheck, UserX, Eye, Clock, CheckCircle, XCircle, 
  Search, Filter, Calendar, Mail, Phone, MapPin, FileText
} from "lucide-react"

interface Application {
  id: string
  userId?: string
  name: string
  email: string
  phone?: string
  address?: string
  appliedAt: string
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"
  notes?: string
  reviewedBy?: string
  reviewedAt?: string
  // Document fields
  idDocument?: string
  proofOfAddress?: string
  additionalDocuments?: string
  source?: string
}

export function ApplicationsManager() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [reviewNotes, setReviewNotes] = useState("")
  const { toast } = useToast()

  const viewDocument = async (userId: string, documentType: string, userType: string = "applicant") => {
    try {
      // First check if document exists
      const checkResponse = await fetch(`/api/admin/documents/view?userId=${userId}&type=${documentType}&userType=${userType}`)
      if (checkResponse.ok) {
        const data = await checkResponse.json()
        if (data.documentUrl) {
          // Use the new serve endpoint for better file handling
          const serveUrl = `/api/admin/documents/serve?userId=${userId}&type=${documentType}&userType=${userType}`
          window.open(serveUrl, '_blank')
        } else {
          toast({ title: "Document not found", variant: "destructive" })
        }
      } else {
        const errorData = await checkResponse.json()
        toast({ title: errorData.error || "Error viewing document", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error viewing document:', error)
      toast({ title: "Error viewing document", variant: "destructive" })
    }
  }

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/applications')
      if (response.ok) {
        const data = await response.json()
        setApplications(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({ title: "Error fetching applications", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          notes: reviewNotes,
          reviewedBy: "admin",
          reviewedAt: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        toast({ title: `Application ${status.toLowerCase()} successfully` })
        setIsViewDialogOpen(false)
        setReviewNotes("")
        fetchApplications()
      } else {
        toast({ title: "Error updating application", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast({ title: "Error updating application", variant: "destructive" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "UNDER_REVIEW": return "bg-blue-100 text-blue-800"
      case "APPROVED": return "bg-green-100 text-green-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4" />
      case "UNDER_REVIEW": return <Eye className="h-4 w-4" />
      case "APPROVED": return <CheckCircle className="h-4 w-4" />
      case "REJECTED": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || app.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Membership Applications</h2>
          <p className="text-gray-600">Review and manage membership applications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {applications.filter(app => app.status === "PENDING").length} Pending
          </Badge>
          <Badge variant="outline" className="text-sm">
            {applications.filter(app => app.status === "UNDER_REVIEW").length} Under Review
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(application.status)}
                      <Badge className={getStatusColor(application.status)}>
                        {application.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{application.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{application.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Applied: {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                      {/* Document indicators */}
                      {(application.idDocument || application.proofOfAddress || application.additionalDocuments) && (
                        <div className="flex items-center space-x-1 mt-1">
                          {application.idDocument && (
                            <div className="flex items-center space-x-1">
                              <FileText className="h-3 w-3 text-blue-600" />
                              <span className="text-xs text-blue-600">ID</span>
                            </div>
                          )}
                          {application.proofOfAddress && (
                            <div className="flex items-center space-x-1">
                              <FileText className="h-3 w-3 text-green-600" />
                              <span className="text-xs text-green-600">Address</span>
                            </div>
                          )}
                          {application.additionalDocuments && (
                            <div className="flex items-center space-x-1">
                              <FileText className="h-3 w-3 text-purple-600" />
                              <span className="text-xs text-purple-600">Additional</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedApplication(application)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm font-medium">{selectedApplication.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{selectedApplication.email}</p>
                </div>
                {selectedApplication.phone && (
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm font-medium">{selectedApplication.phone}</p>
                  </div>
                )}
                {selectedApplication.address && (
                  <div>
                    <Label>Address</Label>
                    <p className="text-sm font-medium">{selectedApplication.address}</p>
                  </div>
                )}
                <div>
                  <Label>Applied Date</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedApplication.status)}>
                    {selectedApplication.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              
              {/* Documents Section */}
              {(selectedApplication.idDocument || selectedApplication.proofOfAddress || selectedApplication.additionalDocuments) && (
                <div>
                  <Label>Documents</Label>
                  <div className="space-y-2 mt-2">
                    {selectedApplication.idDocument && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">ID Document</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => selectedApplication.userId && viewDocument(selectedApplication.userId, "idDocument", selectedApplication.source === "database" ? "applicant" : "member")}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    )}
                    {selectedApplication.proofOfAddress && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Proof of Address</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => selectedApplication.userId && viewDocument(selectedApplication.userId, "proofOfAddress", selectedApplication.source === "database" ? "applicant" : "member")}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    )}
                    {selectedApplication.additionalDocuments && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Additional Documents</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => selectedApplication.userId && viewDocument(selectedApplication.userId, "additionalDocuments", selectedApplication.source === "database" ? "applicant" : "member")}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedApplication.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm">{selectedApplication.notes}</p>
                </div>
              )}
              
              <div>
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review notes..."
                  rows={3}
                />
              </div>
              
              {selectedApplication.status === "PENDING" && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleStatusUpdate(selectedApplication.id, "UNDER_REVIEW")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mark Under Review
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedApplication.id, "APPROVED")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedApplication.id, "REJECTED")}
                    variant="destructive"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
              
              {selectedApplication.status === "UNDER_REVIEW" && (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleStatusUpdate(selectedApplication.id, "APPROVED")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedApplication.id, "REJECTED")}
                    variant="destructive"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
