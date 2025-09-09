"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MemberProfilePicture } from "@/components/ui/public-profile-picture"
import { 
  Calendar, Clock, User, BookOpen, CheckCircle, XCircle, 
  Search, Filter, Eye, AlertCircle, Plus
} from "lucide-react"

interface Reservation {
  id: string
  userId: string
  userName: string
  userEmail: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE" | "COMPLETED" | "OVERDUE"
  reservedAt: string
  approvedAt?: string
  dueDate?: string
  returnedAt?: string
  notes?: string
}

export function ReservationManager() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [userFilter, setUserFilter] = useState("all")
  const [users, setUsers] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [newReservation, setNewReservation] = useState({
    userId: "",
    bookId: "",
    status: "PENDING" as const,
    notes: ""
  })
  const { toast } = useToast()

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/reservations')
      if (response.ok) {
        const data = await response.json()
        setReservations(data.reservations || [])
      } else {
        setReservations([])
      }
    } catch (error) {
      console.error('Error fetching reservations:', error)
      toast({ title: "Error fetching reservations", variant: "destructive" })
      setReservations([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchReservations()
    fetchUsers()
    fetchBooks()
  }, [fetchReservations])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.filter((user: any) => user.role === "MEMBER"))
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/admin/books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    }
  }

  const handleApproveReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({ title: "Reservation approved successfully" })
        fetchReservations()
      } else {
        toast({ title: "Error approving reservation", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error approving reservation:', error)
      toast({ title: "Error approving reservation", variant: "destructive" })
    }
  }

  const handleRejectReservation = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}/reject`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({ title: "Reservation rejected successfully" })
        fetchReservations()
      } else {
        toast({ title: "Error rejecting reservation", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error rejecting reservation:', error)
      toast({ title: "Error rejecting reservation", variant: "destructive" })
    }
  }

  const handleAddReservation = async () => {
    try {
      const response = await fetch('/api/admin/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReservation),
      })
      
      if (response.ok) {
        toast({ title: "Reservation added successfully" })
        setIsAddDialogOpen(false)
        setNewReservation({ userId: "", bookId: "", status: "PENDING", notes: "" })
        fetchReservations()
      } else {
        toast({ title: "Error adding reservation", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error adding reservation:', error)
      toast({ title: "Error adding reservation", variant: "destructive" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "APPROVED": return "bg-blue-100 text-blue-800"
      case "ACTIVE": return "bg-green-100 text-green-800"
      case "COMPLETED": return "bg-gray-100 text-gray-800"
      case "OVERDUE": return "bg-red-100 text-red-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4" />
      case "APPROVED": return <CheckCircle className="h-4 w-4" />
      case "ACTIVE": return <BookOpen className="h-4 w-4" />
      case "COMPLETED": return <CheckCircle className="h-4 w-4" />
      case "OVERDUE": return <AlertCircle className="h-4 w-4" />
      case "REJECTED": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter
    
    return matchesSearch && matchesStatus
  })



  const getStats = () => {
    const total = reservations.length
    const pending = reservations.filter(r => r.status === "PENDING").length
    const active = reservations.filter(r => r.status === "ACTIVE").length
    const overdue = reservations.filter(r => r.status === "OVERDUE").length
    const completed = reservations.filter(r => r.status === "COMPLETED").length

    return { total, pending, active, overdue, completed }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reservation Management</h2>
          <p className="text-gray-600">Manage book reservations and approvals</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-[#8B4513] hover:bg-[#A0522D] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reservation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Reservations</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-gray-600">Pending Approval</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-sm text-gray-600">Active Loans</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.completed}</div>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reservations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle>Reservations ({filteredReservations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading reservations...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reservations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(reservation.status)}
                      <Badge className={getStatusColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">{reservation.bookTitle}</h3>
                      <p className="text-sm text-gray-600">by {reservation.bookAuthor}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {reservation.userName}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(reservation.reservedAt).toLocaleDateString()}
                        </span>
                        {reservation.dueDate && (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Due: {new Date(reservation.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedReservation(reservation)
                        setIsDetailDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {reservation.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleApproveReservation(reservation.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRejectReservation(reservation.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Book</Label>
                  <p className="font-semibold">{selectedReservation.bookTitle}</p>
                  <p className="text-sm text-gray-600">by {selectedReservation.bookAuthor}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">User</Label>
                  <p className="font-semibold">{selectedReservation.userName}</p>
                  <p className="text-sm text-gray-600">{selectedReservation.userEmail}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedReservation.status)}
                    <Badge className={getStatusColor(selectedReservation.status)}>
                      {selectedReservation.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Reserved Date</Label>
                  <p className="text-sm">
                    {new Date(selectedReservation.reservedAt).toLocaleString()}
                  </p>
                </div>
                
                {selectedReservation.approvedAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Approved Date</Label>
                    <p className="text-sm">
                      {new Date(selectedReservation.approvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {selectedReservation.dueDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Due Date</Label>
                    <p className="text-sm">
                      {new Date(selectedReservation.dueDate).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {selectedReservation.returnedAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Returned Date</Label>
                    <p className="text-sm">
                      {new Date(selectedReservation.returnedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedReservation.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedReservation.notes}</p>
                </div>
              )}
              
              {selectedReservation.status === "PENDING" && (
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => {
                      handleApproveReservation(selectedReservation.id)
                      setIsDetailDialogOpen(false)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleRejectReservation(selectedReservation.id)
                      setIsDetailDialogOpen(false)
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Reservation Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Reservation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">Member</Label>
                <Select value={newReservation.userId} onValueChange={(value) => setNewReservation({...newReservation, userId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <MemberProfilePicture 
                            src={user.profile?.profilePicture}
                            firstName={user.profile?.firstName || user.name?.split(' ')[0] || ''}
                            lastName={user.profile?.lastName || user.name?.split(' ').slice(1).join(' ') || ''}
                            size="sm"
                          />
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="bookId">Book</Label>
                <Select 
                  value={newReservation.bookId} 
                  onValueChange={(value) => setNewReservation({ ...newReservation, bookId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select book" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title} by {book.author}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newReservation.status} 
                onValueChange={(value: any) => setNewReservation({ ...newReservation, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={newReservation.notes}
                onChange={(e) => setNewReservation({ ...newReservation, notes: e.target.value })}
                placeholder="Optional notes about this reservation"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddReservation}
              disabled={!newReservation.userId || !newReservation.bookId}
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white"
            >
              Add Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
