"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  MapPin,
  Phone
} from "lucide-react"

interface BookReservation {
  id: string
  status: string
  reservedAt: string
  dueDate: string
  returnedAt?: string
  renewalCount: number
  notes?: string
  book: {
    id: string
    title: string
    author: string
    coverImage?: string
    totalCopies: number
    availableCopies: number
  }
  user: {
    id: string
    name: string
    email: string
  }
}

export default function BookReservationsPage() {
  const [reservations, setReservations] = useState<BookReservation[]>([])
  const [filteredReservations, setFilteredReservations] = useState<BookReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const { toast } = useToast()

  const fetchReservations = useCallback(async () => {
    try {
      const response = await fetch("/api/reservations")
      if (response.ok) {
        const data = await response.json()
        setReservations(data)
      }
    } catch (error) {
      console.error("Error fetching reservations:", error)
      toast({ title: "Error loading reservations", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const filterReservations = useCallback(() => {
    let filtered = reservations

    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(reservation => reservation.status === selectedStatus)
    }

    setFilteredReservations(filtered)
  }, [reservations, searchTerm, selectedStatus])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  useEffect(() => {
    filterReservations()
  }, [reservations, searchTerm, selectedStatus, filterReservations])

  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        toast({ title: "Reservation status updated" })
        fetchReservations()
      } else {
        toast({ title: "Failed to update status", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error updating reservation:", error)
      toast({ title: "Error updating reservation", variant: "destructive" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "secondary"
      case "APPROVED": return "default"
      case "CHECKED_OUT": return "default"
      case "RETURNED": return "outline"
      case "OVERDUE": return "destructive"
      case "CANCELLED": return "outline"
      default: return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4" />
      case "APPROVED": return <CheckCircle className="h-4 w-4" />
      case "CHECKED_OUT": return <BookOpen className="h-4 w-4" />
      case "RETURNED": return <CheckCircle className="h-4 w-4" />
      case "OVERDUE": return <AlertCircle className="h-4 w-4" />
      case "CANCELLED": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p>Loading Book Reservations...</p>
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
            <h1 className="text-4xl font-bold text-gradient mb-4">Book Reservations</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Manage physical book reservations and track borrowing status
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by book title, author, or user..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredReservations.length} reservations found
              </p>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {reservations.filter(r => r.status === "PENDING").length} Pending
                </Badge>
                <Badge variant="destructive">
                  {reservations.filter(r => isOverdue(r.dueDate) && r.status === "CHECKED_OUT").length} Overdue
                </Badge>
              </div>
            </div>
          </div>

          {/* Reservations List */}
          {filteredReservations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No reservations found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or check back later.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                                                 {reservation.book.coverImage && (
                           <Image 
                             src={reservation.book.coverImage} 
                             alt={reservation.book.title}
                             width={64}
                             height={80}
                             className="w-16 h-20 object-cover rounded"
                           />
                         )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(reservation.status)}
                            <Badge variant={getStatusColor(reservation.status)}>
                              {reservation.status}
                            </Badge>
                            {isOverdue(reservation.dueDate) && reservation.status === "CHECKED_OUT" && (
                              <Badge variant="destructive">OVERDUE</Badge>
                            )}
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-1">{reservation.book.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{reservation.book.author}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Reserved by:</span>
                              <p className="font-medium">{reservation.user.name}</p>
                              <p className="text-gray-600">{reservation.user.email}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Reserved on:</span>
                              <p>{new Date(reservation.reservedAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Due date:</span>
                              <p className={isOverdue(reservation.dueDate) ? "text-red-600 font-medium" : ""}>
                                {new Date(reservation.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Renewals:</span>
                              <p>{reservation.renewalCount}</p>
                            </div>
                          </div>

                          {reservation.notes && (
                            <div className="mt-2">
                              <span className="text-gray-500 text-sm">Notes:</span>
                              <p className="text-sm">{reservation.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="text-right text-sm text-gray-600">
                          <p>Available: {reservation.book.availableCopies}/{reservation.book.totalCopies}</p>
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          {reservation.status === "PENDING" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleStatusUpdate(reservation.id, "APPROVED")}
                              >
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStatusUpdate(reservation.id, "CANCELLED")}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          
                          {reservation.status === "APPROVED" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(reservation.id, "CHECKED_OUT")}
                            >
                              Check Out
                            </Button>
                          )}
                          
                          {reservation.status === "CHECKED_OUT" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusUpdate(reservation.id, "RETURNED")}
                            >
                              Return
                            </Button>
                          )}
                        </div>
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
