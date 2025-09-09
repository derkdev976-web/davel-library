"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Calendar,
  FileText,
  BookOpen,
  Database,
  HelpCircle
} from "lucide-react"

interface ResearchRequest {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  assignedTo?: string
  resolvedAt?: string
  resolution?: string
  user: {
    id: string
    name: string
    email: string
  }
  librarian?: {
    id: string
    name: string
    email: string
  }
}

export default function ResearchAssistancePage() {
  const [requests, setRequests] = useState<ResearchRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<ResearchRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showNewRequestForm, setShowNewRequestForm] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    category: "GENERAL",
    priority: "MEDIUM"
  })
  const { toast } = useToast()

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch("/api/research-requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("Error fetching research requests:", error)
      toast({ title: "Error loading research requests", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const filterRequests = useCallback(() => {
    let filtered = requests

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(request => request.status === selectedStatus)
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(request => request.category === selectedCategory)
    }

    setFilteredRequests(filtered)
  }, [requests, searchTerm, selectedStatus, selectedCategory])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  useEffect(() => {
    filterRequests()
  }, [filterRequests])

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/research-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRequest)
      })
      
      if (response.ok) {
        toast({ title: "Research request submitted successfully!" })
        setShowNewRequestForm(false)
        setNewRequest({ title: "", description: "", category: "GENERAL", priority: "MEDIUM" })
        fetchRequests()
      } else {
        toast({ title: "Failed to submit request", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error submitting request:", error)
      toast({ title: "Error submitting request", variant: "destructive" })
    }
  }

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/research-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        toast({ title: "Request status updated" })
        fetchRequests()
      } else {
        toast({ title: "Failed to update status", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error updating request:", error)
      toast({ title: "Error updating request", variant: "destructive" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "destructive"
      case "IN_PROGRESS": return "default"
      case "RESOLVED": return "secondary"
      case "CLOSED": return "outline"
      default: return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN": return <AlertCircle className="h-4 w-4" />
      case "IN_PROGRESS": return <Clock className="h-4 w-4" />
      case "RESOLVED": return <CheckCircle className="h-4 w-4" />
      case "CLOSED": return <XCircle className="h-4 w-4" />
      default: return <HelpCircle className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "destructive"
      case "MEDIUM": return "default"
      case "LOW": return "secondary"
      default: return "outline"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ACADEMIC": return <BookOpen className="h-4 w-4" />
      case "CITATION": return <FileText className="h-4 w-4" />
      case "DATABASE": return <Database className="h-4 w-4" />
      case "GENERAL": return <HelpCircle className="h-4 w-4" />
      default: return <HelpCircle className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Search className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>Loading Research Assistance...</p>
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
            <h1 className="text-4xl font-bold text-gradient mb-4">Research Assistance</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get expert help with your research projects, citations, and information literacy
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <Button 
              onClick={() => setShowNewRequestForm(!showNewRequestForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Submit Research Request
            </Button>
          </div>

          {/* New Request Form */}
          {showNewRequestForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Submit Research Request</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Request Title</label>
                    <Input
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                      placeholder="Brief description of your research need"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Detailed Description</label>
                    <Textarea
                      value={newRequest.description}
                      onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                      placeholder="Provide detailed information about your research topic, requirements, and any specific resources you need"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select value={newRequest.category} onValueChange={(value) => setNewRequest({...newRequest, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GENERAL">General Research</SelectItem>
                          <SelectItem value="ACADEMIC">Academic Research</SelectItem>
                          <SelectItem value="CITATION">Citation Help</SelectItem>
                          <SelectItem value="DATABASE">Database Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={newRequest.priority} onValueChange={(value) => setNewRequest({...newRequest, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button type="submit">Submit Request</Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowNewRequestForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="ACADEMIC">Academic</SelectItem>
                  <SelectItem value="CITATION">Citation</SelectItem>
                  <SelectItem value="DATABASE">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredRequests.length} requests found
              </p>
              <div className="flex gap-2">
                <Badge variant="destructive">
                  {requests.filter(r => r.status === "OPEN").length} Open
                </Badge>
                <Badge variant="default">
                  {requests.filter(r => r.status === "IN_PROGRESS").length} In Progress
                </Badge>
              </div>
            </div>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No research requests found</h3>
                <p className="text-gray-600">
                  {requests.length === 0 
                    ? "Be the first to submit a research request!" 
                    : "Try adjusting your search criteria."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(request.status)}
                          <Badge variant={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge variant={getPriorityColor(request.priority)}>
                            {request.priority} Priority
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {getCategoryIcon(request.category)}
                            <span className="text-sm text-gray-600">{request.category}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">{request.title}</h3>
                        <p className="text-gray-600 mb-4">{request.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Requested by:</span>
                            <p className="font-medium">{request.user.name}</p>
                            <p className="text-gray-600">{request.user.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Submitted:</span>
                            <p>{new Date(request.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Last updated:</span>
                            <p>{new Date(request.updatedAt).toLocaleDateString()}</p>
                          </div>
                          {request.librarian && (
                            <div>
                              <span className="text-gray-500">Assigned to:</span>
                              <p className="font-medium">{request.librarian.name}</p>
                            </div>
                          )}
                        </div>

                        {request.resolution && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <span className="text-sm font-medium text-green-800">Resolution:</span>
                            <p className="text-sm text-green-700 mt-1">{request.resolution}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {request.status === "OPEN" && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusUpdate(request.id, "IN_PROGRESS")}
                          >
                            Start Working
                          </Button>
                        )}
                        
                        {request.status === "IN_PROGRESS" && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(request.id, "RESOLVED")}
                            >
                              Mark Resolved
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(request.id, "CLOSED")}
                            >
                              Close
                            </Button>
                          </>
                        )}
                        
                        {request.status === "RESOLVED" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusUpdate(request.id, "CLOSED")}
                          >
                            Close
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
      </main>
    </div>
  )
}
