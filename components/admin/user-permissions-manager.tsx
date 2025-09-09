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
import { MemberProfilePicture } from "@/components/ui/public-profile-picture"
import { 
  Shield, UserCheck, UserX, Eye, Clock, CheckCircle, XCircle, 
  Search, Filter, Calendar, Mail, Phone, MapPin, Settings,
  Key, Users, Activity, BookOpen, AlertTriangle, Trash2
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  isTemporaryAdmin: boolean
  tempAdminExpires?: string
  lastLogin?: string
  createdAt: string
  visitCount: number
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    city?: string
    state?: string
    profilePicture?: string
  }
}

interface UserDetails extends User {
  recentReservations: any[]
  recentVisits: any[]
  totalReservations: number
  totalVisits: number
  membershipApplication?: {
    status: string
  }
  emailVerified?: boolean
}

export function UserPermissionsManager() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [permissionAction, setPermissionAction] = useState("")
  const [newRole, setNewRole] = useState("")
  const [tempAdminExpires, setTempAdminExpires] = useState("")
  const [actionNotes, setActionNotes] = useState("")
  const [deleteReason, setDeleteReason] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDeletion, setConfirmDeletion] = useState(false)
  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({ title: "Error fetching users", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const fetchUserDetails = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/permissions`)
      if (response.ok) {
        const data = await response.json()
        setSelectedUser(data.user)
        setIsDetailsDialogOpen(true)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast({ title: "Error fetching user details", variant: "destructive" })
    }
  }

  const handlePermissionAction = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: permissionAction,
          role: newRole,
          tempAdminExpires: tempAdminExpires,
          notes: actionNotes
        })
      })
      
      if (response.ok) {
        toast({ title: "User permissions updated successfully" })
        setIsPermissionsDialogOpen(false)
        setPermissionAction("")
        setNewRole("")
        setTempAdminExpires("")
        setActionNotes("")
        fetchUsers()
        if (isDetailsDialogOpen) {
          fetchUserDetails(selectedUser.id)
        }
      } else {
        const errorData = await response.json()
        toast({ title: "Error updating permissions", description: errorData.error, variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating user permissions:', error)
      toast({ title: "Error updating permissions", variant: "destructive" })
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: selectedUser.id,
          reason: deleteReason 
        })
      })
      
      if (response.ok) {
        toast({ 
          title: "User deleted successfully", 
          description: `${selectedUser.name} has been permanently removed from the system.`
        })
        setIsDeleteDialogOpen(false)
        setDeleteReason("")
        setSelectedUser(null)
        fetchUsers()
      } else {
        const errorData = await response.json()
        toast({ 
          title: "Error deleting user", 
          description: errorData.error, 
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({ 
        title: "Error deleting user", 
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive" 
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const openDeleteDialog = async (user: User) => {
    try {
      // Fetch full user details before opening delete dialog
      const response = await fetch(`/api/admin/users/${user.id}/permissions`)
      if (response.ok) {
        const data = await response.json()
        setSelectedUser(data.user)
        setIsDeleteDialogOpen(true)
        setConfirmDeletion(false)
        setDeleteReason("")
      } else {
        toast({ title: "Error fetching user details", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast({ title: "Error fetching user details", variant: "destructive" })
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-red-100 text-red-800"
      case "LIBRARIAN": return "bg-blue-100 text-blue-800"
      case "MEMBER": return "bg-green-100 text-green-800"
      case "GUEST": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && user.isActive) ||
                         (filterStatus === "inactive" && !user.isActive)
    return matchesSearch && matchesRole && matchesStatus
  })

  const openPermissionsDialog = (action: string) => {
    setPermissionAction(action)
    setIsPermissionsDialogOpen(true)
  }

     const handleSettingsClick = async (user: User) => {
     try {
       // Fetch user details first
       const response = await fetch(`/api/admin/users/${user.id}/permissions`)
       if (response.ok) {
         const data = await response.json()
         setSelectedUser(data.user)
         setIsPermissionsDialogOpen(true)
       } else {
         toast({ title: "Error fetching user details", variant: "destructive" })
       }
     } catch (error) {
       console.error('Error fetching user details:', error)
       toast({ title: "Error fetching user details", variant: "destructive" })
     }
   }

   const handleSendVerificationEmail = async (email: string) => {
     setLoading(true)
     try {
       const response = await fetch("/api/auth/verify-email", {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({ email }),
       })

       const data = await response.json()

       if (response.ok) {
         toast({
           title: "Verification Email Sent",
           description: `Verification email has been sent to ${email}`,
         })
         setIsDetailsDialogOpen(false)
       } else {
         throw new Error(data.error || "Failed to send verification email")
       }
     } catch (error) {
       toast({
         title: "Error",
         description: error instanceof Error ? error.message : "Failed to send verification email",
         variant: "destructive",
       })
     } finally {
       setLoading(false)
     }
   }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Permissions Management</h2>
          <p className="text-gray-600">Manage user roles, permissions, and access levels</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {users.filter(user => user.isActive).length} Active
          </Badge>
          <Badge variant="outline" className="text-sm">
            {users.filter(user => user.isTemporaryAdmin).length} Temp Admin
          </Badge>
          <Badge variant="outline" className="text-sm text-red-600 border-red-600">
            {users.filter(user => !user.isActive).length} Deactivated
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
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="LIBRARIAN">Librarian</SelectItem>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="GUEST">Guest</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setFilterStatus("inactive")
            setSearchTerm("")
            setFilterRole("all")
          }}
          className="border-red-200 text-red-700 hover:bg-red-50"
        >
          <UserX className="h-4 w-4 mr-2" />
          Show Deactivated Users
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setFilterStatus("all")
            setSearchTerm("")
            setFilterRole("all")
          }}
        >
          <Users className="h-4 w-4 mr-2" />
          Show All Users
        </Button>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(user.isActive)}
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      {user.isTemporaryAdmin && (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Temp Admin
                        </Badge>
                      )}
                      {!user.isActive && (
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Deactivated
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <MemberProfilePicture 
                        src={user.profile?.profilePicture}
                        firstName={user.profile?.firstName || user.name?.split(' ')[0] || ''}
                        lastName={user.profile?.lastName || user.name?.split(' ').slice(1).join(' ') || ''}
                        size="sm"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Joined: {new Date(user.createdAt).toLocaleDateString()} | 
                          Visits: {user.visitCount}
                          {user.lastLogin && ` | Last Login: ${new Date(user.lastLogin).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchUserDetails(user.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSettingsClick(user)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                                         {/* Delete Button - Only show for deactivated users */}
                     {!user.isActive && (
                       <Button
                         size="sm"
                         variant="destructive"
                         onClick={async () => await openDeleteDialog(user)}
                         className="bg-red-600 hover:bg-red-700"
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && selectedUser.recentVisits && selectedUser.recentReservations ? (
            <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedUser.isActive)}
                    <span className="text-sm">{selectedUser.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
                {selectedUser.profile?.phone && (
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm font-medium">{selectedUser.profile.phone}</p>
                  </div>
                )}
                {selectedUser.profile?.city && (
                  <div>
                    <Label>Location</Label>
                    <p className="text-sm font-medium">{selectedUser.profile.city}, {selectedUser.profile.state}</p>
                  </div>
                )}
                <div>
                  <Label>Joined</Label>
                  <p className="text-sm font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Last Login</Label>
                  <p className="text-sm font-medium">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : "Never"}
                  </p>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Reservations</p>
                        <p className="text-2xl font-bold">{selectedUser.totalReservations || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Visits</p>
                        <p className="text-2xl font-bold">{selectedUser.totalVisits || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Recent Activity</p>
                        <p className="text-2xl font-bold">{selectedUser.recentVisits?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Reservations */}
              <div>
                <Label>Recent Reservations</Label>
                {selectedUser.recentReservations && selectedUser.recentReservations.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.recentReservations.map((reservation: any) => (
                      <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {reservation.book?.title || 'Unknown Book'}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            by {reservation.book?.author || 'Unknown Author'}
                          </p>
                          {reservation.reservedAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Reserved: {new Date(reservation.reservedAt).toLocaleDateString()}
                            </p>
                          )}
                          {reservation.dueDate && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Due: {new Date(reservation.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="ml-4">
                          <Badge 
                            variant="outline" 
                            className={`${
                              reservation.status === 'APPROVED' ? 'border-green-500 text-green-700 dark:text-green-400' :
                              reservation.status === 'PENDING' ? 'border-yellow-500 text-yellow-700 dark:text-yellow-400' :
                              reservation.status === 'CANCELLED' ? 'border-red-500 text-red-700 dark:text-red-400' :
                              reservation.status === 'RETURNED' ? 'border-blue-500 text-blue-700 dark:text-blue-400' :
                              reservation.status === 'OVERDUE' ? 'border-orange-500 text-orange-700 dark:text-orange-400' :
                              'border-gray-500 text-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {reservation.status || 'UNKNOWN'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <BookOpen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">No recent reservations</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">This user hasn&apos;t made any book reservations yet.</p>
                  </div>
                )}
                

              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    setIsDetailsDialogOpen(false)
                    setSelectedUser(selectedUser)
                    setPermissionAction("change_role")
                    setIsPermissionsDialogOpen(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Change Role
                </Button>
                {selectedUser.role === "MEMBER" && !selectedUser.isTemporaryAdmin && (
                  <Button
                    onClick={() => {
                      setIsDetailsDialogOpen(false)
                      setSelectedUser(selectedUser)
                      setPermissionAction("grant_temp_admin")
                      setIsPermissionsDialogOpen(true)
                    }}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Grant Temp Admin
                  </Button>
                )}
                {selectedUser.isTemporaryAdmin && (
                  <Button
                    onClick={() => {
                      setIsDetailsDialogOpen(false)
                      setSelectedUser(selectedUser)
                      setPermissionAction("revoke_temp_admin")
                      setIsPermissionsDialogOpen(true)
                    }}
                    variant="destructive"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Revoke Temp Admin
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setIsDetailsDialogOpen(false)
                    setSelectedUser(selectedUser)
                    setPermissionAction("toggle_active")
                    setIsPermissionsDialogOpen(true)
                  }}
                  className={selectedUser.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {selectedUser.isActive ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailsDialogOpen(false)
                    setSelectedUser(selectedUser)
                    setPermissionAction("reset_password")
                    setIsPermissionsDialogOpen(true)
                  }}
                  variant="outline"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
                
                                 {/* Delete Button - Only show for deactivated users */}
                 {!selectedUser.isActive && (
                   <Button
                     onClick={async () => {
                       setIsDetailsDialogOpen(false)
                       await openDeleteDialog(selectedUser)
                     }}
                     variant="destructive"
                     className="bg-red-700 hover:bg-red-800"
                   >
                     <Trash2 className="h-4 w-4 mr-2" />
                     Delete User
                   </Button>
                 )}
                
                {/* Send Verification Email Button for Approved Members */}
                {selectedUser.role === "MEMBER" && 
                 selectedUser.membershipApplication?.status === "APPROVED" && 
                 !selectedUser.emailVerified && (
                  <Button
                    onClick={() => handleSendVerificationEmail(selectedUser.email)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Verification Email
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading user details...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage User Permissions</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <p className="text-sm font-medium">{selectedUser.name} ({selectedUser.email})</p>
              </div>

              {permissionAction === "change_role" && (
                <div>
                  <Label htmlFor="newRole">New Role</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="LIBRARIAN">Librarian</SelectItem>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="GUEST">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {permissionAction === "grant_temp_admin" && (
                <div>
                  <Label htmlFor="tempAdminExpires">Expiration Date</Label>
                  <Input
                    id="tempAdminExpires"
                    type="datetime-local"
                    value={tempAdminExpires}
                    onChange={(e) => setTempAdminExpires(e.target.value)}
                  />
                </div>
              )}

              {(permissionAction === "change_role" || permissionAction === "grant_temp_admin") && (
                <div>
                  <Label htmlFor="actionNotes">Notes (Optional)</Label>
                  <Textarea
                    id="actionNotes"
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Add notes about this action..."
                    rows={3}
                  />
                </div>
              )}

              {permissionAction === "revoke_temp_admin" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      This will immediately revoke temporary admin access for {selectedUser.name}.
                    </p>
                  </div>
                </div>
              )}

              {permissionAction === "toggle_active" && (
                <div className={`border rounded-lg p-4 ${selectedUser.isActive ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center space-x-2">
                    {selectedUser.isActive ? (
                      <>
                        <UserX className="h-5 w-5 text-red-600" />
                        <p className="text-sm text-red-800">
                          This will deactivate {selectedUser.name}&apos;s account. They will not be able to log in.
                        </p>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-5 w-5 text-green-600" />
                        <p className="text-sm text-green-800">
                          This will activate {selectedUser.name}&apos;s account. They will be able to log in again.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {permissionAction === "reset_password" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Key className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      This will reset {selectedUser.name}&apos;s password to the default member password.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePermissionAction}
              disabled={
                (permissionAction === "change_role" && !newRole) ||
                (permissionAction === "grant_temp_admin" && !tempAdminExpires)
              }
              className={
                permissionAction === "revoke_temp_admin" || 
                (permissionAction === "toggle_active" && selectedUser?.isActive) ||
                permissionAction === "reset_password"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open)
        if (!open) {
          setConfirmDeletion(false)
          setDeleteReason("")
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800 font-medium">
                    Warning: This action cannot be undone!
                  </p>
                </div>
              </div>
              
              <div>
                <Label>User to Delete</Label>
                <p className="text-sm font-medium">{selectedUser.name} ({selectedUser.email})</p>
                <p className="text-xs text-gray-600 mt-1">
                  Role: {selectedUser.role} • Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <Label htmlFor="deleteReason">Reason for Deletion (Optional)</Label>
                <Textarea
                  id="deleteReason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Enter reason for deletion..."
                  rows={3}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">This will permanently remove:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>User account and profile</li>
                      <li>All associated data (reservations, visits, etc.)</li>
                      <li>Chat messages and content access</li>
                      <li>Membership application records</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="confirmDeletion"
                  checked={confirmDeletion}
                  onChange={(e) => setConfirmDeletion(e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <Label htmlFor="confirmDeletion" className="text-sm text-red-700 font-medium">
                  I understand that this action cannot be undone and all user data will be permanently deleted.
                </Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteUser}
              disabled={isDeleting || !confirmDeletion}
              variant="destructive"
              className="bg-red-700 hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
