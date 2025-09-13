"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Search, FileText, Download, Send, Eye, Clock, CheckCircle, XCircle, Trash2, Shield, Check, X } from "lucide-react"
import { MemberProfilePicture } from "@/components/ui/profile-picture"

interface DocumentRequest {
  id: string
  userId: string
  documentType: string
  requestReason: string
  dueDate?: string
  status: string
  type: string
  adminNotes?: string
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string
  user?: {
    name: string
    email: string
    profile?: {
      idDocument?: string
      proofOfAddress?: string
      additionalDocuments?: string
    }
  }
}

interface Application {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  idDocument?: string
  proofOfAddress?: string
  additionalDocuments?: string
  createdAt: string
  status: string
}

interface User {
  id: string
  name: string
  email: string
  profile?: {
    firstName: string
    lastName: string
    idDocument?: string
    proofOfAddress?: string
    additionalDocuments?: string
    profilePicture?: string
    // Verification fields
    idDocumentVerified?: boolean
    proofOfAddressVerified?: boolean
    additionalDocsVerified?: boolean
    idDocumentVerifiedAt?: string
    proofOfAddressVerifiedAt?: string
    additionalDocsVerifiedAt?: string
    idDocumentVerifiedBy?: string
    proofOfAddressVerifiedBy?: string
    additionalDocsVerifiedBy?: string
    idDocumentNotes?: string
    proofOfAddressNotes?: string
    additionalDocsNotes?: string
  }
}

