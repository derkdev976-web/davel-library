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
  Plus, Edit, Trash, Eye, Clock, Star, MessageSquare, Settings,
  UserCheck, UserX, Shield, Download, Upload, BarChart3, Activity,
  Palette, BookText, ClipboardList, CalendarDays, Mail, Printer,
  Video, BookMarked, GraduationCap, Scissors, FileText, Users2,
  Clock3, MapPin, Phone, Mail as MailIcon, Monitor, Headphones
} from "lucide-react"
import { ReservationManager } from "@/components/admin/reservation-manager"
import { ApplicationsManager } from "@/components/admin/applications-manager"
import { ChatInterface } from "@/components/chat/chat-interface"
import { PrintingRequestDialog } from "@/components/librarian/printing-request-dialog"
import { RestorationRequestDialog } from "@/components/librarian/restoration-request-dialog"
import { OnlineMeetingDialog } from "@/components/librarian/online-meeting-dialog"
import { AfternoonClassDialog } from "@/components/librarian/afternoon-class-dialog"
import { PrintingRequestsTable } from "@/components/librarian/printing-requests-table"
import { RestorationRequestsTable } from "@/components/librarian/restoration-requests-table"
import { OnlineMeetingsTable } from "@/components/librarian/online-meetings-table"
import { AfternoonClassesTable } from "@/components/librarian/afternoon-classes-table"

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
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-2 p-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="printing" className="flex items-center space-x-2">
              <Printer className="h-4 w-4" />
              <span className="hidden md:inline">Printing</span>
            </TabsTrigger>
            <TabsTrigger value="restoration" className="flex items-center space-x-2">
              <BookMarked className="h-4 w-4" />
              <span className="hidden md:inline">Restoration</span>
            </TabsTrigger>
            <TabsTrigger value="meetings" className="flex items-center space-x-2">
              <Video className="h-4 w-4" />
              <span className="hidden md:inline">Meetings</span>
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden md:inline">Classes</span>
            </TabsTrigger>
            <TabsTrigger value="reservations" className="flex items-center space-x-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden md:inline">Reservations</span>
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
                  <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
                  <BookOpen className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.reservedBooks}</div>
                  <p className="text-xs opacity-90">{stats.overdueBooks} overdue</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Printing Requests</CardTitle>
                  <Printer className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.printingRequests}</div>
                  <p className="text-xs opacity-90">Pending requests</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Afternoon Classes</CardTitle>
                  <GraduationCap className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.afternoonClasses}</div>
                  <p className="text-xs opacity-90">Active classes</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
                <p className="text-sm text-gray-600">Common librarian tasks and services</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    onClick={() => setIsAddPrintingDialogOpen(true)}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Printer className="h-6 w-6" />
                    <span className="text-sm font-medium">New Print Job</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setIsAddRestorationDialogOpen(true)}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <BookMarked className="h-6 w-6" />
                    <span className="text-sm font-medium">Book Restoration</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setIsAddMeetingDialogOpen(true)}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Video className="h-6 w-6" />
                    <span className="text-sm font-medium">Online Meeting</span>
                  </Button>
                  
                  <Button 
                    onClick={() => setIsAddClassDialogOpen(true)}
                    className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <GraduationCap className="h-6 w-6" />
                    <span className="text-sm font-medium">New Class</span>
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

          <TabsContent value="printing" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Printing Requests</CardTitle>
                  <p className="text-sm text-gray-600">Manage document printing requests from members</p>
                </div>
                <Button onClick={() => setIsAddPrintingDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <PrintingRequestsTable 
                  requests={printingRequests}
                  onStatusUpdate={handlePrintingRequestStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="restoration" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Book Restoration</CardTitle>
                  <p className="text-sm text-gray-600">Manage book restoration and repair requests</p>
                </div>
                <Button onClick={() => setIsAddRestorationDialogOpen(true)} className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <RestorationRequestsTable 
                  requests={restorationRequests}
                  onStatusUpdate={handleRestorationRequestStatus}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Online Meetings</CardTitle>
                  <p className="text-sm text-gray-600">Schedule and manage virtual meetings and study groups</p>
                </div>
                <Button onClick={() => setIsAddMeetingDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Meeting
                </Button>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <OnlineMeetingsTable meetings={onlineMeetings} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Afternoon Classes</CardTitle>
                  <p className="text-sm text-gray-600">Manage educational classes and workshops</p>
                </div>
                <Button onClick={() => setIsAddClassDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Class
                </Button>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <AfternoonClassesTable classes={afternoonClasses} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add other tabs for reservations, applications, chat, etc. */}
          <TabsContent value="reservations" className="space-y-6">
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
    </div>
  )
}
