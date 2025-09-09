"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MemberListingPicture } from "@/components/ui/public-profile-picture"
import { Search, Users, MapPin, Calendar } from "lucide-react"

interface PublicMember {
  id: string
  name: string
  email: string
  profile?: {
    firstName: string
    lastName: string
    profilePicture?: string
    city?: string
    state?: string
    joinDate?: string
    preferredGenres?: string
  }
}

export function MemberDirectory() {
  const [members, setMembers] = useState<PublicMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        // This would be a public API endpoint that doesn't require authentication
        const response = await fetch("/api/public/members")
        if (response.ok) {
          const data = await response.json()
          setMembers(data.members || [])
        }
      } catch (error) {
        console.error("Failed to fetch members:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const filteredMembers = members.filter(member => {
    const searchLower = searchTerm.toLowerCase()
    const fullName = `${member.profile?.firstName || ""} ${member.profile?.lastName || ""}`.toLowerCase()
    const email = member.email.toLowerCase()
    const location = `${member.profile?.city || ""} ${member.profile?.state || ""}`.toLowerCase()
    
    return fullName.includes(searchLower) || 
           email.includes(searchLower) || 
           location.includes(searchLower)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B4513]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member Directory
          </CardTitle>
          <p className="text-sm text-gray-600">
            Connect with other library members in your community
          </p>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <MemberListingPicture
                      src={member.profile?.profilePicture}
                      firstName={member.profile?.firstName}
                      lastName={member.profile?.lastName}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {member.profile?.firstName && member.profile?.lastName
                          ? `${member.profile.firstName} ${member.profile.lastName}`
                          : member.name
                        }
                      </h3>
                      
                      {member.profile?.city && member.profile?.state && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">
                            {member.profile.city}, {member.profile.state}
                          </span>
                        </div>
                      )}
                      
                      {member.profile?.joinDate && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Member since {new Date(member.profile.joinDate).getFullYear()}</span>
                        </div>
                      )}
                      
                      {member.profile?.preferredGenres && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {member.profile.preferredGenres}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No members found</p>
              {searchTerm && (
                <p className="text-sm">Try adjusting your search terms</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