export function DocumentManagement() {
  const [applications, setApplications] = useState<Application[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<Application | User | null>(null)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ userId: string; documentType: string; documentName: string } | null>(null)
  const [deleteReason, setDeleteReason] = useState("")
  const [requiredAction, setRequiredAction] = useState("")
  
  // Verification states
  const [verificationDialog, setVerificationDialog] = useState<{
    isOpen: boolean
    userId: string
    documentType: string
    documentName: string
    currentStatus: boolean
    notes: string
  } | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<Record<string, any>>({})
  const [requestForm, setRequestForm] = useState({
    documentType: "",
    requestReason: "",
    dueDate: "",
    type: "MEMBER"
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  // Type guard to check if selectedUser is an Application
  const isApplication = (user: Application | User): user is Application => {
    return 'userId' in user && 'firstName' in user && 'lastName' in user
  }

  // Helper function to get document fields from either Application or User
  const getDocumentFields = (user: Application | User) => {
    if (isApplication(user)) {
      return {
        idDocument: user.idDocument,
        proofOfAddress: user.proofOfAddress,
        additionalDocuments: user.additionalDocuments
      }
    } else {
      return {
        idDocument: user.profile?.idDocument,
        proofOfAddress: user.profile?.proofOfAddress,
        additionalDocuments: user.profile?.additionalDocuments
      }
    }
  }

  // Helper function to get verification status
  const getVerificationStatus = (user: Application | User, documentType: string) => {
    if (isApplication(user)) {
      return { verified: false, verifiedAt: null, verifiedBy: null, notes: null }
    } else {
      const profile = user.profile
      switch (documentType) {
        case "idDocument":
          return {
            verified: profile?.idDocumentVerified || false,
            verifiedAt: profile?.idDocumentVerifiedAt,
            verifiedBy: profile?.idDocumentVerifiedBy,
            notes: profile?.idDocumentNotes
          }
        case "proofOfAddress":
          return {
            verified: profile?.proofOfAddressVerified || false,
            verifiedAt: profile?.proofOfAddressVerifiedAt,
            verifiedBy: profile?.proofOfAddressVerifiedBy,
            notes: profile?.proofOfAddressNotes
          }
        case "additionalDocuments":
          return {
            verified: profile?.additionalDocsVerified || false,
            verifiedAt: profile?.additionalDocsVerifiedAt,
            verifiedBy: profile?.additionalDocsVerifiedBy,
            notes: profile?.additionalDocsNotes
          }
        default:
          return { verified: false, verifiedAt: null, verifiedBy: null, notes: null }
      }
    }
  }

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch applications and members
      const appsResponse = await fetch("/api/admin/documents")
      const appsData = await appsResponse.json()
      console.log("Applications response:", appsResponse.status, appsData)
      if (appsResponse.ok) {
        setApplications(appsData.applications || [])
        setMembers(appsData.members || [])
        console.log("Fetched members with documents:", appsData.members)
      } else {
        console.error("Failed to fetch applications:", appsResponse.status, appsData)
      }

      // Fetch users
      const usersResponse = await fetch("/api/admin/users")
      const usersData = await usersResponse.json()
      console.log("Users response:", usersResponse.status, usersData)
      if (usersResponse.ok) {
        setUsers(Array.isArray(usersData) ? usersData : [])
      } else {
        console.error("Failed to fetch users:", usersResponse.status, usersData)
      }

      // Fetch document requests
      const requestsResponse = await fetch("/api/admin/documents/requests")
      const requestsData = await requestsResponse.json()
      console.log("Document requests response:", requestsResponse.status, requestsData)
      if (requestsResponse.ok) {
        setDocumentRequests(requestsData.requests || [])
        // Debug: Log the first request to see document structure
        if (requestsData.requests && requestsData.requests.length > 0) {
          console.log("First document request:", requestsData.requests[0])
        }
      } else {
        console.error("Failed to fetch document requests:", requestsResponse.status, requestsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDocumentRequest = async () => {
    if (!selectedUser || !requestForm.documentType || !requestForm.requestReason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 'userId' in selectedUser ? selectedUser.userId : selectedUser.id,
          ...requestForm
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Document request sent successfully",
        })
        setIsRequestDialogOpen(false)
        setRequestForm({
          documentType: "",
          requestReason: "",
          dueDate: "",
          type: "MEMBER"
        })
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send request")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send document request",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const updateRequestStatus = async (requestId: string, status: string, notes?: string) => {
    try {
      const response = await fetch("/api/admin/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          status,
          adminNotes: notes
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Request status updated successfully",
        })
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update status")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update request status",
        variant: "destructive",
      })
    }
  }

  const deleteCancelledRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/documents?requestId=${requestId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Cancelled document request deleted successfully",
        })
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete request")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document request",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteDocument = (userId: string, documentType: string, documentName: string) => {
    setDeleteTarget({ userId, documentType, documentName })
    setIsDeleteConfirmOpen(true)
  }

  const deleteDocument = async () => {
    if (!deleteTarget) return

    try {
      const response = await fetch(`/api/admin/documents/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: deleteTarget.userId, 
          documentType: deleteTarget.documentType,
          deleteReason,
          requiredAction
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Document deleted successfully",
        })
        setIsDeleteConfirmOpen(false)
        setDeleteTarget(null)
        fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete document")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  const openVerificationDialog = async (userId: string, documentType: string, documentName: string) => {
    try {
      // Fetch current verification status
      const response = await fetch(`/api/admin/documents/verify?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        const verificationData = data.profile.verificationStatus[documentType]
        
        setVerificationDialog({
          isOpen: true,
          userId,
          documentType,
          documentName,
          currentStatus: verificationData?.verified || false,
          notes: verificationData?.notes || ""
        })
      } else {
        // If no verification status exists, start with false
        setVerificationDialog({
          isOpen: true,
          userId,
          documentType,
          documentName,
          currentStatus: false,
          notes: ""
        })
      }
    } catch (error) {
      console.error("Error fetching verification status:", error)
      setVerificationDialog({
        isOpen: true,
        userId,
        documentType,
        documentName,
        currentStatus: false,
        notes: ""
      })
    }
  }

  const verifyDocument = async (verified: boolean) => {
    if (!verificationDialog) return

    try {
      const response = await fetch("/api/admin/documents/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: verificationDialog.userId,
          documentType: verificationDialog.documentType,
          verified,
          notes: verificationDialog.notes
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Document ${verified ? 'verified' : 'rejected'} successfully`,
        })
        setVerificationDialog(null)
        fetchData() // Refresh data to show updated status
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to verify document")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify document",
        variant: "destructive",
      })
    }
  }

  const viewDocument = async (userId: string, documentType: string, userType: string = "member") => {
    try {
      // First check if document exists
      const checkResponse = await fetch(`/api/admin/documents/view?userId=${userId}&type=${documentType}&userType=${userType}`)
      if (checkResponse.ok) {
        const data = await checkResponse.json()
        if (data.documentUrl) {
          // Use the serve endpoint for better file handling
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      COMPLETED: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      OVERDUE: { color: "bg-red-100 text-red-800", icon: XCircle },
      CANCELLED: { color: "bg-gray-100 text-gray-800", icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const filteredApplications = applications.filter(app =>
    `${app.firstName} ${app.lastName} ${app.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    `${user.name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
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
          </div>

          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="membersWithDocs">Members with Documents</TabsTrigger>
              <TabsTrigger value="requests">Document Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="space-y-4">
              <div className="grid gap-4">
                {filteredApplications.map((app) => (
                  <Card key={app.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{app.firstName} {app.lastName}</h3>
                        <p className="text-sm text-gray-600">{app.email}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={app.status === "PENDING" ? "default" : "secondary"}>
                            {app.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Applied: {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(app)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(app)
                            setRequestForm({ ...requestForm, type: "APPLICANT" })
                            setIsRequestDialogOpen(true)
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Request
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div className="grid gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                         <div className="flex items-center space-x-3">
                           <MemberProfilePicture
                             src={user.profile?.profilePicture}
                             firstName={user.profile?.firstName}
                             lastName={user.profile?.lastName}
                             size="sm"
                           />
                           <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.profile && (
                          <p className="text-xs text-gray-500 mt-1">
                            {user.profile.firstName} {user.profile.lastName}
                          </p>
                        )}
                           </div>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setRequestForm({ ...requestForm, type: "MEMBER" })
                            setIsRequestDialogOpen(true)
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Request
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="membersWithDocs" className="space-y-4">
              <div className="grid gap-4">
                {members.map((member) => (
                  <Card key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                                             <div className="flex-1">
                         <div className="flex items-center space-x-3">
                           <MemberProfilePicture
                             src={member.profile?.profilePicture}
                             firstName={member.profile?.firstName}
                             lastName={member.profile?.lastName}
                             size="sm"
                           />
                           <div>
                             <h3 className="font-semibold">
                               {member.profile?.firstName && member.profile?.lastName 
                                 ? `${member.profile.firstName} ${member.profile.lastName}`
                                 : member.name
                               }
                             </h3>
                             <p className="text-sm text-gray-600">{member.email}</p>
                           </div>
                         </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="default">Member</Badge>
                          {member.profile?.idDocument && (
                            <Badge variant="outline" className="text-green-600">ID Document</Badge>
                          )}
                          {member.profile?.proofOfAddress && (
                            <Badge variant="outline" className="text-blue-600">Proof of Address</Badge>
                          )}
                          {member.profile?.additionalDocuments && (
                            <Badge variant="outline" className="text-purple-600">Additional Docs</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(member)
                            setIsViewDialogOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Documents
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(member)
                            setIsRequestDialogOpen(true)
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Request Document
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {members.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No members with uploaded documents found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              <div className="grid gap-4">
                {documentRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No document requests found</p>
                    <p className="text-sm">Document requests will appear here when users submit them</p>
                  </div>
                ) : (
                  documentRequests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="space-y-4">
                      {/* Request Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{request.documentType}</h3>
                            {getStatusBadge(request.status)}
                            <Badge variant="outline">{request.type}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{request.requestReason}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                            {request.dueDate && (
                              <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                            )}
                          </div>
                          {request.user && (
                            <div className="mt-2 text-xs text-gray-600">
                              <p><strong>User:</strong> {request.user.name} ({request.user.email})</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {request.status === "PENDING" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, "COMPLETED")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, "CANCELLED")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {request.status === "CANCELLED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteCancelledRequest(request.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Uploaded Documents Section */}
                      {request.user?.profile && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-sm mb-3 text-gray-700">Uploaded Documents</h4>
                          <div className="space-y-2">
                            {request.user.profile.idDocument && (
                              <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm">
                                <span className="text-green-800">Government ID</span>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-6 px-2"
                                    onClick={() => viewDocument(request.userId, "id", "member")}
                                  >
                                      <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-6 px-2"
                                      onClick={() => openVerificationDialog(request.userId, "idDocument", "Government ID")}
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      Verify
                                  </Button>
                                </div>
                              </div>
                            )}
                            {request.user.profile.proofOfAddress && (
                              <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm">
                                <span className="text-green-800">Proof of Address</span>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-6 px-2"
                                    onClick={() => viewDocument(request.userId, "address", "member")}
                                  >
                                      <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-6 px-2"
                                      onClick={() => openVerificationDialog(request.userId, "proofOfAddress", "Proof of Address")}
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      Verify
                                  </Button>
                                </div>
                              </div>
                            )}
                            {request.user.profile.additionalDocuments && (
                              <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                                <span className="text-blue-800">Additional Documents</span>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-6 px-2"
                                    onClick={() => viewDocument(request.userId, "additional", "member")}
                                  >
                                      <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-6 px-2"
                                      onClick={() => openVerificationDialog(request.userId, "additionalDocuments", "Additional Documents")}
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      Verify
                                  </Button>
                                </div>
                              </div>
                            )}
                            {!request.user.profile.idDocument && 
                             !request.user.profile.proofOfAddress && 
                             !request.user.profile.additionalDocuments && (
                              <div className="text-center py-3 text-gray-500 text-sm">
                                <FileText className="h-8 w-8 mx-auto mb-1 text-gray-300" />
                                <p>No documents uploaded yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Admin Notes Section */}
                      {request.adminNotes && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-sm mb-2 text-gray-700">Admin Notes</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{request.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Document Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentType">Document Type *</Label>
              <Select
                value={requestForm.documentType}
                onValueChange={(value) => setRequestForm({ ...requestForm, documentType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Government ID">Government ID</SelectItem>
                  <SelectItem value="Proof of Address">Proof of Address</SelectItem>
                  <SelectItem value="Income Statement">Income Statement</SelectItem>
                  <SelectItem value="Bank Statement">Bank Statement</SelectItem>
                  <SelectItem value="Utility Bill">Utility Bill</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="requestReason">Reason for Request *</Label>
              <Textarea
                id="requestReason"
                placeholder="Explain why this document is needed..."
                value={requestForm.requestReason}
                onChange={(e) => setRequestForm({ ...requestForm, requestReason: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={requestForm.dueDate}
                onChange={(e) => setRequestForm({ ...requestForm, dueDate: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRequestDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDocumentRequest}
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Documents Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>View Documents</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">
                  {isApplication(selectedUser) 
                    ? `${selectedUser.firstName} ${selectedUser.lastName}`
                    : selectedUser.name
                  }
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedUser.email}
                </p>
              </div>

              <div className="space-y-3">
                 {/* Debug: Show selected user data */}
                 <div className="p-2 bg-gray-100 text-xs text-gray-600 rounded">
                   Debug - selectedUser: {JSON.stringify(selectedUser, null, 2)}
                 </div>
                 
                <h4 className="font-medium">Available Documents</h4>
                
                                 {/* Check for documents in profile (for members) */}
                 {getDocumentFields(selectedUser).idDocument && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                    <div>
                      <p className="font-medium text-green-800">Government ID</p>
                      <p className="text-sm text-green-600">Document uploaded</p>
                    </div>
                     <div className="flex gap-2">
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => viewDocument('userId' in selectedUser ? selectedUser.userId : selectedUser.id, "id", isApplication(selectedUser) ? "applicant" : "member")}
                       >
                         <Eye className="h-4 w-4 mr-1" />
                         View
                       </Button>
                       {!isApplication(selectedUser) && (
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => openVerificationDialog(selectedUser.id, "idDocument", "Government ID")}
                         >
                           <Shield className="h-4 w-4 mr-1" />
                           Verify
                         </Button>
                       )}
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => confirmDeleteDocument(selectedUser.id, "idDocument", "Government ID")}
                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
                       >
                         <Trash2 className="h-4 w-4 mr-1" />
                         Delete
                       </Button>
                     </div>
                   </div>
                 )}

                 {getDocumentFields(selectedUser).proofOfAddress && (
                   <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                     <div>
                       <p className="font-medium text-green-800">Proof of Address</p>
                       <p className="text-sm text-green-600">Document uploaded</p>
                     </div>
                     <div className="flex gap-2">
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => viewDocument(isApplication(selectedUser) ? (selectedUser as Application).userId : (selectedUser as User).id, "address", isApplication(selectedUser) ? "applicant" : "member")}
                       >
                         <Eye className="h-4 w-4 mr-1" />
                         View
                       </Button>
                       {!isApplication(selectedUser) && (
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => openVerificationDialog(selectedUser.id, "proofOfAddress", "Proof of Address")}
                         >
                           <Shield className="h-4 w-4 mr-1" />
                           Verify
                         </Button>
                       )}
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => confirmDeleteDocument(selectedUser.id, "proofOfAddress", "Proof of Address")}
                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
                       >
                         <Trash2 className="h-4 w-4 mr-1" />
                         Delete
                       </Button>
                     </div>
                   </div>
                 )}

                 {getDocumentFields(selectedUser).additionalDocuments && (
                   <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                     <div>
                       <p className="font-medium text-blue-800">Additional Documents</p>
                       <p className="text-sm text-blue-600">Documents uploaded</p>
                     </div>
                     <div className="flex gap-2">
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => viewDocument(isApplication(selectedUser) ? (selectedUser as Application).userId : (selectedUser as User).id, "additional", isApplication(selectedUser) ? "applicant" : "member")}
                       >
                         <Eye className="h-4 w-4 mr-1" />
                         View
                       </Button>
                       {!isApplication(selectedUser) && (
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => openVerificationDialog(selectedUser.id, "additionalDocuments", "Additional Documents")}
                         >
                           <Shield className="h-4 w-4 mr-1" />
                           Verify
                         </Button>
                       )}
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => confirmDeleteDocument(selectedUser.id, "additionalDocuments", "Additional Documents")}
                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
                       >
                         <Trash2 className="h-4 w-4 mr-1" />
                         Delete
                       </Button>
                     </div>
                   </div>
                 )}

                 {/* Check for documents directly on the user object (for applicants) */}
                 {("idDocument" in selectedUser) && getDocumentFields(selectedUser).idDocument && (
                   <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                     <div>
                       <p className="font-medium text-green-800">Government ID</p>
                       <p className="text-sm text-green-600">Document uploaded</p>
                     </div>
                     <div className="flex gap-2">
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => viewDocument(isApplication(selectedUser) ? (selectedUser as Application).userId : (selectedUser as User).id, "id", isApplication(selectedUser) ? "applicant" : "member")}
                       >
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </Button>
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => confirmDeleteDocument(selectedUser.userId, "idDocument", "Government ID")}
                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
                       >
                         <Trash2 className="h-4 w-4 mr-1" />
                         Delete
                    </Button>
                     </div>
                  </div>
                )}

                 {("proofOfAddress" in selectedUser) && getDocumentFields(selectedUser).proofOfAddress && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                    <div>
                      <p className="font-medium text-green-800">Proof of Address</p>
                      <p className="text-sm text-green-600">Document uploaded</p>
                    </div>
                     <div className="flex gap-2">
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => viewDocument(isApplication(selectedUser) ? (selectedUser as Application).userId : (selectedUser as User).id, "address", isApplication(selectedUser) ? "applicant" : "member")}
                       >
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </Button>
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => confirmDeleteDocument(selectedUser.userId, "proofOfAddress", "Proof of Address")}
                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
                       >
                         <Trash2 className="h-4 w-4 mr-1" />
                         Delete
                    </Button>
                     </div>
                  </div>
                )}

                 {("additionalDocuments" in selectedUser) && getDocumentFields(selectedUser).additionalDocuments && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                    <div>
                      <p className="font-medium text-blue-800">Additional Documents</p>
                      <p className="text-sm text-blue-600">Documents uploaded</p>
                    </div>
                     <div className="flex gap-2">
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => viewDocument(isApplication(selectedUser) ? (selectedUser as Application).userId : (selectedUser as User).id, "additional", isApplication(selectedUser) ? "applicant" : "member")}
                       >
                      <Download className="h-4 w-4 mr-1" />
                      View
                    </Button>
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => confirmDeleteDocument(selectedUser.userId, "additionalDocuments", "Additional Documents")}
                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
                       >
                         <Trash2 className="h-4 w-4 mr-1" />
                         Delete
                    </Button>
                     </div>
                  </div>
                )}

                 {/* Show "no documents" message only if no documents are found */}
                 {!getDocumentFields(selectedUser).idDocument && 
                  !getDocumentFields(selectedUser).proofOfAddress && 
                  !getDocumentFields(selectedUser).additionalDocuments &&
                  !("idDocument" in selectedUser) && 
                  !("proofOfAddress" in selectedUser) && 
                  !("additionalDocuments" in selectedUser) && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No documents uploaded yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
                 </DialogContent>
       </Dialog>

       {/* Document Verification Dialog */}
       <Dialog open={verificationDialog?.isOpen || false} onOpenChange={(open) => {
         if (!open) {
           setVerificationDialog(null)
         }
       }}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle>Verify Document</DialogTitle>
           </DialogHeader>
           {verificationDialog && (
             <div className="space-y-4">
               <div className="bg-gray-50 p-3 rounded-lg">
                 <p className="font-medium">{verificationDialog.documentName}</p>
                 <p className="text-sm text-gray-600">
                   Current Status: {verificationDialog.currentStatus ? (
                     <span className="text-green-600 font-medium">Verified</span>
                   ) : (
                     <span className="text-orange-600 font-medium">Not Verified</span>
                   )}
                 </p>
               </div>
               
               <div>
                 <Label htmlFor="verificationNotes">Verification Notes</Label>
                 <Textarea
                   id="verificationNotes"
                   placeholder="Add notes about the verification (optional)..."
                   value={verificationDialog.notes}
                   onChange={(e) => setVerificationDialog({
                     ...verificationDialog,
                     notes: e.target.value
                   })}
                   rows={3}
                 />
               </div>
               
               <div className="flex justify-end gap-2">
                 <Button
                   variant="outline"
                   onClick={() => setVerificationDialog(null)}
                 >
                   Cancel
                 </Button>
                 <Button
                   variant="destructive"
                   onClick={() => verifyDocument(false)}
                   className="flex items-center"
                 >
                   <X className="h-4 w-4 mr-1" />
                   Reject
                 </Button>
                 <Button
                   onClick={() => verifyDocument(true)}
                   className="flex items-center"
                 >
                   <Check className="h-4 w-4 mr-1" />
                   Verify
                 </Button>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>

       {/* Delete Confirmation Dialog */}
       <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
         <DialogContent className="sm:max-w-[500px]">
           <DialogHeader>
             <DialogTitle>Confirm Document Deletion</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <p className="text-gray-600">
               Are you sure you want to delete the <strong>{deleteTarget?.documentName}</strong> document?
             </p>
             <p className="text-sm text-red-600">
               This action cannot be undone. The document will be permanently removed from the system.
             </p>
             
             <div className="space-y-3">
               <div>
                 <Label htmlFor="deleteReason">Reason for Deletion *</Label>
                 <Textarea
                   id="deleteReason"
                   placeholder="Explain why this document is being deleted..."
                   value={deleteReason}
                   onChange={(e) => setDeleteReason(e.target.value)}
                   rows={2}
                   required
                 />
               </div>
               
               <div>
                 <Label htmlFor="requiredAction">Required Action *</Label>
                 <Textarea
                   id="requiredAction"
                   placeholder="What does the user need to do? (e.g., 'Please re-upload a clearer copy')"
                   value={requiredAction}
                   onChange={(e) => setRequiredAction(e.target.value)}
                   rows={2}
                   required
                 />
               </div>
             </div>
             
             <div className="flex justify-end gap-2">
               <Button
                 variant="outline"
                 onClick={() => {
                   setIsDeleteConfirmOpen(false)
                   setDeleteTarget(null)
                   setDeleteReason("")
                   setRequiredAction("")
                 }}
               >
                 Cancel
               </Button>
               <Button
                 variant="destructive"
                 onClick={deleteDocument}
                 disabled={!deleteReason.trim() || !requiredAction.trim()}
               >
                 Delete Document
               </Button>
             </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
