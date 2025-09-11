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
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Eye,
  Printer,
  FileDown
} from "lucide-react"

interface PrintJob {
  id: string
  userId: string
  serviceId: string
  fileName: string
  fileUrl: string
  fileSize: number
  pages: number
  copies: number
  color: boolean
  paperSize: string
  paperType: string
  pickupLocation: string
  specialInstructions?: string
  totalCost: number
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "FAILED"
  createdAt: string
  updatedAt: string
  completedAt?: string
  user: {
    id: string
    name: string
    email: string
  }
  service: {
    id: string
    name: string
    description: string
  }
}

interface PrintService {
  id: string
  name: string
  description: string
  pricePerPage: number
  colorPrice: number
  paperSizes: string[]
  paperTypes: string[]
  maxPages: number
  turnaroundTime: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  printJobs?: PrintJob[]
}

export function PrintingServicesManager() {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([])
  const [services, setServices] = useState<PrintService[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false)
  const [isViewJobsDialogOpen, setIsViewJobsDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null)
  const { toast } = useToast()

  const [serviceFormData, setServiceFormData] = useState({
    name: "",
    description: "",
    pricePerPage: "",
    colorPrice: "",
    paperSizes: [] as string[],
    paperTypes: [] as string[],
    maxPages: "",
    turnaroundTime: ""
  })

  const fetchPrintJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/print-jobs')
      if (response.ok) {
        const data = await response.json()
        setPrintJobs(data.printJobs || [])
      }
    } catch (error) {
      console.error('Error fetching print jobs:', error)
      toast({ title: "Error fetching print jobs", variant: "destructive" })
    }
  }, [toast])

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('/api/print-services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Error fetching print services:', error)
      toast({ title: "Error fetching print services", variant: "destructive" })
    }
  }, [toast])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchPrintJobs(), fetchServices()])
      setLoading(false)
    }
    loadData()
  }, [fetchPrintJobs, fetchServices])

  const handleServiceSubmit = async () => {
    try {
      const response = await fetch('/api/print-services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceFormData)
      })
      
      if (response.ok) {
        toast({ title: "Print service created successfully" })
        setIsAddServiceDialogOpen(false)
        resetServiceForm()
        fetchServices()
      } else {
        const errorData = await response.json()
        toast({ 
          title: "Error creating print service", 
          description: errorData.error,
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error('Error creating print service:', error)
      toast({ title: "Error creating print service", variant: "destructive" })
    }
  }

  const handleJobStatusUpdate = async (jobId: string, status: string) => {
    try {
      const response = await fetch(`/api/print-jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        toast({ title: `Print job ${status.toLowerCase()} successfully` })
        fetchPrintJobs()
      } else {
        toast({ title: "Error updating print job", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating print job:', error)
      toast({ title: "Error updating print job", variant: "destructive" })
    }
  }

  const resetServiceForm = () => {
    setServiceFormData({
      name: "",
      description: "",
      pricePerPage: "",
      colorPrice: "",
      paperSizes: [],
      paperTypes: [],
      maxPages: "",
      turnaroundTime: ""
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>
      case "PROCESSING":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Processing</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getJobStats = () => {
    const pending = printJobs.filter(job => job.status === "PENDING").length
    const processing = printJobs.filter(job => job.status === "PROCESSING").length
    const completedToday = printJobs.filter(job => {
      const today = new Date().toDateString()
      return job.status === "COMPLETED" && 
             job.completedAt && 
             new Date(job.completedAt).toDateString() === today
    }).length

    return { pending, processing, completedToday }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading printing services...</p>
        </div>
      </div>
    )
  }

  const stats = getJobStats()

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Jobs</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{stats.processing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setIsAddServiceDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Service
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => setIsViewJobsDialogOpen(true)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View All Requests
        </Button>
        <Button asChild className="bg-[#8B4513] hover:bg-[#A0522D] text-white">
          <a href="/printing-services" target="_blank">
            <Printer className="h-4 w-4 mr-2" />
            Open Printing Services
          </a>
        </Button>
      </div>

      {/* Recent Print Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Print Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {printJobs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No print jobs found</p>
          ) : (
            <div className="space-y-4">
              {printJobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{job.fileName}</h3>
                      <p className="text-sm text-gray-600">
                        {job.user.name} • {job.pages} pages • {job.copies} copies • ${job.totalCost}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()} at{" "}
                        {new Date(job.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(job.status)}
                    {job.status === "PENDING" && (
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => handleJobStatusUpdate(job.id, "PROCESSING")}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                        <Button
                          onClick={() => setSelectedJob(job)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    )}
                    {job.status === "PROCESSING" && (
                      <div className="flex space-x-1">
                        <Button
                          onClick={() => handleJobStatusUpdate(job.id, "COMPLETED")}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          onClick={() => setSelectedJob(job)}
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add New Service Dialog */}
      <Dialog open={isAddServiceDialogOpen} onOpenChange={setIsAddServiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Print Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="service-name">Service Name</Label>
              <Input
                id="service-name"
                value={serviceFormData.name}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                placeholder="e.g., Standard Printing"
              />
            </div>
            <div>
              <Label htmlFor="service-description">Description</Label>
              <Textarea
                id="service-description"
                value={serviceFormData.description}
                onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                placeholder="Describe the print service..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price-per-page">Price per Page ($)</Label>
                <Input
                  id="price-per-page"
                  type="number"
                  step="0.01"
                  value={serviceFormData.pricePerPage}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, pricePerPage: e.target.value })}
                  placeholder="0.10"
                />
              </div>
              <div>
                <Label htmlFor="color-price">Color Price ($)</Label>
                <Input
                  id="color-price"
                  type="number"
                  step="0.01"
                  value={serviceFormData.colorPrice}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, colorPrice: e.target.value })}
                  placeholder="0.25"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="paper-sizes">Paper Sizes (comma-separated)</Label>
              <Input
                id="paper-sizes"
                value={serviceFormData.paperSizes.join(', ')}
                onChange={(e) => setServiceFormData({ 
                  ...serviceFormData, 
                  paperSizes: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                placeholder="A4, A3, Letter"
              />
            </div>
            <div>
              <Label htmlFor="paper-types">Paper Types (comma-separated)</Label>
              <Input
                id="paper-types"
                value={serviceFormData.paperTypes.join(', ')}
                onChange={(e) => setServiceFormData({ 
                  ...serviceFormData, 
                  paperTypes: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
                placeholder="Standard, Glossy, Cardstock"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-pages">Max Pages</Label>
                <Input
                  id="max-pages"
                  type="number"
                  value={serviceFormData.maxPages}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, maxPages: e.target.value })}
                  placeholder="100"
                />
              </div>
              <div>
                <Label htmlFor="turnaround-time">Turnaround Time</Label>
                <Input
                  id="turnaround-time"
                  value={serviceFormData.turnaroundTime}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, turnaroundTime: e.target.value })}
                  placeholder="24 hours"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddServiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleServiceSubmit}>Add Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View All Jobs Dialog */}
      <Dialog open={isViewJobsDialogOpen} onOpenChange={setIsViewJobsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Print Jobs</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {printJobs.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No print jobs found</p>
            ) : (
              <div className="space-y-4">
                {printJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <h3 className="font-semibold">{job.fileName}</h3>
                            <p className="text-sm text-gray-600">
                              {job.user.name} ({job.user.email})
                            </p>
                            <p className="text-sm text-gray-600">
                              {job.service.name} • {formatFileSize(job.fileSize)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pages & Copies</p>
                          <p>{job.pages} pages × {job.copies} copies</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Paper & Color</p>
                          <p>{job.paperSize} • {job.paperType}</p>
                          <p className="text-sm text-gray-500">{job.color ? 'Color' : 'Black & White'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pickup Location</p>
                          <p>{job.pickupLocation}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Cost</p>
                          <p className="text-lg font-semibold text-green-600">${job.totalCost}</p>
                        </div>
                      </div>

                      {job.specialInstructions && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600">Special Instructions</p>
                          <p className="text-sm text-gray-700">{job.specialInstructions}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500">
                          Created: {new Date(job.createdAt).toLocaleString()}
                          {job.completedAt && (
                            <span> • Completed: {new Date(job.completedAt).toLocaleString()}</span>
                          )}
                        </p>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => window.open(job.fileUrl, '_blank')}
                            size="sm"
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          {job.status === "PENDING" && (
                            <>
                              <Button
                                onClick={() => handleJobStatusUpdate(job.id, "PROCESSING")}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Start Processing
                              </Button>
                              <Button
                                onClick={() => handleJobStatusUpdate(job.id, "CANCELLED")}
                                size="sm"
                                variant="destructive"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {job.status === "PROCESSING" && (
                            <Button
                              onClick={() => handleJobStatusUpdate(job.id, "COMPLETED")}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Complete
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
        </DialogContent>
      </Dialog>

      {/* Job Details Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Print Job Details</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedJob.fileName}</h3>
                  <p className="text-sm text-gray-600">{selectedJob.user.name} ({selectedJob.user.email})</p>
                </div>
                {getStatusBadge(selectedJob.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Service</p>
                  <p>{selectedJob.service.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">File Size</p>
                  <p>{formatFileSize(selectedJob.fileSize)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pages & Copies</p>
                  <p>{selectedJob.pages} pages × {selectedJob.copies} copies</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Paper & Color</p>
                  <p>{selectedJob.paperSize} • {selectedJob.paperType}</p>
                  <p className="text-sm text-gray-500">{selectedJob.color ? 'Color' : 'Black & White'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pickup Location</p>
                  <p>{selectedJob.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cost</p>
                  <p className="text-lg font-semibold text-green-600">${selectedJob.totalCost}</p>
                </div>
              </div>

              {selectedJob.specialInstructions && (
                <div>
                  <p className="text-sm font-medium text-gray-600">Special Instructions</p>
                  <p className="text-sm text-gray-700">{selectedJob.specialInstructions}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xs text-gray-500">
                  <p>Created: {new Date(selectedJob.createdAt).toLocaleString()}</p>
                  {selectedJob.completedAt && (
                    <p>Completed: {new Date(selectedJob.completedAt).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => window.open(selectedJob.fileUrl, '_blank')}
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download File
                  </Button>
                  {selectedJob.status === "PENDING" && (
                    <Button
                      onClick={() => {
                        handleJobStatusUpdate(selectedJob.id, "PROCESSING")
                        setSelectedJob(null)
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Start Processing
                    </Button>
                  )}
                  {selectedJob.status === "PROCESSING" && (
                    <Button
                      onClick={() => {
                        handleJobStatusUpdate(selectedJob.id, "COMPLETED")
                        setSelectedJob(null)
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
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
