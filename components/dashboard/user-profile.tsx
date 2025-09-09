"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfilePicture } from "@/components/ui/profile-picture"
import { 
  User, Mail, Calendar, BookOpen, Clock, Activity, 
  Edit, Save, X, Shield, History, Settings
} from "lucide-react"

interface UserProfileProps {
  user: {
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
      profilePicture?: string
    }
  }
  onUpdate?: (userData: any) => void
}

export function UserProfile({ user, onUpdate }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
    role: user.role,
    isActive: user.isActive
  })

  const handleSave = () => {
    onUpdate?.(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || "",
      email: user.email,
      role: user.role,
      isActive: user.isActive
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ProfilePicture 
                src={user.profile?.profilePicture}
                alt={user.name || "User"}
                size="lg"
                className="h-16 w-16"
              />
              <div>
                <CardTitle className="text-2xl">{user.name || "Unnamed User"}</CardTitle>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={user.isTemporaryAdmin ? "destructive" : "outline"}>
                    {user.role} {user.isTemporaryAdmin && "(Temp)"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="role"
                      value={formData.role}
                      disabled
                    />
                    {user.isTemporaryAdmin && (
                      <Badge variant="destructive">
                        <Clock className="h-3 w-3 mr-1" />
                        Expires: {user.tempAdminExpires ? new Date(user.tempAdminExpires).toLocaleDateString() : "Unknown"}
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="status"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      disabled={!isEditing}
                      className="rounded"
                    />
                    <Label htmlFor="status">{formData.isActive ? "Active" : "Inactive"}</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{user.visitCount}</div>
                  <p className="text-sm text-gray-600">Total Visits</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                  </div>
                  <p className="text-sm text-gray-600">Last Login</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-sm text-gray-600">Member Since</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Logged in</p>
                      <p className="text-sm text-gray-600">Dashboard access</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Book reservation</p>
                      <p className="text-sm text-gray-600">&quot;The Great Gatsby&quot;</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Role updated</p>
                      <p className="text-sm text-gray-600">Promoted to temporary admin</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">3 days ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Library Access</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Browse catalog</span>
                        <Badge variant="default">✓</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Reserve books</span>
                        <Badge variant="default">✓</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Access digital library</span>
                        <Badge variant="default">✓</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Admin Functions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Manage users</span>
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role === "ADMIN" ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Manage books</span>
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role === "ADMIN" ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">View analytics</span>
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role === "ADMIN" ? "✓" : "✗"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
