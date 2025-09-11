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
import { useToast } from "@/hooks/use-toast"
import {
  Users, BookOpen, Calendar, AlertCircle, CheckCircle, XCircle,
  Plus, Edit, Trash, Trash2, Eye, Clock, Star, MessageSquare, Settings,
  UserCheck, UserX, Shield, Download, Upload, BarChart3, Activity,
  Palette, BookText, ClipboardList, CalendarDays, Mail, Printer,
  Video, BookMarked, GraduationCap, Scissors, FileText, Users2,
  Clock3, MapPin, Phone, Mail as MailIcon, Monitor, Headphones
} from "lucide-react"
import { ReservationManager } from "@/components/admin/reservation-manager"
import { ApplicationsManager } from "@/components/admin/applications-manager"
import { BookManager } from "@/components/admin/book-manager"
import { ContentManager } from "@/components/admin/content-manager"
import { ChatInterface } from "@/components/chat/chat-interface"
import { PrintingRequestDialog } from "@/components/librarian/printing-request-dialog"
import { RestorationRequestDialog } from "@/components/librarian/restoration-request-dialog"
import { OnlineMeetingDialog } from "@/components/librarian/online-meeting-dialog"
import { AfternoonClassDialog } from "@/components/librarian/afternoon-class-dialog"
import { RestorationRequestsTable } from "@/components/librarian/restoration-requests-table"
import { OnlineMeetingsTable } from "@/components/librarian/online-meetings-table"
import { AfternoonClassesTable } from "@/components/librarian/afternoon-classes-table"
import { CVEditor } from "@/components/librarian/cv-editor"
import { BroadcastEmail } from "@/components/librarian/broadcast-email"

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
  printingRequests: number
  restorationRequests: number
  onlineMeetings: number
  afternoonClasses: number
}

interface PrintingRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  documentName: string
  pages: number
  copies: number
  paperSize: string
  color: boolean
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  requestedAt: string
  completedAt?: string
  notes?: string
  cost?: number
}

interface RestorationRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  bookTitle: string
  bookAuthor: string
  bookIsbn?: string
  damageType: string
  damageDescription: string
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  estimatedCost: number
  status: "PENDING" | "ASSESSED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  requestedAt: string
  completedAt?: string
  notes?: string
  restorationNotes?: string
}

interface OnlineMeeting {
  id: string
  title: string
  description: string
  hostId: string
  hostName: string
  meetingType: "STUDY_GROUP" | "TUTORIAL" | "CONSULTATION" | "PRESENTATION"
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED"
  scheduledAt: string
  duration: number
  maxParticipants: number
  currentParticipants: number
  meetingLink?: string
  participants: string[]
  createdAt: string
}

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
  schedule: string
  location: string
  students: string[]
  materials?: string
  cost?: number
  createdAt: string
}

