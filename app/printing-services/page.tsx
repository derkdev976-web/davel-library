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
  Printer, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Upload,
  DollarSign,
  Settings,
  Palette
} from "lucide-react"

interface PrintJob {
  id: string
  fileName: string
  fileSize: number
  pages: number
  copies: number
  color: boolean
  paperSize: string
  paperType: string
  status: string
  totalCost: number
  createdAt: string
  completedAt?: string
  pickupLocation: string
  specialInstructions?: string
  user: {
    id: string
    name: string
    email: string
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
}

export default function PrintingServicesPage() {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([])
  const [services, setServices] = useState<PrintService[]>([])
  const [filteredJobs, setFilteredJobs] = useState<PrintJob[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showNewJobForm, setShowNewJobForm] = useState(false)
  const [selectedService, setSelectedService] = useState<PrintService | null>(null)
  const [newJob, setNewJob] = useState({
    fileName: "",
    pages: 1,
    copies: 1,
    color: false,
    paperSize: "A4",
    paperType: "Standard",
    pickupLocation: "Main Library",
    specialInstructions: ""
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const fetchPrintJobs = useCallback(async () => {
    try {
      const response = await fetch("/api/print-jobs")
      if (response.ok) {
        const data = await response.json()
        setPrintJobs(data)
      }
    } catch (error) {
      console.error("Error fetching print jobs:", error)
      toast({ title: "Error loading print jobs", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch("/api/print-services")
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error("Error fetching print services:", error)
    }
  }, [])

  const filterJobs = useCallback(() => {
    let filtered = printJobs

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(job => job.status === selectedStatus)
    }

    setFilteredJobs(filtered)
  }, [printJobs, searchTerm, selectedStatus])

  useEffect(() => {
    fetchPrintJobs()
    fetchServices()
  }, [fetchPrintJobs, fetchServices])

  useEffect(() => {
    filterJobs()
  }, [filterJobs])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setNewJob({...newJob, fileName: file.name})
    }
  }

  const calculateCost = () => {
    if (!selectedService) return 0
    const baseCost = selectedService.pricePerPage * newJob.pages * newJob.copies
    const colorCost = newJob.color ? selectedService.colorPrice * newJob.pages * newJob.copies : 0
    return baseCost + colorCost
  }

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !selectedService) return

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('serviceId', selectedService.id)
      formData.append('pages', newJob.pages.toString())
      formData.append('copies', newJob.copies.toString())
      formData.append('color', newJob.color.toString())
      formData.append('paperSize', newJob.paperSize)
      formData.append('paperType', newJob.paperType)
      formData.append('pickupLocation', newJob.pickupLocation)
      formData.append('specialInstructions', newJob.specialInstructions)

      const response = await fetch("/api/print-jobs", {
        method: "POST",
        body: formData
      })
      
      if (response.ok) {
        toast({ title: "Print job submitted successfully!" })
        setShowNewJobForm(false)
        setSelectedFile(null)
        setSelectedService(null)
        setNewJob({
          fileName: "",
          pages: 1,
          copies: 1,
          color: false,
          paperSize: "A4",
          paperType: "Standard",
          pickupLocation: "Main Library",
          specialInstructions: ""
        })
        fetchPrintJobs()
      } else {
        const error = await response.json()
        toast({ title: error.error || "Failed to submit print job", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error submitting print job:", error)
      toast({ title: "Error submitting print job", variant: "destructive" })
    }
  }

  const handleCancelJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/print-jobs/${jobId}`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        toast({ title: "Print job cancelled successfully" })
        fetchPrintJobs()
      } else {
        toast({ title: "Failed to cancel print job", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error cancelling print job:", error)
      toast({ title: "Error cancelling print job", variant: "destructive" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "secondary"
      case "PROCESSING": return "default"
      case "COMPLETED": return "secondary"
      case "CANCELLED": return "outline"
      case "FAILED": return "destructive"
      default: return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4" />
      case "PROCESSING": return <Settings className="h-4 w-4" />
      case "COMPLETED": return <CheckCircle className="h-4 w-4" />
      case "CANCELLED": return <XCircle className="h-4 w-4" />
      case "FAILED": return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Printer className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>Loading Printing Services...</p>
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
            <h1 className="text-4xl font-bold text-gradient mb-4">Printing Services</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Professional printing services for documents, photos, and large format projects
            </p>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <Button 
              onClick={() => setShowNewJobForm(!showNewJobForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Submit Print Job
            </Button>
          </div>

          {/* New Job Form */}
          {showNewJobForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Submit Print Job</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitJob} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select File</label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Print Service</label>
                    <Select onValueChange={(value) => {
                      const service = services.find(s => s.id === value)
                      setSelectedService(service || null)
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a print service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - ${service.pricePerPage}/page
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Pages</label>
                      <Input
                        type="number"
                        min="1"
                        value={newJob.pages}
                        onChange={(e) => setNewJob({...newJob, pages: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Copies</label>
                      <Input
                        type="number"
                        min="1"
                        value={newJob.copies}
                        onChange={(e) => setNewJob({...newJob, copies: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Paper Size</label>
                      <Select value={newJob.paperSize} onValueChange={(value) => setNewJob({...newJob, paperSize: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4</SelectItem>
                          <SelectItem value="A3">A3</SelectItem>
                          <SelectItem value="Letter">Letter</SelectItem>
                          <SelectItem value="Legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Paper Type</label>
                      <Select value={newJob.paperType} onValueChange={(value) => setNewJob({...newJob, paperType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Glossy">Glossy</SelectItem>
                          <SelectItem value="Matte">Matte</SelectItem>
                          <SelectItem value="Photo">Photo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Pickup Location</label>
                    <Select value={newJob.pickupLocation} onValueChange={(value) => setNewJob({...newJob, pickupLocation: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Main Library">Main Library</SelectItem>
                        <SelectItem value="Science Library">Science Library</SelectItem>
                        <SelectItem value="Medical Library">Medical Library</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Special Instructions</label>
                    <Textarea
                      value={newJob.specialInstructions}
                      onChange={(e) => setNewJob({...newJob, specialInstructions: e.target.value})}
                      placeholder="Any special requirements or instructions..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="color"
                      checked={newJob.color}
                      onChange={(e) => setNewJob({...newJob, color: e.target.checked})}
                    />
                    <label htmlFor="color" className="text-sm font-medium">Color Printing</label>
                  </div>
                  
                  {selectedService && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Estimated Cost:</span>
                        <span className="text-lg font-bold">${calculateCost().toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Base: ${selectedService.pricePerPage} × {newJob.pages} pages × {newJob.copies} copies
                        {newJob.color && ` + Color: $${selectedService.colorPrice} × ${newJob.pages} × ${newJob.copies}`}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button type="submit" disabled={!selectedFile || !selectedService}>
                      Submit Print Job
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowNewJobForm(false)}
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
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search print jobs..."
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredJobs.length} print jobs found
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary">
                  {printJobs.filter(j => j.status === "PENDING").length} Pending
                </Badge>
                <Badge variant="default">
                  {printJobs.filter(j => j.status === "PROCESSING").length} Processing
                </Badge>
                <Badge variant="outline">
                  {printJobs.filter(j => j.status === "COMPLETED").length} Completed
                </Badge>
              </div>
            </div>
          </div>

          {/* Print Jobs List */}
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Printer className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No print jobs found</h3>
                <p className="text-gray-600">
                  {printJobs.length === 0 
                    ? "Submit your first print job to get started!" 
                    : "Try adjusting your search criteria."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(job.status)}
                          <Badge variant={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                          {job.color && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Palette className="h-3 w-3" />
                              Color
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">{job.fileName}</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Submitted by:</span>
                            <p className="font-medium">{job.user.name}</p>
                            <p className="text-gray-600">{job.user.email}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Details:</span>
                            <p>{job.pages} pages × {job.copies} copies</p>
                            <p>{job.paperSize} {job.paperType}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Pickup:</span>
                            <p>{job.pickupLocation}</p>
                            <p className="text-gray-600">{formatFileSize(job.fileSize)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Cost:</span>
                            <p className="font-bold">${job.totalCost.toFixed(2)}</p>
                            <p className="text-gray-600">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {job.specialInstructions && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <span className="text-sm font-medium text-blue-800">Special Instructions:</span>
                            <p className="text-sm text-blue-700 mt-1">{job.specialInstructions}</p>
                          </div>
                        )}

                        {job.status === "COMPLETED" && job.completedAt && (
                          <div className="mt-2 text-sm text-green-600">
                            Completed on {new Date(job.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {job.status === "PENDING" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCancelJob(job.id)}
                          >
                            Cancel Job
                          </Button>
                        )}
                        
                        {job.status === "COMPLETED" && (
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
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
