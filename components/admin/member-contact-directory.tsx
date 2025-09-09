"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { MemberProfilePicture } from "@/components/ui/public-profile-picture"
import { 
  Phone, Mail, MapPin, Calendar, Search, Eye, 
  User, Clock, CheckCircle, XCircle 
} from "lucide-react"

interface Member {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  createdAt: string
  lastLogin?: string
  profile?: {
    firstName: string
    lastName: string
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
    profilePicture?: string
  }
}

export function MemberContactDirectory() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.profile?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.profile?.state?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredMembers(filtered)
  }, [members, searchTerm])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        // Filter only members and include profile data
        const memberUsers = data
          .filter((user: any) => user.role === "MEMBER")
          .map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            profile: user.profile ? {
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              street: user.profile.street,
              city: user.profile.city,
              state: user.profile.state,
              zipCode: user.profile.zipCode,
              country: user.profile.country,
              profilePicture: user.profile.profilePicture
            } : undefined
          }))
        setMembers(memberUsers)
      } else {
        throw new Error("Failed to fetch members")
      }
    } catch (error) {
      console.error("Error fetching members:", error)
      toast({
        title: "Error",
        description: "Failed to fetch member contact information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const getStatusBadge = (member: Member) => {
    if (member.lastLogin) {
      const lastLogin = new Date(member.lastLogin)
      const daysSinceLogin = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLogin <= 7) {
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      } else if (daysSinceLogin <= 30) {
        return <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>
      } else {
        return <Badge className="bg-red-100 text-red-800">Dormant</Badge>
      }
    }
    return <Badge className="bg-gray-100 text-gray-800">Never Logged In</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading member contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search members by name, email, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Members List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "No members found matching your search." : "No members found."}
          </div>
        ) : (
          filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MemberProfilePicture
                      src={member.profile?.profilePicture}
                      firstName={member.profile?.firstName}
                      lastName={member.profile?.lastName}
                      size="sm"
                      className="h-10 w-10"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {member.profile?.firstName} {member.profile?.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                        {member.profile?.city && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{member.profile.city}, {member.profile.state}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(member)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMember(member)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Member Details Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Contact Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <MemberProfilePicture
                  src={selectedMember.profile?.profilePicture}
                  firstName={selectedMember.profile?.firstName}
                  lastName={selectedMember.profile?.lastName}
                  size="lg"
                  className="h-16 w-16"
                />
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedMember.profile?.firstName} {selectedMember.profile?.lastName}
                  </h2>
                  <p className="text-gray-600">{selectedMember.email}</p>
                  {getStatusBadge(selectedMember)}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{selectedMember.email}</span>
                    </div>
                    {selectedMember.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{selectedMember.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedMember.profile?.street && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{selectedMember.profile.street}</span>
                      </div>
                    )}
                    {selectedMember.profile?.city && (
                      <div className="text-sm text-gray-600">
                        {selectedMember.profile.city}, {selectedMember.profile.state} {selectedMember.profile.zipCode}
                      </div>
                    )}
                    {selectedMember.profile?.country && (
                      <div className="text-sm text-gray-600">
                        {selectedMember.profile.country}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Member since: {formatDate(selectedMember.createdAt)}</span>
                  </div>
                  {selectedMember.lastLogin && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Last login: {formatDate(selectedMember.lastLogin)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
