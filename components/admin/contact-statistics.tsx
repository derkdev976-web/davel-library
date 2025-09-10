"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, MapPin, Phone, Mail, Calendar, 
  TrendingUp, TrendingDown, Activity 
} from "lucide-react"

interface ContactStats {
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  dormantMembers: number
  membersWithPhone: number
  membersWithAddress: number
  newMembersThisMonth: number
  topCities: Array<{ city: string; count: number }>
  contactCompleteness: number
}

export function ContactStatistics() {
  const [stats, setStats] = useState<ContactStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContactStats()
  }, [fetchContactStats])

  const fetchContactStats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const members = await response.json()
        const memberUsers = members.filter((user: any) => user.role === "MEMBER")
        
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        
        const stats: ContactStats = {
          totalMembers: memberUsers.length,
          activeMembers: memberUsers.filter((m: any) => {
            if (!m.lastLogin) return false
            const lastLogin = new Date(m.lastLogin)
            return (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24) <= 7
          }).length,
          inactiveMembers: memberUsers.filter((m: any) => {
            if (!m.lastLogin) return false
            const lastLogin = new Date(m.lastLogin)
            const daysSinceLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
            return daysSinceLogin > 7 && daysSinceLogin <= 30
          }).length,
          dormantMembers: memberUsers.filter((m: any) => {
            if (!m.lastLogin) return true
            const lastLogin = new Date(m.lastLogin)
            return (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24) > 30
          }).length,
          membersWithPhone: memberUsers.filter((m: any) => m.phone).length,
          membersWithAddress: memberUsers.filter((m: any) => 
            m.profile?.city && m.profile?.state
          ).length,
          newMembersThisMonth: memberUsers.filter((m: any) => 
            new Date(m.createdAt) >= thirtyDaysAgo
          ).length,
          topCities: getTopCities(memberUsers),
          contactCompleteness: calculateContactCompleteness(memberUsers)
        }
        
        setStats(stats)
      }
    } catch (error) {
      console.error("Error fetching contact stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const getTopCities = (members: any[]) => {
    const cityCount: Record<string, number> = {}
    members.forEach(member => {
      if (member.profile?.city) {
        cityCount[member.profile.city] = (cityCount[member.profile.city] || 0) + 1
      }
    })
    
    return Object.entries(cityCount)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  const calculateContactCompleteness = (members: any[]) => {
    if (members.length === 0) return 0
    
    let totalCompleteness = 0
    members.forEach(member => {
      let completeness = 0
      if (member.email) completeness += 25
      if (member.phone) completeness += 25
      if (member.profile?.city) completeness += 25
      if (member.profile?.street) completeness += 25
      totalCompleteness += completeness
    })
    
    return Math.round(totalCompleteness / members.length)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load contact statistics
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalMembers}</div>
          <div className="text-sm text-blue-800">Total Members</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.contactCompleteness}%</div>
          <div className="text-sm text-green-800">Contact Complete</div>
        </div>
      </div>

      {/* Activity Status */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Member Activity</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Active (7 days)</span>
            </div>
            <Badge variant="outline">{stats.activeMembers}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Inactive (30 days)</span>
            </div>
            <Badge variant="outline">{stats.inactiveMembers}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm">Dormant (30+ days)</span>
            </div>
            <Badge variant="outline">{stats.dormantMembers}</Badge>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Contact Information</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">With Phone Number</span>
            </div>
            <Badge variant="outline">{stats.membersWithPhone}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">With Address</span>
            </div>
            <Badge variant="outline">{stats.membersWithAddress}</Badge>
          </div>
        </div>
      </div>

      {/* Top Cities */}
      {stats.topCities.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Top Cities</h4>
          <div className="space-y-1">
            {stats.topCities.map((city, index) => (
              <div key={city.city} className="flex items-center justify-between">
                <span className="text-sm">{city.city}</span>
                <Badge variant="outline">{city.count}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Members */}
      <div className="text-center p-3 bg-purple-50 rounded-lg">
        <div className="text-lg font-bold text-purple-600">{stats.newMembersThisMonth}</div>
        <div className="text-sm text-purple-800">New Members This Month</div>
      </div>
    </div>
  )
}
