"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Header } from "@/components/layout/header"
import { useToast } from "@/hooks/use-toast"
import FreeEbooksManager from './free-ebooks-manager'
import { UserProfile } from './user-profile'
// import { ChatInterface } from "@/components/chat/chat-interface"
import { ContentManager } from "@/components/admin/content-manager"
import { HomepageManager } from "@/components/admin/homepage-manager"
import { ColorCustomizer } from "@/components/admin/color-customizer"
import { BackgroundCustomizer } from "@/components/admin/background-customizer"
import { BookManager } from "@/components/admin/book-manager"
import { ReservationManager } from "@/components/admin/reservation-manager"
import { ApplicationsManager } from "@/components/admin/applications-manager"
import { UserPermissionsManager } from "@/components/admin/user-permissions-manager"
import { EventManager } from "@/components/admin/event-manager"
import EmailBroadcaster from "@/components/admin/email-broadcaster"
import { DocumentManagement } from "@/components/admin/document-management"
import { MemberContactDirectory } from "@/components/admin/member-contact-directory"
import { ContactStatistics } from "@/components/admin/contact-statistics"
import { FeeManagement } from "@/components/admin/fee-management"
import { FeeHistory } from "@/components/admin/fee-history"
import { EmailTest } from "@/components/admin/email-test"
import { NotificationSystem } from "@/components/notifications/notification-system"
import { MemberProfilePicture } from "@/components/ui/public-profile-picture"

import { 
  Users, BookOpen, Calendar, AlertCircle, CheckCircle, XCircle, 
  Plus, Edit, Trash, Eye, Clock, Star, MessageSquare, Settings,
  UserCheck, UserX, Shield, Download, Upload, BarChart3, Activity,
  Palette, BookText, ClipboardList, CalendarDays, Mail, FileText,
  Phone, MapPin, CreditCard, DollarSign, UserCircle, Bell
} from "lucide-react"

interface Stats {
  totalUsers: number
  activeMembers: number
  pendingApplications: number
  totalBooks: number
  reservedBooks: number
  overdueBooks: number
  upcomingEvents: number
  chatMessages: number
  totalVisits: number
  todayVisits: number
}

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
    profilePicture?: string;
    firstName?: string;
    lastName?: string;
  };
}

interface Book {
  id: string
  title: string
  author: string
  isElectronic: boolean
  isDigital: boolean
  visibility: string
  totalCopies: number
  availableCopies: number
  createdAt: string
}

interface NewsEvent {
  id: string
  title: string
  type: string
  isPublished: boolean
  visibility: string
  eventDate?: string
  createdAt: string
}

interface GalleryImage {
  id: string
  title: string
  imageUrl: string
  isPublished: boolean
  visibility: string
  createdAt: string
}

interface UserVisit {
  id: string
  userId: string
  userName: string
  userEmail: string
  userRole: string
  page: string
  duration?: number
  visitedAt: string
  userAgent?: string
  ipAddress?: string
}

