"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { FileUpload } from "@/components/ui/file-upload"
import { useToast } from "@/hooks/use-toast"
import { 
  User, BookOpen, Calendar, MessageSquare, Settings, 
  Edit, Eye, Download, Upload, History, Star, Bell,
  Heart, Share, Bookmark, Clock, CheckCircle, Plus,
  DollarSign, Shield, TrendingUp, Activity, Users,
  FileText, CreditCard, HelpCircle, Bell as BellIcon, Phone
} from "lucide-react"
import { QRCodeComponent } from "@/components/ui/qr-code"
import { UserDocumentManagement } from "@/components/user/document-management"
import { EbookViewer } from "@/components/ebook/ebook-viewer"
import { MemberFees } from "@/components/member/member-fees"
import Image from 'next/image'

interface MemberProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  profilePicture?: string
  bio?: string
  preferredGenres: string[]
  readingFrequency?: string
  memberSince: string
}

interface BookReservation {
  id: string
  bookTitle: string
  bookAuthor: string
  status: string
  reservedAt: string
  dueDate?: string
  returnedAt?: string
  renewalCount: number
}

interface ChatMessage {
  id: string
  content: string
  senderName: string
  senderRole: string
  createdAt: string
  isRead: boolean
  recipientName: string
  recipientRole: string
  isSystem: boolean
}

interface Ebook {
  id: string
  title: string
  author: string
  coverImage?: string
  downloadUrl?: string
  isDownloaded: boolean
}

interface DocumentRequest {
  id: string
  documentType: string
  reason: string
  status: string
  dueDate?: string
  createdAt: string
  adminNotes?: string
}

