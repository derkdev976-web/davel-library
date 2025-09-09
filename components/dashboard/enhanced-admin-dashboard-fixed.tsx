"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Header } from "@/components/layout/header"
import { useToast } from "@/hooks/use-toast"
import FreeEbooksManager from './free-ebooks-manager'
import { 
  Users, BookOpen, Calendar, AlertCircle, CheckCircle, XCircle, 
  Plus, Edit, Trash, Eye, Clock, Star, MessageSquare, Settings,
  UserCheck, UserX, Shield, Download, Upload, BarChart3, Activity
} from "lucide-react"
import Image from 'next/image'

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
  page: string
  duration?: number
  visitedAt: string
}

export function EnhancedAdminDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview")
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([])
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [userVisits, setUserVisits] = useState<UserVisit[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [statsRes, usersRes, booksRes, newsRes, galleryRes, visitsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/books"),
        fetch("/api/admin/news"),
        fetch("/api/admin/gallery"),
        fetch("/api/admin/visits")
      ])

      if (statsRes.ok) setStats(await statsRes.json())
      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(Array.isArray(usersData) ? usersData : [])
      }
      if (booksRes.ok) {
        const booksData = await booksRes.json()
        setBooks(Array.isArray(booksData) ? booksData : [])
      }
      if (newsRes.ok) {
        const newsData = await newsRes.json()
        setNewsEvents(Array.isArray(newsData) ? newsData : [])
      }
      if (galleryRes.ok) {
        const galleryData = await galleryRes.json()
        setGalleryImages(Array.isArray(galleryData) ? galleryData : [])
      }
      if (visitsRes.ok) {
        const visitsData = await visitsRes.json()
        setUserVisits(Array.isArray(visitsData) ? visitsData : [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setError("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  const promoteToTemporaryAdmin = async (userId: string, duration: number) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration })
      })
      if (response.ok) {
        toast({ title: "User promoted to temporary admin" })
        fetchDashboardData()
      }
    } catch (error) {
      toast({ title: "Error promoting user", variant: "destructive" })
    }
  }

  const revokeTemporaryAdmin = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/revoke`, {
        method: "POST"
      })
      if (response.ok) {
        toast({ title: "Temporary admin access revoked" })
        fetchDashboardData()
      }
    } catch (error) {
      toast({ title: "Error revoking access", variant: "destructive" })
    }
  }

  const updateContentVisibility = async (contentType: string, contentId: string, visibility: string) => {
    try {
      const response = await fetch(`/api/admin/content/${contentType}/${contentId}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility })
      })
      if (response.ok) {
        toast({ title: "Content visibility updated" })
        fetchDashboardData()
      }
    } catch (error) {
      toast({ title: "Error updating visibility", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg">Loading dashboard data...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-auto"
                  onClick={fetchDashboardData}
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient">Enhanced Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Comprehensive library management system with advanced features
            </p>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="books">Books</TabsTrigger>
              <TabsTrigger value="digital-library">Digital Library</TabsTrigger>
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="study-spaces">Study Spaces</TabsTrigger>
              <TabsTrigger value="printing">Printing</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="homepage">Homepage</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.activeMembers || 0} active members
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Books</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalBooks || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.reservedBooks || 0} currently reserved
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today&apos;s Visits</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.todayVisits || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.totalVisits || 0} total visits
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.pendingApplications || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Applications to review
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                      <Users className="h-6 w-6" />
                      <span>Manage Users</span>
                    </Button>
                    <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                      <BookOpen className="h-6 w-6" />
                      <span>Add Book</span>
                    </Button>
                    <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                      <Calendar className="h-6 w-6" />
                      <span>View Events</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>



            <TabsContent value="books" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Book Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <BooksTable 
                    books={books}
                    onSelectBook={setSelectedBook}
                    onUpdateVisibility={updateContentVisibility}
                  />
                </CardContent>
              </Card>

              {selectedBook && (
                <BookDetailsDialog 
                  book={selectedBook} 
                  onClose={() => setSelectedBook(null)}
                  onUpdate={fetchDashboardData}
                />
              )}
            </TabsContent>

            <TabsContent value="digital-library" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ebook Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Ebooks</span>
                        <span className="font-bold">{books?.filter((b: Book) => b.isDigital).length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Locked Ebooks</span>
                        <span className="font-bold text-red-600">{books?.filter((b: Book) => b.isDigital && b.visibility === 'LOCKED').length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available for Download</span>
                        <span className="font-bold text-green-600">{books?.filter((b: Book) => b.isDigital && b.visibility === 'PUBLIC').length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Ebook Uploads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {books?.filter((b: Book) => b.isDigital).slice(0, 5).map((book: Book) => (
                        <div key={book.id} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{book.title}</p>
                            <p className="text-sm text-gray-600">{book.author}</p>
                          </div>
                          <Badge variant={book.visibility === 'PUBLIC' ? 'default' : 'secondary'}>
                            {book.visibility}
                          </Badge>
                        </div>
                      )) || <p className="text-gray-500 text-sm">No digital books available</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Free Ebooks Manager */}
              <FreeEbooksManager />
            </TabsContent>



            <TabsContent value="research" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Research Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">Open</div>
                        <p className="text-sm text-gray-600">New Requests</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">In Progress</div>
                        <p className="text-sm text-gray-600">Being Worked On</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">Resolved</div>
                        <p className="text-sm text-gray-600">Completed</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">Closed</div>
                        <p className="text-sm text-gray-600">Archived</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="study-spaces" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Study Space Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">Available</div>
                        <p className="text-sm text-gray-600">Ready for use</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">Occupied</div>
                        <p className="text-sm text-gray-600">Currently in use</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">Maintenance</div>
                        <p className="text-sm text-gray-600">Under repair</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="printing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Printing Services</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">Online</div>
                        <p className="text-sm text-gray-600">Printers available</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">Queue</div>
                        <p className="text-sm text-gray-600">Jobs waiting</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-red-600">Offline</div>
                        <p className="text-sm text-gray-600">Maintenance needed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>News & Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ContentTable 
                      items={newsEvents}
                      type="news"
                      onUpdateVisibility={updateContentVisibility}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gallery</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ContentTable 
                      items={galleryImages}
                      type="gallery"
                      onUpdateVisibility={updateContentVisibility}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <AnalyticsChart data={userVisits} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="homepage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Homepage Content Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <HomepageEditor />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <SystemSettings />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

// Component implementations
function UsersTable({ users, onPromote, onRevoke, onSelectUser }: any) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-3">Name</th>
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
                <td className="p-3">{user.name || "—"}</td>
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
                <td className="p-3 text-right space-x-2">
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

function BooksTable({ books, onSelectBook, onUpdateVisibility }: any) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Author</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Visibility</th>
              <th className="text-left p-3">Copies</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book: Book) => (
              <tr key={book.id} className="border-t">
                <td className="p-3">{book.title}</td>
                <td className="p-3 text-muted-foreground">{book.author}</td>
                <td className="p-3">
                  <Badge variant={book.isDigital ? "default" : "secondary"}>
                    {book.isDigital ? "Digital" : "Physical"}
                  </Badge>
                </td>
                <td className="p-3">
                  <Select 
                    value={book.visibility} 
                    onValueChange={(value) => onUpdateVisibility("book", book.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="MEMBERS_ONLY">Members Only</SelectItem>
                      <SelectItem value="ADMIN_ONLY">Admin Only</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-3">{book.availableCopies}/{book.totalCopies}</td>
                <td className="p-3 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => onSelectBook(book)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ContentTable({ items, type, onUpdateVisibility }: any) {
  return (
    <div className="space-y-4">
      {items.map((item: any) => (
        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            {type === "gallery" && (
              <Image src={item.imageUrl} alt={item.title} width={48} height={48} className="object-cover rounded" />
            )}
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select 
              value={item.visibility} 
              onValueChange={(value) => onUpdateVisibility(type, item.id, value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">Public</SelectItem>
                <SelectItem value="MEMBERS_ONLY">Members Only</SelectItem>
                <SelectItem value="ADMIN_ONLY">Admin Only</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function UserDetailsDialog({ user, onClose, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email,
    role: user.role,
    isActive: user.isActive
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input 
              value={formData.email} 
              disabled
            />
          </div>
          <div>
            <Label>Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => setFormData({...formData, role: value})}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GUEST">Guest</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
                <SelectItem value="LIBRARIAN">Librarian</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              disabled={!isEditing}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                onUpdate()
                setIsEditing(false)
              }}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BookDetailsDialog({ book, onClose, onUpdate }: any) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={book.title} disabled />
          </div>
          <div>
            <Label>Author</Label>
            <Input value={book.author} disabled />
          </div>
          <div>
            <Label>Type</Label>
            <Badge variant={book.isDigital ? "default" : "secondary"}>
              {book.isDigital ? "Digital" : "Physical"}
            </Badge>
          </div>
          <div>
            <Label>Visibility</Label>
            <Badge variant="outline">{book.visibility}</Badge>
          </div>
          <div>
            <Label>Copies</Label>
            <p>{book.availableCopies} available / {book.totalCopies} total</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AnalyticsChart({ data }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{data?.length || 0}</div>
          <p className="text-sm text-gray-600">Total Visits</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {data?.filter((visit: any) => new Date(visit.visitedAt).toDateString() === new Date().toDateString()).length || 0}
          </div>
          <p className="text-sm text-gray-600">Today&apos;s Visits</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {data?.reduce((acc: number, visit: any) => acc + (visit.duration || 0), 0) || 0}
          </div>
          <p className="text-sm text-gray-600">Total Duration (min)</p>
        </div>
      </div>
    </div>
  )
}

function HomepageEditor() {
  return (
    <div className="space-y-4">
      <div>
        <Label>Hero Title</Label>
        <Input placeholder="Enter hero title" />
      </div>
      <div>
        <Label>Hero Description</Label>
        <Textarea placeholder="Enter hero description" />
      </div>
      <div>
        <Label>Featured Content</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select content to feature" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest-books">Latest Books</SelectItem>
            <SelectItem value="upcoming-events">Upcoming Events</SelectItem>
            <SelectItem value="popular-services">Popular Services</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button>Save Changes</Button>
    </div>
  )
}

function SupportRequestsTable() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-red-600">Open</div>
          <p className="text-sm text-gray-600">New Requests</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-blue-600">In Progress</div>
          <p className="text-sm text-gray-600">Being Worked On</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-green-600">Resolved</div>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="text-center p-4 border rounded-lg">
          <div className="text-2xl font-bold text-gray-600">Closed</div>
          <p className="text-sm text-gray-600">Archived</p>
        </div>
      </div>
    </div>
  )
}

function SystemSettings() {
  return (
    <div className="space-y-4">
      <div>
        <Label>Library Name</Label>
        <Input placeholder="Enter library name" />
      </div>
      <div>
        <Label>Contact Email</Label>
        <Input type="email" placeholder="Enter contact email" />
      </div>
      <div>
        <Label>Max Book Reservations</Label>
        <Input type="number" placeholder="Enter max reservations" />
      </div>
      <div>
        <Label>Reservation Duration (days)</Label>
        <Input type="number" placeholder="Enter reservation duration" />
      </div>
      <Button>Save Settings</Button>
    </div>
  )
}