export function EnhancedAdminDashboard() {
  const { data: session, status } = useSession()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [userVisits, setUserVisits] = useState<UserVisit[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedChatUser, setSelectedChatUser] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedMember, setSelectedMember] = useState<string>("")
  const { toast } = useToast()

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [statsRes, usersRes, booksRes, newsRes, galleryRes, visitsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/books'),
        fetch('/api/admin/news'),
        fetch('/api/admin/gallery'),
        fetch('/api/admin/visits')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (booksRes.ok) {
        const booksData = await booksRes.json()
        setBooks(booksData)
      }

      if (newsRes.ok) {
        const newsData = await newsRes.json()
        setNewsEvents(newsData)
      }

      if (galleryRes.ok) {
        const galleryData = await galleryRes.json()
        setGalleryImages(galleryData)
      }

      if (visitsRes.ok) {
        const visitsData = await visitsRes.json()
        setUserVisits(visitsData)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Move useEffect after function definition
  useEffect(() => {
    if (status === "authenticated" && session) {
      fetchDashboardData()
    }
  }, [status, session, fetchDashboardData])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Access Denied</h2>
            <p className="text-red-600 dark:text-red-300">You need admin privileges to access this dashboard.</p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-2">Please sign in to access the admin dashboard.</p>
          </div>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Access Denied</h2>
            <p className="text-red-600 dark:text-red-300">You need admin privileges to access this dashboard.</p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-2">Current role: {session?.user?.role || 'Unknown'}</p>
          </div>
        </div>
      </div>
    )
  }



  const handlePromoteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/promote`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({ title: "User promoted successfully" })
        fetchDashboardData()
      } else {
        toast({ title: "Error promoting user", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error promoting user:', error)
      toast({ title: "Error promoting user", variant: "destructive" })
    }
  }

  const handleRevokeUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/revoke`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({ title: "Admin access revoked successfully" })
        fetchDashboardData()
      } else {
        toast({ title: "Error revoking admin access", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error revoking admin access:', error)
      toast({ title: "Error revoking admin access", variant: "destructive" })
    }
  }

  const handleToggleContentVisibility = async (type: string, id: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/content/${type}/${id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished })
      })
      
      if (response.ok) {
        toast({ title: `Content ${isPublished ? 'unpublished' : 'published'} successfully` })
        fetchDashboardData()
      } else {
        toast({ title: "Error updating content visibility", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating content visibility:', error)
      toast({ title: "Error updating content visibility", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#8B4513] border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading Dashboard...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Dashboard</h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">

        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
            Manage your library&apos;s operations and content
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 lg:grid-cols-12 xl:grid-cols-17 gap-2 p-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="books" className="flex items-center space-x-2">
              <BookText className="h-4 w-4" />
              <span className="hidden md:inline">Books</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center space-x-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden md:inline">Reservations</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden md:inline">Applications</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span className="hidden md:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="homepage" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Homepage</span>
            </TabsTrigger>
            <TabsTrigger value="themes" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden md:inline">Themes</span>
            </TabsTrigger>
            <TabsTrigger value="ebooks" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span className="hidden md:inline">Ebooks</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span className="hidden md:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span className="hidden md:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span className="hidden md:inline">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden md:inline">Fees</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Users</CardTitle>
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {stats?.activeMembers || 0} active members
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Books</CardTitle>
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-800 dark:text-green-200">{stats?.totalBooks || 0}</div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {stats?.reservedBooks || 0} currently reserved
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Events</CardTitle>
                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">{stats?.upcomingEvents || 0}</div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    Upcoming events
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Today&apos;s Visits</CardTitle>
                  <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-800 dark:text-orange-200">{stats?.todayVisits || 0}</div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {stats?.totalVisits || 0} total visits
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => setSelectedTab("books")}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm font-medium">Add Book</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setSelectedTab("content")}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Upload className="h-6 w-6" />
                    <span className="text-sm font-medium">Add Content</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setSelectedTab("users")}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <UserCheck className="h-6 w-6" />
                    <span className="text-sm font-medium">Manage Users</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setSelectedTab("reservations")}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ClipboardList className="h-6 w-6" />
                    <span className="text-sm font-medium">Reservations</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setSelectedTab("events")}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CalendarDays className="h-6 w-6" />
                    <span className="text-sm font-medium">Events</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserPermissionsManager />
          </TabsContent>

          <TabsContent value="books" className="space-y-6">
            <BookManager />
          </TabsContent>

          <TabsContent value="reservations" className="space-y-6">
            <ReservationManager />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Event Management</CardTitle>
                <p className="text-sm text-gray-600">Create and manage library events, track attendance, and engage with members</p>
              </CardHeader>
              <CardContent>
                <EventManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Membership Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <ApplicationsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentManager />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Chat Management</CardTitle>
                <p className="text-sm text-gray-600">Manage communications with approved library members and staff</p>
              </CardHeader>
              <CardContent>
                <AdminChatInterface />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationSystem />
          </TabsContent>

          <TabsContent value="homepage" className="space-y-6">
            <HomepageManager />
          </TabsContent>

          <TabsContent value="themes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Color Theme</CardTitle>
                </CardHeader>
                <CardContent>
                  <ColorCustomizer />
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Background Customization</CardTitle>
                </CardHeader>
                <CardContent>
                  <BackgroundCustomizer />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ebooks" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Free Ebooks Management</CardTitle>
              </CardHeader>
              <CardContent>
                <FreeEbooksManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Visits</CardTitle>
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">{stats?.totalVisits || 0}</div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {stats?.todayVisits || 0} today
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Active Users</CardTitle>
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-800 dark:text-green-200">{stats?.activeMembers || 0}</div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {stats?.totalUsers || 0} total users
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Book Activity</CardTitle>
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">{stats?.reservedBooks || 0}</div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {stats?.overdueBooks || 0} overdue
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Applications</CardTitle>
                  <UserCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-800 dark:text-orange-200">{stats?.pendingApplications || 0}</div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Pending review
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent User Activity */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent User Activity</CardTitle>
                <p className="text-sm text-gray-600">Latest user visits and interactions</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userVisits.length > 0 ? (
                    userVisits.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {visit.userName?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{visit.userName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {visit.userEmail} • {visit.userRole}
                            </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {new Date(visit.visitedAt).toLocaleString()}
                              {visit.duration && ` • Duration: ${visit.duration}s`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {visit.page}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No recent user activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Page Analytics */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Page Analytics</CardTitle>
                <p className="text-sm text-gray-600">Most visited pages and user engagement</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const pageStats = userVisits.reduce((acc: any, visit) => {
                      if (!acc[visit.page]) {
                        acc[visit.page] = { count: 0, totalDuration: 0, users: new Set() }
                      }
                      acc[visit.page].count++
                      acc[visit.page].totalDuration += visit.duration || 0
                      acc[visit.page].users.add(visit.userId)
                      return acc
                    }, {})

                    const sortedPages = Object.entries(pageStats)
                      .map(([page, stats]: [string, any]) => ({
                        page,
                        visits: stats.count,
                        avgDuration: Math.round(stats.totalDuration / stats.count),
                        uniqueUsers: stats.users.size
                      }))
                      .sort((a, b) => b.visits - a.visits)
                      .slice(0, 10)

                    return sortedPages.length > 0 ? (
                      sortedPages.map((pageStat, index) => (
                        <div key={pageStat.page} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-xs">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{pageStat.page}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {pageStat.visits} visits • {pageStat.uniqueUsers} unique users
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {pageStat.avgDuration}s avg
                        </p>
                      </div>
                    </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No page analytics available</p>
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <EmailTest />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmailBroadcaster userRole={session?.user?.role as "ADMIN" | "LIBRARIAN"} />
              
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">All Users</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send to everyone registered with the library</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Members Only</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send to approved library members</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Applicants</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Send to users with pending applications</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Custom Selection</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Choose specific users to send emails to</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Best Practices</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Keep subject lines clear and concise</li>
                      <li>• Use professional, friendly tone</li>
                      <li>• Include relevant contact information</li>
                      <li>• Test with small groups first</li>
                      <li>• Respect user privacy and preferences</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <DocumentManagement />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Member Contact Directory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MemberContactDirectory />
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Contact Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactStatistics />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fees" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Fee Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FeeManagement />
                </CardContent>
              </Card>
              
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Fee History & Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FeeHistory />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* User Profile Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
            </DialogHeader>
            {selectedUser && <UserProfile user={selectedUser} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Admin Chat Interface Component
function AdminChatInterface() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedMember, setSelectedMember] = useState<string>("")
  const [members, setMembers] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchChatMessages()
    fetchMembers()
  }, [])

  const fetchChatMessages = async () => {
    try {
      const response = await fetch('/api/admin/chat')
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        const memberUsers = data.filter((user: any) => user.role === "MEMBER")
        setMembers(memberUsers)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMember) return

    try {
      const response = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage.trim(),
          recipientId: selectedMember
        })
      })

      if (response.ok) {
        setNewMessage("")
        fetchChatMessages()
        toast({ title: "Message sent successfully" })
      } else {
        toast({ title: "Error sending message", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({ title: "Error sending message", variant: "destructive" })
    }
  }

  const filteredMessages = messages.filter(msg => 
    (msg.senderId === selectedMember && msg.recipientId === session?.user?.id) ||
    (msg.senderId === session?.user?.id && msg.recipientId === selectedMember)
  )

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div className="w-1/3">
          <Label className="text-sm font-medium">Select Member</Label>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a member to chat with" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedMember && (
        <>
          <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              filteredMessages.map((message) => {
                const isOwnMessage = message.senderId === session?.user?.id
                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${
                      isOwnMessage 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      <div className="text-xs opacity-70 mb-1">
                        {isOwnMessage ? "You" : message.senderName}
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!newMessage.trim()}
              className="bg-[#8B4513] hover:bg-[#A0522D]"
            >
              Send
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

function UsersTable({ users, onPromote, onRevoke, onSelectUser }: any) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Visits</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: User) => (
              <tr key={user.id} className="border-t">
                <td className="p-3">
                  <div className="flex items-center space-x-3">
                    <MemberProfilePicture 
                      src={user.profile?.profilePicture}
                      firstName={user.profile?.firstName || user.name?.split(' ')[0] || ''}
                      lastName={user.profile?.lastName || user.name?.split(' ').slice(1).join(' ') || ''}
                      size="sm"
                    />
                    <span>{user.name || "—"}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{user.email}</td>
                <td className="p-3">
                  <Badge variant={user.isTemporaryAdmin ? "destructive" : "default"}>
                    {user.role} {user.isTemporaryAdmin && "(Temp)"}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="p-3">{user.visitCount || 0}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => onSelectUser(user)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {user.role === "MEMBER" && !user.isTemporaryAdmin && (
                    <Button size="sm" variant="outline" onClick={() => onPromote(user.id, 24)}>
                      <Shield className="h-4 w-4" />
                    </Button>
                  )}
                  {user.isTemporaryAdmin && (
                    <Button size="sm" variant="outline" onClick={() => onRevoke(user.id)}>
                      <UserX className="h-4 w-4" />
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
