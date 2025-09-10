"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  BarChart3, Users, BookText, ClipboardList, UserCheck, Upload, 
  MessageSquare, Settings, Palette, Download, Activity, Mail, 
  FileText, Phone, DollarSign, Calendar, Shield, Menu, X,
  Bell, Home, ChevronRight, Search, Filter, Plus, Eye
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { EmailTest } from "@/components/admin/email-test"
import { BookManager } from "@/components/admin/book-manager"
import { ReservationManager } from "@/components/admin/reservation-manager"
import { ApplicationsManager } from "@/components/admin/applications-manager"
import { ContentManager } from "@/components/admin/content-manager"
import { UserPermissionsManager } from "@/components/admin/user-permissions-manager"
import { EventManager } from "@/components/admin/event-manager"
import { ColorCustomizer } from "@/components/admin/color-customizer"
import { HomepageManager } from "@/components/admin/homepage-manager"
import { DocumentManagement } from "@/components/admin/document-management"
import { MemberContactDirectory } from "@/components/admin/member-contact-directory"
import { FeeManagement } from "@/components/admin/fee-management"
import { ContactStatistics } from "@/components/admin/contact-statistics"
import { NotificationSystem } from "@/components/notifications/notification-system"

interface DashboardStats {
  totalUsers: number
  totalBooks: number
  totalReservations: number
  pendingApplications: number
}

export function MobileAdminDashboardV2() {
  const { data: session, status } = useSession()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Mobile-optimized menu structure
  const menuSections = [
    {
      title: "Dashboard",
      icon: BarChart3,
      color: "bg-blue-600",
      items: [
        { id: "overview", label: "Overview", icon: BarChart3, description: "Main dashboard" },
        { id: "analytics", label: "Analytics", icon: Activity, description: "Usage statistics" }
      ]
    },
    {
      title: "User Management",
      icon: Users,
      color: "bg-purple-600",
      items: [
        { id: "users", label: "Users", icon: Users, description: "Manage users" },
        { id: "applications", label: "Applications", icon: UserCheck, description: "Membership applications" },
        { id: "permissions", label: "Permissions", icon: Shield, description: "User permissions" }
      ]
    },
    {
      title: "Content & Books",
      icon: BookText,
      color: "bg-green-600",
      items: [
        { id: "books", label: "Books", icon: BookText, description: "Book management" },
        { id: "reservations", label: "Reservations", icon: ClipboardList, description: "Book reservations" },
        { id: "content", label: "Content", icon: Upload, description: "Library content" }
      ]
    },
    {
      title: "Communication",
      icon: Mail,
      color: "bg-orange-600",
      items: [
        { id: "email", label: "Email", icon: Mail, description: "Email management" },
        { id: "notifications", label: "Notifications", icon: Bell, description: "User notifications" }
      ]
    },
    {
      title: "Settings",
      icon: Settings,
      color: "bg-gray-600",
      items: [
        { id: "themes", label: "Themes", icon: Palette, description: "Appearance settings" },
        { id: "homepage", label: "Homepage", icon: Home, description: "Homepage content" },
        { id: "documents", label: "Documents", icon: FileText, description: "Document management" }
      ]
    }
  ]

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/dashboard")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({ title: "Error loading dashboard", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchDashboardData()
    }
  }, [session, fetchDashboardData])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <main className="pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513]"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <main className="pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Access Denied</h2>
              <p className="text-red-600 dark:text-red-300">You need admin privileges to access this dashboard.</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (selectedTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Users</p>
                      <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Total Books</p>
                      <p className="text-2xl font-bold">{stats?.totalBooks || 0}</p>
                    </div>
                    <BookText className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Reservations</p>
                      <p className="text-2xl font-bold">{stats?.totalReservations || 0}</p>
                    </div>
                    <ClipboardList className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Pending Apps</p>
                      <p className="text-2xl font-bold">{stats?.pendingApplications || 0}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => setSelectedTab("users")}
                    className="h-16 flex flex-col items-center justify-center space-y-2 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Manage Users</span>
                  </Button>
                  <Button 
                    onClick={() => setSelectedTab("books")}
                    className="h-16 flex flex-col items-center justify-center space-y-2 bg-green-500 hover:bg-green-600 text-white"
                  >
                    <BookText className="h-6 w-6" />
                    <span className="text-sm">Manage Books</span>
                  </Button>
                  <Button 
                    onClick={() => setSelectedTab("applications")}
                    className="h-16 flex flex-col items-center justify-center space-y-2 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <UserCheck className="h-6 w-6" />
                    <span className="text-sm">Applications</span>
                  </Button>
                  <Button 
                    onClick={() => setSelectedTab("email")}
                    className="h-16 flex flex-col items-center justify-center space-y-2 bg-yellow-500 hover:bg-yellow-600 text-white"
                  >
                    <Mail className="h-6 w-6" />
                    <span className="text-sm">Send Email</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">New user registered</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Book reservation approved</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">New membership application</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">10 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case "users":
        return <UserPermissionsManager />
      case "books":
        return <BookManager />
      case "reservations":
        return <ReservationManager />
      case "applications":
        return <ApplicationsManager />
      case "content":
        return <ContentManager />
      case "email":
        return <EmailTest />
      case "notifications":
        return <NotificationSystem />
      case "themes":
        return <ColorCustomizer />
      case "homepage":
        return <HomepageManager />
      case "documents":
        return <DocumentManagement />
      case "analytics":
        return <ContactStatistics />
      default:
        return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Content not found</div>
    }
  }

  const filteredSections = menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <main className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your library&apos;s operations</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
              >
                {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Mobile Sidebar */}
            <div className={`lg:block ${isSidebarOpen ? 'block' : 'hidden'} lg:w-80 w-full lg:relative absolute top-0 left-0 z-50 lg:z-auto`}>
              <Card className="bg-white dark:bg-gray-800 shadow-lg lg:shadow-none lg:border-0">
                <CardContent className="p-4">
                  {/* Search */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search menu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Menu Sections */}
                  <div className="space-y-4">
                    {filteredSections.map((section, sectionIndex) => {
                      const SectionIcon = section.icon
                      return (
                        <div key={sectionIndex}>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-8 h-8 rounded-lg ${section.color} flex items-center justify-center`}>
                              <SectionIcon className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                              {section.title}
                            </h3>
                          </div>
                          <div className="space-y-1 ml-10">
                            {section.items.map((item) => {
                              const ItemIcon = item.icon
                              return (
                                <Button
                                  key={item.id}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTab(item.id)
                                    setIsSidebarOpen(false)
                                  }}
                                  className={`w-full justify-start h-auto p-3 ${
                                    selectedTab === item.id 
                                      ? "bg-[#8B4513] text-white hover:bg-[#8B4513]/90" 
                                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <ItemIcon className="h-4 w-4" />
                                    <div className="text-left">
                                      <p className="text-sm font-medium">{item.label}</p>
                                      <p className="text-xs opacity-75">{item.description}</p>
                                    </div>
                                  </div>
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
