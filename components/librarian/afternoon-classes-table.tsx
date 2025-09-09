"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  GraduationCap, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  Users,
  BookOpen,
  MapPin,
  DollarSign
} from "lucide-react"

interface AfternoonClass {
  id: string
  title: string
  description: string
  instructorId: string
  instructorName: string
  category: "COOKING" | "CRAFTING" | "LANGUAGE" | "COMPUTER" | "ART" | "MUSIC" | "FITNESS" | "OTHER"
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED"
  scheduledAt: string
  duration: number
  maxStudents: number
  currentStudents: number
  location: string
  materials?: string
  cost?: number
  createdAt: string
}

interface AfternoonClassesTableProps {
  classes: AfternoonClass[]
  onStatusUpdate?: (id: string, status: string) => void
}

export function AfternoonClassesTable({ classes, onStatusUpdate }: AfternoonClassesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedClass, setSelectedClass] = useState<AfternoonClass | null>(null)

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || classItem.status === statusFilter
    const matchesCategory = categoryFilter === "all" || classItem.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "COOKING": return "bg-red-100 text-red-800 border-red-200"
      case "CRAFTING": return "bg-purple-100 text-purple-800 border-purple-200"
      case "LANGUAGE": return "bg-blue-100 text-blue-800 border-blue-200"
      case "COMPUTER": return "bg-green-100 text-green-800 border-green-200"
      case "ART": return "bg-pink-100 text-pink-800 border-pink-200"
      case "MUSIC": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "FITNESS": return "bg-orange-100 text-orange-800 border-orange-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleStatusChange = (classId: string, newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(classId, newStatus)
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
            placeholder="Search by class title or instructor..."
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="COOKING">Cooking</SelectItem>
            <SelectItem value="CRAFTING">Crafting</SelectItem>
            <SelectItem value="LANGUAGE">Language</SelectItem>
            <SelectItem value="COMPUTER">Computer</SelectItem>
            <SelectItem value="ART">Art</SelectItem>
            <SelectItem value="MUSIC">Music</SelectItem>
            <SelectItem value="FITNESS">Fitness</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
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
                  {classes.filter(c => c.status === "SCHEDULED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Ongoing</p>
                <p className="text-2xl font-bold text-green-600">
                  {classes.filter(c => c.status === "ONGOING").length}
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
                  {classes.filter(c => c.status === "COMPLETED").length}
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
                <p className="text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold text-purple-600">
                  {classes.reduce((sum, c) => sum + c.currentStudents, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes List */}
      <div className="space-y-3">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <GraduationCap className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No afternoon classes found</p>
          </div>
        ) : (
          filteredClasses.map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {classItem.title}
                      </h3>
                      <Badge className={getStatusColor(classItem.status)}>
                        {classItem.status}
                      </Badge>
                      <Badge className={getCategoryColor(classItem.category)}>
                        {classItem.category}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Instructor: {classItem.instructorName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(classItem.scheduledAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(classItem.duration)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{classItem.currentStudents}/{classItem.maxStudents}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{classItem.location}</span>
                      </div>
                      {classItem.cost && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>R{classItem.cost}</span>
                        </div>
                      )}
                    </div>
                    {classItem.description && (
                      <p className="text-sm text-gray-500 mt-2">{classItem.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedClass(classItem)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {classItem.status === "SCHEDULED" && (
                      <Select
                        value={classItem.status}
                        onValueChange={(value) => handleStatusChange(classItem.id, value)}
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
                    {classItem.status === "ONGOING" && (
                      <Select
                        value={classItem.status}
                        onValueChange={(value) => handleStatusChange(classItem.id, value)}
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

      {/* Class Details Modal */}
      {selectedClass && (
        <Card className="fixed inset-4 z-50 bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Class Details</CardTitle>
            <Button variant="outline" onClick={() => setSelectedClass(null)}>
              <XCircle className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Class Title</label>
                <p className="text-lg font-semibold">{selectedClass.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge className={getStatusColor(selectedClass.status)}>
                  {selectedClass.status}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <Badge className={getCategoryColor(selectedClass.category)}>
                  {selectedClass.category}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Instructor</label>
                <p>{selectedClass.instructorName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Scheduled At</label>
                <p>{new Date(selectedClass.scheduledAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Duration</label>
                <p>{formatDuration(selectedClass.duration)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Students</label>
                <p>{selectedClass.currentStudents}/{selectedClass.maxStudents}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p>{selectedClass.location}</p>
              </div>
              {selectedClass.cost && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Cost</label>
                  <p>R{selectedClass.cost}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p>{new Date(selectedClass.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {selectedClass.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">{selectedClass.description}</p>
              </div>
            )}
            {selectedClass.materials && (
              <div>
                <label className="text-sm font-medium text-gray-500">Materials Required</label>
                <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">{selectedClass.materials}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
