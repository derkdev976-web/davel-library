"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { FileUpload } from "@/components/ui/file-upload"
import { 
  FileText, 
  Printer, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  DollarSign
} from "lucide-react"

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
}

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

export default function PrintingServicesPage() {
  const { data: session } = useSession()
  const [services, setServices] = useState<PrintService[]>([])
  const [userPrintJobs, setUserPrintJobs] = useState<PrintJob[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<PrintService | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const [printJobData, setPrintJobData] = useState({
    serviceId: "",
    pages: "",
    copies: "1",
    color: false,
    paperSize: "A4",
    paperType: "Standard",
    pickupLocation: "",
    specialInstructions: ""
  })

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/print-services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Error fetching print services:', error)
      toast({ title: "Error fetching print services", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchUserPrintJobs = useCallback(async () => {
    if (!session?.user?.id) return
    
    try {
      const response = await fetch(`/api/print-jobs?userId=${session.user.id}`)
      if (response.ok) {
        const data = await response.json()
        setUserPrintJobs(data.printJobs || [])
      }
    } catch (error) {
      console.error('Error fetching user print jobs:', error)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchServices()
    if (session?.user?.id) {
      fetchUserPrintJobs()
    }
  }, [fetchServices, fetchUserPrintJobs, session?.user?.id])

  const openSubmitDialog = (service: PrintService) => {
    if (!session) {
      toast({ 
        title: "Please sign in to submit a print job", 
        variant: "destructive" 
      })
      return
    }
    
    setSelectedService(service)
    setPrintJobData({
      serviceId: service.id,
      pages: "",
      copies: "1",
      color: false,
      paperSize: service.paperSizes[0] || "A4",
      paperType: service.paperTypes[0] || "Standard",
      pickupLocation: "",
      specialInstructions: ""
    })
    setIsSubmitDialogOpen(true)
  }

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file)
    
    // Simulate file analysis to get page count
    // In a real app, you'd use a PDF library to count pages
    const mockPageCount = Math.floor(Math.random() * 20) + 1
    setPrintJobData(prev => ({ ...prev, pages: mockPageCount.toString() }))
  }

  const calculateCost = () => {
    if (!selectedService || !printJobData.pages || !printJobData.copies) return 0
    
    const pages = parseInt(printJobData.pages)
    const copies = parseInt(printJobData.copies)
    const baseCost = selectedService.pricePerPage * pages * copies
    const colorCost = printJobData.color ? selectedService.colorPrice * pages * copies : 0
    
    return baseCost + colorCost
  }

  const handlePrintJobSubmit = async () => {
    if (!selectedService || !selectedFile || !session?.user?.id) return

    try {
      // In a real app, you'd upload the file to a cloud storage service
      const mockFileUrl = `https://example.com/files/${selectedFile.name}`
      
      const response = await fetch('/api/print-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          fileName: selectedFile.name,
          fileUrl: mockFileUrl,
          fileSize: selectedFile.size,
          pages: printJobData.pages,
          copies: printJobData.copies,
          color: printJobData.color,
          paperSize: printJobData.paperSize,
          paperType: printJobData.paperType,
          pickupLocation: printJobData.pickupLocation,
          specialInstructions: printJobData.specialInstructions
        })
      })

      if (response.ok) {
        toast({ title: "Print job submitted successfully!" })
        setIsSubmitDialogOpen(false)
        setSelectedFile(null)
        setPrintJobData({
          serviceId: "",
          pages: "",
          copies: "1",
          color: false,
          paperSize: "A4",
          paperType: "Standard",
          pickupLocation: "",
          specialInstructions: ""
        })
        fetchUserPrintJobs()
      } else {
        const errorData = await response.json()
        toast({ 
          title: "Error submitting print job", 
          description: errorData.error,
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error('Error submitting print job:', error)
      toast({ title: "Error submitting print job", variant: "destructive" })
    }
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
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading printing services...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Printing Services
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Professional printing services for all your academic and personal needs. 
            Upload your documents and we&apos;ll handle the rest.
          </p>
        </div>

        {/* User Print Jobs Section */}
        {session && userPrintJobs.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                My Print Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPrintJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{job.fileName}</h3>
                      <p className="text-sm text-gray-600">
                        {job.service.name} • {job.pages} pages × {job.copies} copies
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()} • ${job.totalCost}
                      </p>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                ))}
                {userPrintJobs.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{userPrintJobs.length - 3} more print jobs
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Print Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Printer className="h-5 w-5 mr-2" />
                  {service.name}
                </CardTitle>
                <p className="text-sm text-gray-600">{service.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price per page:</span>
                    <span className="font-semibold">${service.pricePerPage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Color printing:</span>
                    <span className="font-semibold">${service.colorPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Max pages:</span>
                    <span className="font-semibold">{service.maxPages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Turnaround:</span>
                    <span className="font-semibold">{service.turnaroundTime}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Available sizes:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.paperSizes.map((size, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Paper types:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.paperTypes.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => openSubmitDialog(service)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Print Job
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No printing services available at the moment.</p>
          </div>
        )}
      </div>

      {/* Print Job Submission Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Print Job - {selectedService?.name}</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <Label>Upload Document</Label>
                <FileUpload
                  onFileSelect={handleFileUpload}
                  selectedFile={selectedFile}
                  accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  maxSize={10 * 1024 * 1024} // 10MB
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    File: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pages">Number of Pages</Label>
                  <Input
                    id="pages"
                    type="number"
                    value={printJobData.pages}
                    onChange={(e) => setPrintJobData({ ...printJobData, pages: e.target.value })}
                    placeholder="Enter page count"
                    min="1"
                    max={selectedService.maxPages}
                  />
                </div>
                <div>
                  <Label htmlFor="copies">Number of Copies</Label>
                  <Input
                    id="copies"
                    type="number"
                    value={printJobData.copies}
                    onChange={(e) => setPrintJobData({ ...printJobData, copies: e.target.value })}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paperSize">Paper Size</Label>
                  <Select value={printJobData.paperSize} onValueChange={(value) => setPrintJobData({ ...printJobData, paperSize: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedService.paperSizes.map((size) => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paperType">Paper Type</Label>
                  <Select value={printJobData.paperType} onValueChange={(value) => setPrintJobData({ ...printJobData, paperType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedService.paperTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  value={printJobData.pickupLocation}
                  onChange={(e) => setPrintJobData({ ...printJobData, pickupLocation: e.target.value })}
                  placeholder="e.g., Main Library Front Desk"
                />
              </div>

              <div>
                <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="specialInstructions"
                  value={printJobData.specialInstructions}
                  onChange={(e) => setPrintJobData({ ...printJobData, specialInstructions: e.target.value })}
                  placeholder="Any special requirements or instructions..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="color"
                  checked={printJobData.color}
                  onChange={(e) => setPrintJobData({ ...printJobData, color: e.target.checked })}
                />
                <Label htmlFor="color">Color printing (+${selectedService.colorPrice} per page)</Label>
              </div>

              {/* Cost Calculation */}
              {printJobData.pages && printJobData.copies && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Cost:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${calculateCost().toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {printJobData.pages} pages × {printJobData.copies} copies × ${selectedService.pricePerPage}
                    {printJobData.color && ` + color printing (${printJobData.pages} × ${printJobData.copies} × $${selectedService.colorPrice})`}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePrintJobSubmit}
              disabled={!selectedFile || !printJobData.pages || !printJobData.copies || !printJobData.pickupLocation}
            >
              Submit Print Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}