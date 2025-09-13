"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { FileText, Upload, Clock, CheckCircle, XCircle, Download, Trash2 } from "lucide-react"
import { ProfilePicture } from "@/components/ui/profile-picture"
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload"

interface DocumentRequest {
  id: string
  documentType: string
  requestReason: string
  dueDate?: string
  status: string
  createdAt: string
  adminNotes?: string
}

interface UploadedDocuments {
  idDocument?: string
  proofOfAddress?: string
  additionalDocuments?: string
  profilePicture?: string
}

interface DocumentNotification {
  id: string
  documentType: string
  action: string
  reason: string
  requiredAction: string
  createdAt: string
  status: string
}

export function UserDocumentManagement() {
  const { data: session } = useSession()
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocuments>({})
  const [notifications, setNotifications] = useState<DocumentNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>("Government ID")
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/user/documents")
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched documents data:", data)
        setDocumentRequests(data.documentRequests || [])
        setUploadedDocuments(data.uploadedDocuments || {})
        console.log("Set uploaded documents:", data.uploadedDocuments)
        console.log("Current state after setUploadedDocuments:", data.uploadedDocuments)
      } else {
        console.error("Failed to fetch documents:", response.status)
        const errorData = await response.json()
        console.error("Error data:", errorData)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/user/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        console.error("Failed to fetch notifications:", response.status)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }, [])

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, status: "READ" })
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, status: "READ" } : n
          )
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  useEffect(() => {
    fetchDocuments()
    fetchNotifications()
  }, [fetchDocuments, fetchNotifications])

  useEffect(() => {
    console.log("uploadedDocuments state changed:", uploadedDocuments)
  }, [uploadedDocuments])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const uploadDocument = async (documentType: string, requestId?: string) => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    // Map display names to field names
    const fieldMapping: { [key: string]: string } = {
      "Government ID": "idDocument",
      "Proof of Address": "proofOfAddress",
      "Income Statement": "additionalDocuments",
      "Bank Statement": "additionalDocuments",
      "Utility Bill": "additionalDocuments",
      "Other": "additionalDocuments"
    }

    const fieldName = fieldMapping[documentType] || documentType

    // Validate that we have a valid field name
    if (!fieldName || !["idDocument", "proofOfAddress", "additionalDocuments"].includes(fieldName)) {
      toast({
        title: "Error",
        description: "Invalid document type selected",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      
      // First, upload the file to the server
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("type", "document") // Use the document upload type

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json()
        throw new Error(uploadError.error || "Failed to upload file")
      }

      const uploadResult = await uploadResponse.json()
      console.log("Upload API response:", uploadResult)
      
      if (!uploadResult.url) {
        throw new Error("Upload API did not return a file URL")
      }
      
      const filePath = uploadResult.url // The upload API returns 'url', not 'filePath'

      // Now save the document reference to the user's profile
      const requestBody = {
        documentType: fieldName,
        filePath,
        requestId
      }
      
      console.log("Sending document upload request:", requestBody)
      
      const response = await fetch("/api/user/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        })
        setSelectedFile(null)
        setSelectedDocumentType("Government ID") // Reset to default
        fetchDocuments()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload document")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const deleteDocument = async (documentType: string) => {
    try {
      setDeleting(documentType)
      
      const response = await fetch(`/api/user/documents?documentType=${encodeURIComponent(documentType)}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Document deleted successfully",
        })
        fetchDocuments()
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
    } finally {
      setDeleting(null)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <ProfilePicture
              src={uploadedDocuments.profilePicture}
              alt="Your profile picture"
              size="lg"
              fallback="U"
            />
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Upload a profile picture to personalize your account
              </p>
              <ProfilePictureUpload
                currentPicture={uploadedDocuments.profilePicture}
                onPictureChange={(picturePath) => {
                  setUploadedDocuments(prev => ({
                    ...prev,
                    profilePicture: picturePath
                  }))
                }}
                size="md"
                showPreview={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No document requests at this time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documentRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{request.documentType}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{request.requestReason}</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                        {request.dueDate && (
                          <span>Due: {new Date(request.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                      {request.adminNotes && (
                        <p className="text-sm text-blue-600 mt-2">
                          <strong>Admin Notes:</strong> {request.adminNotes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {request.status === "PENDING" && (
                        <div className="flex flex-col gap-2">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            className="w-32"
                          />
                          <Button
                            size="sm"
                            onClick={() => uploadDocument(request.documentType, request.id)}
                            disabled={!selectedFile || uploading}
                          >
                            {uploading ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Your Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* General Document Upload Section */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-3">Upload New Document</h3>
            <div className="flex items-center gap-4">
              <Select
                value={selectedDocumentType}
                onValueChange={setSelectedDocumentType}
              >
                <SelectTrigger className="w-48">
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
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelect}
                className="flex-1"
                placeholder="Select a file to upload"
              />
              <Button
                onClick={() => uploadDocument(selectedDocumentType, undefined)}
                disabled={!selectedFile || uploading}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
            {selectedFile && (
              <p className="text-sm text-blue-700 mt-2">
                Selected: {selectedFile.name} ({selectedDocumentType})
              </p>
            )}
          </div>

          <div className="space-y-4">
            {/* Debug: Show current state */}
            <div className="p-2 bg-gray-100 text-xs text-gray-600 rounded">
              Debug - uploadedDocuments: {JSON.stringify(uploadedDocuments)}
            </div>
            
            {uploadedDocuments.idDocument && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                <div>
                  <p className="font-medium text-green-800">Government ID</p>
                  <p className="text-sm text-green-600">
                    {uploadedDocuments.idDocument ? 'Document uploaded' : 'No document'}
                  </p>
                </div>
                <div className="flex gap-2">
                                     <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => {
                       const docPath = uploadedDocuments.idDocument
                       if (docPath) {
                         // For external URLs, open directly
                         if (docPath.startsWith('http')) {
                           window.open(docPath, '_blank')
                         } else {
                           // For local files, use the member serving API
                           const serveUrl = `/api/member/documents/serve?type=id`
                           window.open(serveUrl, '_blank')
                         }
                       }
                     }}
                   >
                     <Download className="h-4 w-4 mr-1" />
                     View
                   </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteDocument("idDocument")}
                    disabled={deleting === "idDocument"}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deleting === "idDocument" ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            )}

            {uploadedDocuments.proofOfAddress && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                <div>
                  <p className="font-medium text-green-800">Proof of Address</p>
                  <p className="text-sm text-green-600">
                    {uploadedDocuments.proofOfAddress ? 'Document uploaded' : 'No document'}
                  </p>
                </div>
                <div className="flex gap-2">
                                     <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => {
                       const docPath = uploadedDocuments.proofOfAddress
                       if (docPath) {
                         // For external URLs, open directly
                         if (docPath.startsWith('http')) {
                           window.open(docPath, '_blank')
                         } else {
                           // For local files, use the member serving API
                           const serveUrl = `/api/member/documents/serve?type=address`
                           window.open(serveUrl, '_blank')
                         }
                       }
                     }}
                   >
                     <Download className="h-4 w-4 mr-1" />
                     View
                   </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteDocument("proofOfAddress")}
                    disabled={deleting === "proofOfAddress"}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deleting === "proofOfAddress" ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            )}

            {uploadedDocuments.additionalDocuments && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                <div>
                  <p className="font-medium text-blue-800">Additional Documents</p>
                  <p className="text-sm text-blue-600">
                    {uploadedDocuments.additionalDocuments ? 'Documents uploaded' : 'No documents'}
                  </p>
                </div>
                <div className="flex gap-2">
                                     <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => {
                       const docPath = uploadedDocuments.additionalDocuments
                       if (docPath) {
                         // For external URLs, open directly
                         if (docPath.startsWith('http')) {
                           window.open(docPath, '_blank')
                         } else {
                           // For local files, use the member serving API
                           const serveUrl = `/api/member/documents/serve?type=additional`
                           window.open(serveUrl, '_blank')
                         }
                       }
                     }}
                   >
                     <Download className="h-4 w-4 mr-1" />
                     View
                   </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => deleteDocument("additionalDocuments")}
                    disabled={deleting === "additionalDocuments"}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deleting === "additionalDocuments" ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            )}

            {(!uploadedDocuments.idDocument && 
              !uploadedDocuments.proofOfAddress && 
              !uploadedDocuments.additionalDocuments) && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No documents uploaded yet</p>
                <p className="text-sm mt-1">Documents will appear here once you upload them</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload New Document */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="documentType">Document Type</Label>
              <select
                id="documentType"
                className="w-full p-2 border border-gray-300 rounded-md mt-1"
                onChange={(e) => setSelectedFile(null)}
              >
                <option value="">Select document type</option>
                <option value="idDocument">Government ID</option>
                <option value="proofOfAddress">Proof of Address</option>
                <option value="additionalDocuments">Additional Documents</option>
              </select>
            </div>

            <div>
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: PDF, JPG, PNG (Max size: 5MB)
              </p>
            </div>

            <Button
              onClick={() => uploadDocument("additionalDocuments")}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Document Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border rounded-lg ${
                    notification.status === "ACTIVE" 
                      ? "bg-red-50 border-red-200" 
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={notification.action === "DELETED" ? "destructive" : "secondary"}>
                          {notification.action}
                        </Badge>
                        {notification.status === "ACTIVE" && (
                          <Badge variant="default">New</Badge>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-1">
                        {notification.documentType} Document {notification.action.toLowerCase()}
                      </h4>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Reason:</span>
                          <p className="text-gray-600 mt-1">{notification.reason}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium text-gray-700">Required Action:</span>
                          <p className="text-gray-600 mt-1">{notification.requiredAction}</p>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    {notification.status === "ACTIVE" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
