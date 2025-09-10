"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { 
  BarChart3, Users, BookText, ClipboardList, UserCheck, Upload, 
  MessageSquare, Settings, Palette, Download, Activity, Mail, 
  FileText, Phone, DollarSign, Calendar, Shield, Menu, X,
  Bell, Home, ChevronRight
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

interface DashboardStats {
  totalUsers: number
  totalBooks: number
  totalReservations: number
  pendingApplications: number
}

export function MobileAdminDashboard() {
  const { data: session, status } = useSession()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Mobile menu items organized by category
  const menuCategories = [
    {
      title: "Overview",
      items: [
        { id: "overview", label: "Dashboard", icon: BarChart3, color: "bg-blue-500" },
        { id: "analytics", label: "Analytics", icon: Activity, color: "bg-green-500" }
      ]
    },
    {
      title: "User Management",
      items: [
        { id: "users", label: "Users", icon: Users, color: "bg-purple-500" },
        { id: "applications", label: "Applications", icon: UserCheck, color: "bg-orange-500" },
        { id: "permissions", label: "Permissions", icon: Shield, color: "bg-red-500" }
      ]
    },
    {
      title: "Content & Books",
      items: [
        { id: "books", label: "Books", icon: BookText, color: "bg-indigo-500" },
        { id: "reservations", label: "Reservations", icon: ClipboardList, color: "bg-teal-500" },
        { id: "content", label: "Content", icon: Upload, color: "bg-pink-500" },
        { id: "ebooks", label: "E-books", icon: Download, color: "bg-cyan-500" }
      ]
    },
    {
      title: "Communication",
      items: [
        { id: "email", label: "Email", icon: Mail, color: "bg-yellow-500" },
        { id: "chat", label: "Chat", icon: MessageSquare, color: "bg-emerald-500" },
        { id: "contacts", label: "Contacts", icon: Phone, color: "bg-rose-500" }
      ]
    },
    {
      title: "Settings & Customization",
      items: [
        { id: "themes", label: "Themes", icon: Palette, color: "bg-violet-500" },
        { id: "homepage", label: "Homepage", icon: Home, color: "bg-amber-500" },
        { id: "documents", label: "Documents", icon: FileText, color: "bg-slate-500" },
        { id: "fees", label: "Fees", icon: DollarSign, color: "bg-lime-500" },
        { id: "events", label: "Events", icon: Calendar, color: "bg-sky-500" }
      ]
    }
  ]

  const fetchDashboardData = async () => {
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
  }

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchDashboardData()
    }
  }, [session])

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
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                  <BookText className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalBooks || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reservations</CardTitle>
                  <ClipboardList className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalReservations || 0}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Apps</CardTitle>
                  <UserCheck className="h-5 w-5" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.pendingApplications || 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
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
      case "themes":
        return <ColorCustomizer />
      case "homepage":
        return <HomepageManager />
      case "documents":
        return <DocumentManagement />
      case "contacts":
        return <MemberContactDirectory />
      case "fees":
        return <FeeManagement />
      case "events":
        return <EventManager />
      case "permissions":
        return <UserPermissionsManager />
      case "analytics":
        return <ContactStatistics />
      default:
        return <div>Content not found</div>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <main className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your library's operations and content</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mb-6">
              <Card className="bg-white dark:bg-gray-800 shadow-lg">
                <CardContent className="p-4">
                  {menuCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-4 last:mb-0">
                      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                        {category.title}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {category.items.map((item) => {
                          const IconComponent = item.icon
                          return (
                            <Button
                              key={item.id}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTab(item.id)
                                setIsMobileMenuOpen(false)
                              }}
                              className={`h-12 flex flex-col items-center justify-center space-y-1 ${
                                selectedTab === item.id 
                                  ? "bg-[#8B4513] text-white border-[#8B4513]" 
                                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              <IconComponent className="h-4 w-4" />
                              <span className="text-xs">{item.label}</span>
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden lg:block mb-6">
            <Card className="bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  {menuCategories.flatMap(category => category.items).map((item) => {
                    const IconComponent = item.icon
                    return (
                      <Button
                        key={item.id}
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTab(item.id)}
                        className={`flex items-center space-x-2 ${
                          selectedTab === item.id 
                            ? "bg-[#8B4513] text-white border-[#8B4513]" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  )
}