export function ModernMemberDashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [reservations, setReservations] = useState<BookReservation[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [ebooks, setEbooks] = useState<Ebook[]>([])
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [newMessage, setNewMessage] = useState("")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<MemberProfile>>({})
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const fetchMemberData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/member/dashboard")
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setReservations(data.reservations || [])
        setChatMessages(data.chatMessages || [])
        setEbooks(data.ebooks || [])
      }
    } catch (error) {
      console.error("Error fetching member data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocumentRequests = async () => {
    try {
      const response = await fetch("/api/member/documents")
      if (response.ok) {
        const data = await response.json()
        setDocumentRequests(data.documentRequests || [])
      }
    } catch (error) {
      console.error("Error fetching document requests:", error)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchMemberData()
      fetchDocumentRequests()
    }
  }, [session?.user?.id])

  const sendChatMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const response = await fetch("/api/member/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage })
      })

      if (response.ok) {
        setNewMessage("")
        fetchMemberData()
        toast({ title: "Message sent" })
      }
    } catch (error) {
      toast({ title: "Error sending message", variant: "destructive" })
    }
  }

  const updateProfile = async (updatedProfile: Partial<MemberProfile>) => {
    try {
      const response = await fetch("/api/member/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile)
      })

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, ...updatedProfile } : null)
        setIsEditingProfile(false)
        toast({ title: "Profile updated successfully" })
      }
    } catch (error) {
      toast({ title: "Error updating profile", variant: "destructive" })
    }
  }

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" })
      return
    }

    try {
      const response = await fetch("/api/member/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (response.ok) {
        setShowPasswordDialog(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        toast({ title: "Password changed successfully" })
      } else {
        toast({ title: "Error changing password", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error changing password", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <main className="pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back, {profile?.firstName || session?.user?.name}!
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
                  Here&apos;s what&apos;s happening with your library account
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Member since</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    {profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString() : '2025'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Security Reminder */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200">Security Reminder</h3>
                    <p className="text-amber-700 dark:text-amber-300 text-sm">
                      If you&apos;re using a temporary password, please change it to something secure in your profile settings.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowPasswordDialog(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Reservations</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {reservations.filter(r => r.status === 'ACTIVE').length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {reservations.filter(r => r.status === 'PENDING').length} pending
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Books Read</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {reservations.filter(r => r.status === 'RETURNED').length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">This month</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Support Requests</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {chatMessages.filter(m => !m.isRead && m.recipientRole === 'MEMBER').length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {chatMessages.filter(m => m.isRead && m.recipientRole === 'MEMBER').length} resolved
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Ebooks Available</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {ebooks.length}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {ebooks.filter(e => e.isDownloaded).length} downloaded
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <Activity className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="books" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <BookOpen className="h-4 w-4 mr-2" />
                My Books
              </TabsTrigger>
              <TabsTrigger value="ebooks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                Ebooks
              </TabsTrigger>
              <TabsTrigger value="fees" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <CreditCard className="h-4 w-4 mr-2" />
                Fees
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="support" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <HelpCircle className="h-4 w-4 mr-2" />
                Support
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Book Activity */}
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <span>Recent Book Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {reservations.length > 0 ? (
                      <div className="space-y-4">
                        {reservations.slice(0, 3).map((reservation) => (
                          <div key={reservation.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{reservation.bookTitle}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-300">{reservation.bookAuthor}</p>
                            </div>
                            <Badge 
                              variant={reservation.status === 'ACTIVE' ? 'default' : 
                                     reservation.status === 'PENDING' ? 'secondary' : 'outline'}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            >
                              {reservation.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                        No recent book activity
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Chat Messages */}
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                      <span>Recent Messages</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chatMessages.length > 0 ? (
                      <div className="space-y-4">
                        {chatMessages.slice(0, 3).map((message) => (
                          <div key={message.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-slate-900 dark:text-white">{message.senderName}</p>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                              {message.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                        No recent messages
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <span>Profile Information</span>
                    </CardTitle>
                    <Button 
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={editedProfile.firstName || profile?.firstName || ''}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, firstName: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={editedProfile.lastName || profile?.lastName || ''}
                            onChange={(e) => setEditedProfile(prev => ({ ...prev, lastName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={editedProfile.phone || profile?.phone || ''}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editedProfile.bio || profile?.bio || ''}
                          onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-3">
                        <Button 
                          onClick={() => updateProfile(editedProfile)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        >
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-slate-600 dark:text-slate-300">First Name</Label>
                          <p className="text-slate-900 dark:text-white font-medium">{profile?.firstName || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-slate-600 dark:text-slate-300">Last Name</Label>
                          <p className="text-slate-900 dark:text-white font-medium">{profile?.lastName || 'Not set'}</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-600 dark:text-slate-300">Email</Label>
                        <p className="text-slate-900 dark:text-white font-medium">{profile?.email || session?.user?.email}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600 dark:text-slate-300">Phone</Label>
                        <p className="text-slate-900 dark:text-white font-medium">{profile?.phone || 'Not set'}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600 dark:text-slate-300">Bio</Label>
                        <p className="text-slate-900 dark:text-white">{profile?.bio || 'No bio available'}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other tabs content would go here... */}
            <TabsContent value="books" className="space-y-6">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>My Book Reservations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reservations.length > 0 ? (
                    <div className="space-y-4">
                      {reservations.map((reservation) => (
                        <div key={reservation.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-slate-900 dark:text-white">{reservation.bookTitle}</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-300">{reservation.bookAuthor}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Reserved: {new Date(reservation.reservedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={reservation.status === 'ACTIVE' ? 'default' : 
                                     reservation.status === 'PENDING' ? 'secondary' : 'outline'}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                            >
                              {reservation.status}
                            </Badge>
                            {reservation.dueDate && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Due: {new Date(reservation.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">No book reservations yet</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        Visit our catalog to reserve books
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ebooks" className="space-y-6">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <span>Available Ebooks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ebooks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {ebooks.map((ebook) => (
                        <div key={ebook.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-3">
                            <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-900 dark:text-white truncate">{ebook.title}</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-300 truncate">{ebook.author}</p>
                              <div className="mt-2 flex space-x-2">
                                <Button 
                                  size="sm" 
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                                  onClick={() => {
                                    if (ebook.downloadUrl) {
                                      window.open(ebook.downloadUrl, '_blank')
                                    } else {
                                      toast({ title: "Download not available", variant: "destructive" })
                                    }
                                  }}
                                >
                                  <Download className="h-3 w-3 mr-1" />
                                  Download
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    // Open ebook in viewer
                                    const viewerUrl = `/ebook-viewer?id=${ebook.id}`
                                    window.open(viewerUrl, '_blank')
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">No ebooks available</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        Check back later for new digital content
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="space-y-6">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <span>Fees & Payments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">Total Fees</p>
                          <p className="text-2xl font-bold text-green-800 dark:text-green-200">R0</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Total Paid</p>
                          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">R0</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600 dark:text-orange-400">Outstanding</p>
                          <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">R0</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Fees</h3>
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 dark:text-slate-400">No fees at this time</p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        Your account is in good standing
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Chat with Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64 overflow-y-auto border rounded-lg p-4 bg-slate-50 dark:bg-slate-700/50">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="mb-4">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-slate-900 dark:text-white">{message.senderName}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(message.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{message.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      />
                      <Button 
                        onClick={sendChatMessage}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <HelpCircle className="h-5 w-5 text-purple-600" />
                    <span>Support Center</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Help</h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                          <h4 className="font-medium text-slate-900 dark:text-white">How to reserve books?</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                            Learn how to search and reserve books from our catalog
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                          <h4 className="font-medium text-slate-900 dark:text-white">Download ebooks</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                            Access and download digital books from your dashboard
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                          <h4 className="font-medium text-slate-900 dark:text-white">Account settings</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                            Update your profile and change password
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Contact Support</h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center space-x-3">
                            <MessageSquare className="h-6 w-6 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">Live Chat</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-300">Available 9 AM - 5 PM</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center space-x-3">
                            <Bell className="h-6 w-6 text-green-600" />
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">Email Support</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-300">support@davel.library.com</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="flex items-center space-x-3">
                            <Phone className="h-6 w-6 text-orange-600" />
                            <div>
                              <h4 className="font-medium text-slate-900 dark:text-white">Phone Support</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-300">+27 11 123 4567</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <UserDocumentManagement />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="h-5 w-5 text-indigo-600" />
                    <span>Borrowing History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">Books Borrowed</p>
                          <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">0</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">Books Read</p>
                          <p className="text-2xl font-bold text-green-800 dark:text-green-200">0</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400">Reviews Written</p>
                          <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">0</p>
                        </div>
                        <Star className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
                      <div className="text-center py-8">
                        <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">No borrowing history yet</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                          Start borrowing books to see your history here
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Reading Progress</h3>
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">No reading progress tracked</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                          Your reading progress will appear here
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={changePassword}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              Change Password
            </Button>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