export function EnhancedLibrarianDashboard() {
  const { data: session } = useSession()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeMembers: 0,
    pendingApplications: 0,
    totalBooks: 0,
    reservedBooks: 0,
    overdueBooks: 0,
    upcomingEvents: 0,
    chatMessages: 0,
    totalVisits: 0,
    todayVisits: 0,
    printingRequests: 0,
    restorationRequests: 0,
    onlineMeetings: 0,
    afternoonClasses: 0
  })
  const [printingRequests, setPrintingRequests] = useState<PrintingRequest[]>([])
  const [restorationRequests, setRestorationRequests] = useState<RestorationRequest[]>([])
  const [onlineMeetings, setOnlineMeetings] = useState<OnlineMeeting[]>([])
  const [afternoonClasses, setAfternoonClasses] = useState<AfternoonClass[]>([])
  const [isAddPrintingDialogOpen, setIsAddPrintingDialogOpen] = useState(false)
  const [isAddRestorationDialogOpen, setIsAddRestorationDialogOpen] = useState(false)
  const [isAddMeetingDialogOpen, setIsAddMeetingDialogOpen] = useState(false)
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false)
  
  // Chat state
  const [chatUsers, setChatUsers] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [selectedChatUser, setSelectedChatUser] = useState<string | undefined>(undefined)
  
  const { toast } = useToast()

  // Dialog states
  const [isAddSpaceDialogOpen, setIsAddSpaceDialogOpen] = useState(false)
  const [isViewBookingsDialogOpen, setIsViewBookingsDialogOpen] = useState(false)
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false)
  const [isViewRequestsDialogOpen, setIsViewRequestsDialogOpen] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [statsRes, printingRes, restorationRes, meetingsRes, classesRes, chatUsersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/librarian/printing-requests'),
        fetch('/api/librarian/restoration-requests'),
        fetch('/api/librarian/online-meetings'),
        fetch('/api/librarian/afternoon-classes'),
        fetch('/api/chat/users')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (printingRes.ok) {
        const printingData = await printingRes.json()
        setPrintingRequests(printingData.requests || [])
      }

      if (restorationRes.ok) {
        const restorationData = await restorationRes.json()
        setRestorationRequests(restorationData.requests || [])
      }

      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json()
        setOnlineMeetings(meetingsData.meetings || [])
      }

      if (classesRes.ok) {
        const classesData = await classesRes.json()
        setAfternoonClasses(classesData.classes || [])
      }

      if (chatUsersRes.ok) {
        const chatUsersData = await chatUsersRes.json()
        setChatUsers(chatUsersData)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
      toast({ title: "Error loading dashboard", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session, fetchDashboardData])

  const handlePrintingRequestStatus = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`/api/librarian/printing-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast({ title: "Printing request status updated" })
        fetchDashboardData()
      } else {
        toast({ title: "Error updating status", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating printing request status:', error)
      toast({ title: "Error updating status", variant: "destructive" })
    }
  }

  const handleRestorationRequestStatus = async (requestId: string, status: string) => {
    try {
      const response = await fetch(`/api/librarian/restoration-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast({ title: "Restoration request status updated" })
        fetchDashboardData()
      } else {
        toast({ title: "Error updating status", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating restoration request status:', error)
      toast({ title: "Error updating status", variant: "destructive" })
    }
  }

  // Chat functions
  const handleSendMessage = async (content: string, recipientId: string) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, recipientId })
      })

      if (response.ok) {
        const newMessage = await response.json()
        setChatMessages(prev => [...prev, newMessage])
        toast({ title: "Message sent successfully" })
      } else {
        toast({ title: "Error sending message", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({ title: "Error sending message", variant: "destructive" })
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, isRead: true })
      })
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const handleSelectChatUser = async (userId: string) => {
    setSelectedChatUser(userId)
    try {
      const response = await fetch(`/api/chat/messages?recipientId=${userId}`)
      if (response.ok) {
        const messages = await response.json()
        setChatMessages(messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#8B4513] border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading Librarian Dashboard...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B4513] to-[#D2691E] bg-clip-text text-transparent">
            Librarian Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">
            Manage library services, classes, and member requests
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-2 p-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg">                                                        
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="digital-library" className="flex items-center space-x-2">
              <BookText className="h-4 w-4" />
              <span className="hidden md:inline">Digital Library</span>
            </TabsTrigger>
            <TabsTrigger value="book-reservations" className="flex items-center space-x-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden md:inline">Reservations</span>
            </TabsTrigger>
            <TabsTrigger value="research-assistance" className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden md:inline">Research</span>
            </TabsTrigger>
            <TabsTrigger value="study-spaces" className="flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden md:inline">Study Spaces</span>
            </TabsTrigger>
            <TabsTrigger value="printing-services" className="flex items-center space-x-2">
              <Printer className="h-4 w-4" />
              <span className="hidden md:inline">Printing</span>
            </TabsTrigger>
            <TabsTrigger value="cv-editor" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">CV Editor</span>
            </TabsTrigger>
            <TabsTrigger value="broadcast-email" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span className="hidden md:inline">Broadcast</span>
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden md:inline">Applications</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden md:inline">Chat</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeMembers}</div>
                  <p className="text-xs opacity-90">{stats.totalUsers} total users</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Book Reservations</CardTitle>
                  <BookOpen className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.reservedBooks}</div>
                  <p className="text-xs opacity-90">{stats.overdueBooks} overdue</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Printing Services</CardTitle>
                  <Printer className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.printingRequests}</div>
                  <p className="text-xs opacity-90">Pending requests</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Research Requests</CardTitle>
                  <GraduationCap className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.afternoonClasses}</div>
                  <p className="text-xs opacity-90">Active requests</p>
                </CardContent>
              </Card>
            </div>

            {/* Service Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Digital Library</CardTitle>
                  <BookText className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBooks}</div>
                  <p className="text-xs opacity-90">Digital resources</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Study Spaces</CardTitle>
                  <Monitor className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.onlineMeetings}</div>
                  <p className="text-xs opacity-90">Available spaces</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chat Messages</CardTitle>
                  <MessageSquare className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.chatMessages}</div>
                  <p className="text-xs opacity-90">Today&apos;s messages</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
                <p className="text-sm text-gray-600">Access all library services and management tools</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <Button
                    onClick={() => setSelectedTab("digital-library")}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"   
                  >
                    <BookText className="h-6 w-6" />
                    <span className="text-sm font-medium">Digital Library</span>
                  </Button>

                  <Button
                    onClick={() => setSelectedTab("book-reservations")}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"                                                                                                                      
                  >
                    <ClipboardList className="h-6 w-6" />
                    <span className="text-sm font-medium">Reservations</span>
                  </Button>

                  <Button
                    onClick={() => setSelectedTab("research-assistance")}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"                                                                                                                      
                  >
                    <GraduationCap className="h-6 w-6" />
                    <span className="text-sm font-medium">Research</span>
                  </Button>

                  <Button
                    onClick={() => setSelectedTab("study-spaces")}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"                                                                                                                  
                  >
                    <Monitor className="h-6 w-6" />
                    <span className="text-sm font-medium">Study Spaces</span>
                  </Button>

                  <Button
                    onClick={() => setSelectedTab("printing-services")}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"                                                                                                                  
                  >
                    <Printer className="h-6 w-6" />
                    <span className="text-sm font-medium">Printing</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Printing Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {printingRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{request.documentName}</p>
                          <p className="text-xs text-gray-500">{request.userName}</p>
                        </div>
                        <Badge variant={
                          request.status === "COMPLETED" ? "default" :
                          request.status === "IN_PROGRESS" ? "secondary" :
                          "outline"
                        }>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upcoming Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {afternoonClasses.slice(0, 5).map((classItem) => (
                      <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{classItem.title}</p>
                          <p className="text-xs text-gray-500">{classItem.instructorName}</p>
                        </div>
                        <Badge variant={
                          classItem.status === "ONGOING" ? "default" :
                          classItem.status === "SCHEDULED" ? "secondary" :
                          "outline"
                        }>
                          {classItem.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          <TabsContent value="digital-library" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Digital Library Management</CardTitle>                                                                                                                   
                <p className="text-sm text-gray-600">Full control over digital books, ebooks, and online resources</p>
              </CardHeader>
              <CardContent>
                <BookManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="book-reservations" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Book Reservations</CardTitle>                                                                                                                   
                <p className="text-sm text-gray-600">Manage book reservations and checkouts</p>
              </CardHeader>
              <CardContent>
                <ReservationManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research-assistance" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Research Assistance Management</CardTitle>                                                                                                                   
                <p className="text-sm text-gray-600">Full control over research requests and academic support</p>
              </CardHeader>
              <CardContent>
                <ContentManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="study-spaces" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Study Spaces Management</CardTitle>                                                                                                                   
                <p className="text-sm text-gray-600">Full control over study room bookings and space availability</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Study Room A</h3>
                          <p className="text-sm text-gray-600">Capacity: 4 people</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Available</Badge>
                      </div>
                    </Card>
                    <Card className="p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Study Room B</h3>
                          <p className="text-sm text-gray-600">Capacity: 6 people</p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Occupied</Badge>
                      </div>
                    </Card>
                    <Card className="p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Study Room C</h3>
                          <p className="text-sm text-gray-600">Capacity: 2 people</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Available</Badge>
                      </div>
                    </Card>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setIsAddSpaceDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Space
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setIsViewBookingsDialogOpen(true)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      View Bookings
                    </Button>
                    <Button asChild className="bg-[#8B4513] hover:bg-[#A0522D] text-white">
                      <a href="/study-spaces" target="_blank">
                        <Monitor className="h-4 w-4 mr-2" />
                        Open Study Spaces
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="printing-services" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Printing Services Management</CardTitle>                                                                                                                   
                <p className="text-sm text-gray-600">Full control over printing requests and document services</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Pending Jobs</h3>
                          <p className="text-2xl font-bold text-blue-600">12</p>
                        </div>
                        <Clock className="h-8 w-8 text-blue-600" />
                      </div>
                    </Card>
                    <Card className="p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">In Progress</h3>
                          <p className="text-2xl font-bold text-yellow-600">3</p>
                        </div>
                        <Printer className="h-8 w-8 text-yellow-600" />
                      </div>
                    </Card>
                    <Card className="p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Completed Today</h3>
                          <p className="text-2xl font-bold text-green-600">28</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </Card>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setIsAddServiceDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Service
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setIsViewRequestsDialogOpen(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View All Requests
                    </Button>
                    <Button asChild className="bg-[#8B4513] hover:bg-[#A0522D] text-white">
                      <a href="/printing-services" target="_blank">
                        <Printer className="h-4 w-4 mr-2" />
                        Open Printing Services
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cv-editor" className="space-y-6">
            <CVEditor />
          </TabsContent>

          <TabsContent value="broadcast-email" className="space-y-6">
            <BroadcastEmail />
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Membership Applications</CardTitle>                                                                                                             
                <p className="text-sm text-gray-600">Review and process membership applications</p>
              </CardHeader>
              <CardContent>
                <ApplicationsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Chat Management</CardTitle>
                <p className="text-sm text-gray-600">Communicate with members and staff</p>
              </CardHeader>
              <CardContent>
                <ChatInterface 
                  currentUser={{
                    id: session?.user?.id || "librarian",
                    name: session?.user?.name || "Librarian",
                    email: session?.user?.email || "librarian@davel-library.com",
                    role: session?.user?.role || "LIBRARIAN",
                    avatar: undefined,
                    isOnline: true,
                    lastSeen: new Date(),
                    unreadCount: 0
                  }}
                  users={chatUsers}
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                  onMarkAsRead={handleMarkAsRead}
                  onSelectUser={handleSelectChatUser}
                  selectedUserId={selectedChatUser}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add dialogs for creating new items */}
      <PrintingRequestDialog 
        isOpen={isAddPrintingDialogOpen}
        onClose={() => setIsAddPrintingDialogOpen(false)}
        onSuccess={fetchDashboardData}
      />
      
      <RestorationRequestDialog 
        isOpen={isAddRestorationDialogOpen}
        onClose={() => setIsAddRestorationDialogOpen(false)}
        onSuccess={fetchDashboardData}
      />
      
      <OnlineMeetingDialog 
        isOpen={isAddMeetingDialogOpen}
        onClose={() => setIsAddMeetingDialogOpen(false)}
        onSuccess={fetchDashboardData}
      />
      
      <AfternoonClassDialog 
        isOpen={isAddClassDialogOpen}
        onClose={() => setIsAddClassDialogOpen(false)}
        onSuccess={fetchDashboardData}
      />

      {/* Add New Space Dialog */}
      <Dialog open={isAddSpaceDialogOpen} onOpenChange={setIsAddSpaceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Study Space</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="spaceName">Space Name</Label>
              <Input id="spaceName" placeholder="e.g., Study Room D" />
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" placeholder="Number of people" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Floor 2, Room 201" />
            </div>
            <div>
              <Label htmlFor="amenities">Amenities</Label>
              <Textarea id="amenities" placeholder="e.g., Whiteboard, WiFi, Power outlets" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSpaceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({ title: "Study space added successfully!" })
              setIsAddSpaceDialogOpen(false)
            }}>
              Add Space
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Bookings Dialog */}
      <Dialog open={isViewBookingsDialogOpen} onOpenChange={setIsViewBookingsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Study Space Bookings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Study Room A</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>John Doe</span>
                    <span>2:00 PM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Jane Smith</span>
                    <span>5:00 PM - 7:00 PM</span>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Study Room B</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mike Johnson</span>
                    <span>1:00 PM - 3:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sarah Wilson</span>
                    <span>4:00 PM - 6:00 PM</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewBookingsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Service Dialog */}
      <Dialog open={isAddServiceDialogOpen} onOpenChange={setIsAddServiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Printing Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="serviceName">Service Name</Label>
              <Input id="serviceName" placeholder="e.g., Color Printing" />
            </div>
            <div>
              <Label htmlFor="pricePerPage">Price per Page</Label>
              <Input id="pricePerPage" type="number" step="0.01" placeholder="0.50" />
            </div>
            <div>
              <Label htmlFor="colorPrice">Color Price (if applicable)</Label>
              <Input id="colorPrice" type="number" step="0.01" placeholder="0.25" />
            </div>
            <div>
              <Label htmlFor="maxPages">Maximum Pages</Label>
              <Input id="maxPages" type="number" placeholder="100" />
            </div>
            <div>
              <Label htmlFor="turnaroundTime">Turnaround Time</Label>
              <Input id="turnaroundTime" placeholder="24 hours" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddServiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({ title: "Printing service added successfully!" })
              setIsAddServiceDialogOpen(false)
            }}>
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View All Requests Dialog */}
      <Dialog open={isViewRequestsDialogOpen} onOpenChange={setIsViewRequestsDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>All Printing Requests</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Research Paper - John Doe</h3>
                    <p className="text-sm text-gray-600">15 pages, 2 copies, Color</p>
                    <p className="text-sm text-gray-500">Submitted: 2 hours ago</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Presentation Slides - Jane Smith</h3>
                    <p className="text-sm text-gray-600">25 pages, 1 copy, Black & White</p>
                    <p className="text-sm text-gray-500">Submitted: 1 hour ago</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Thesis Document - Mike Johnson</h3>
                    <p className="text-sm text-gray-600">80 pages, 3 copies, Black & White</p>
                    <p className="text-sm text-gray-500">Submitted: 30 minutes ago</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
              </Card>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsViewRequestsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
