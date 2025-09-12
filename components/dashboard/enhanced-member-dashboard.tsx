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
  DollarSign
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
  renewalCount: number
  returnedAt?: string
  bookId: string
  isDigital?: boolean
  isElectronic?: boolean
  digitalFile?: string
}

interface ChatMessage {
  id: string
  content: string
  senderId: string
  senderName: string
  senderRole: string
  recipientId: string
  recipientName: string
  recipientRole: string
  isSystem: boolean
  createdAt: string
  isRead: boolean
}

interface SupportRequest {
  id: string
  title: string
  category: string
  status: string
  priority: string
  createdAt: string
}

export function EnhancedMemberDashboard() {
  const { data: session } = useSession()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [reservations, setReservations] = useState<BookReservation[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<BookReservation | null>(null)
  const [barcodeData, setBarcodeData] = useState<any>(null)
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false)
  const [ebooks, setEbooks] = useState<any[]>([])
  const [selectedEbook, setSelectedEbook] = useState<any | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    console.log("Member Dashboard - Session:", session)
    if (session?.user?.id) {
      console.log("Fetching member data for user:", session.user.id)
      fetchMemberData()
    } else {
      console.log("No session or user ID found")
    }
  }, [session])

  const fetchMemberData = async () => {
    try {
      console.log("Fetching member data...")
      const [profileRes, reservationsRes, chatRes, supportRes, ebooksRes] = await Promise.all([
        fetch(`/api/member/profile`),
        fetch(`/api/member/reservations`),
        fetch(`/api/member/chat`),
        fetch(`/api/member/support`),
        fetch(`/api/books/free-ebooks`)
      ])

      console.log("API Responses:", {
        profile: profileRes.status,
        reservations: reservationsRes.status,
        chat: chatRes.status,
        support: supportRes.status,
        ebooks: ebooksRes.status
      })

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        console.log("Profile data:", profileData)
        setProfile(profileData)
      } else {
        console.error("Profile API error:", await profileRes.text())
      }
      
      if (reservationsRes.ok) {
        const reservationsData = await reservationsRes.json()
        console.log("Reservations data:", reservationsData)
        setReservations(reservationsData)
      } else {
        console.error("Reservations API error:", await reservationsRes.text())
      }
      
      if (chatRes.ok) {
        const chatData = await chatRes.json()
        console.log("Chat data:", chatData)
        setChatMessages(chatData)
      } else {
        console.error("Chat API error:", await chatRes.text())
      }
      
      if (supportRes.ok) {
        const supportData = await supportRes.json()
        console.log("Support data:", supportData)
        setSupportRequests(supportData)
      } else {
        console.error("Support API error:", await supportRes.text())
      }
      
      if (ebooksRes.ok) {
        const ebooksData = await ebooksRes.json()
        console.log("Ebooks data:", ebooksData)
        setEbooks(ebooksData.books || [])
      } else {
        console.error("Ebooks API error:", await ebooksRes.text())
      }
    } catch (error) {
      console.error("Error fetching member data:", error)
    }
  }

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
        setProfile(await response.json())
        setIsEditingProfile(false)
        toast({ title: "Profile updated successfully" })
      }
    } catch (error) {
      toast({ title: "Error updating profile", variant: "destructive" })
    }
  }

  const createSupportRequest = async (request: { title: string; description: string; category: string }) => {
    try {
      const response = await fetch("/api/member/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      })

      if (response.ok) {
        fetchMemberData()
        toast({ title: "Support request created" })
      }
    } catch (error) {
      toast({ title: "Error creating support request", variant: "destructive" })
    }
  }

  const renewBook = async (reservationId: string) => {
    try {
      const response = await fetch(`/api/member/reservations/${reservationId}/renew`, {
        method: "POST"
      })

      if (response.ok) {
        fetchMemberData()
        toast({ title: "Book renewed successfully" })
      }
    } catch (error) {
      toast({ title: "Error renewing book", variant: "destructive" })
    }
  }

  const handleEbookAccess = async (reservation: BookReservation) => {
    try {
      const response = await fetch(`/api/member/ebook/${reservation.id}`)
      const data = await response.json()

      if (response.ok) {
        // For ebooks, we can provide download link or open in new tab
        if (data.digitalFile) {
          window.open(data.digitalFile, '_blank')
          toast({ title: "Ebook opened successfully" })
        } else {
          toast({ title: "Ebook access granted", description: "You can now read the book offline" })
        }
      } else {
        toast({ title: "Error accessing ebook", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      console.error('Error accessing ebook:', error)
      toast({ title: "Error accessing ebook", variant: "destructive" })
    }
  }

  const handleGenerateBarcode = async (reservation: BookReservation) => {
    try {
      const response = await fetch(`/api/member/barcode/${reservation.id}`)
      const data = await response.json()

      if (response.ok) {
        setBarcodeData(data)
        setSelectedReservation(reservation)
        setIsBarcodeModalOpen(true)
        toast({ title: "Barcode generated successfully" })
      } else {
        toast({ title: "Error generating barcode", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      console.error('Error generating barcode:', error)
      toast({ title: "Error generating barcode", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient">Member Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Welcome back, {profile?.firstName || session?.user?.name}!
            </p>
          </div>

          {/* Password Change Reminder */}
          {session?.user?.email && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Security Reminder
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    If you&apos;re using a temporary password, please change it to something secure in your profile settings.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-800"
                  onClick={() => setSelectedTab("profile")}
                >
                  Change Password
                </Button>
              </div>
            </div>
          )}

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-1 p-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="books" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">My Books</span>
                <span className="sm:hidden">Books</span>
              </TabsTrigger>
              <TabsTrigger value="ebooks" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Ebooks</span>
                <span className="sm:hidden">Ebooks</span>
              </TabsTrigger>
              <TabsTrigger value="fees" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Fees</span>
                <span className="sm:hidden">Fees</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Chat</span>
                <span className="sm:hidden">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Support</span>
                <span className="sm:hidden">Help</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Documents</span>
                <span className="sm:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">History</span>
                <span className="sm:hidden">History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Member Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reservations.filter(r => r.status === "CHECKED_OUT").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reservations.filter(r => r.status === "PENDING").length} pending
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Books Read</CardTitle>
                    <History className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {reservations.filter(r => r.status === "RETURNED").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Support Requests</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {supportRequests.filter(r => r.status === "OPEN").length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {supportRequests.filter(r => r.status === "RESOLVED").length} resolved
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Member Since</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {profile?.memberSince ? new Date(profile.memberSince).getFullYear() : "—"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {profile?.memberSince ? new Date(profile.memberSince).toLocaleDateString() : "—"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Book Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reservations.slice(0, 5).map((reservation) => (
                        <div key={reservation.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{reservation.bookTitle}</p>
                            <p className="text-sm text-gray-500">{reservation.bookAuthor}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(reservation.reservedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={
                            reservation.status === "CHECKED_OUT" ? "default" :
                            reservation.status === "PENDING" ? "secondary" :
                            "outline"
                          }>
                            {reservation.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Chat Messages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {chatMessages.slice(0, 5).map((message) => (
                        <div key={message.id} className={`p-3 border rounded-lg ${
                          !message.isSystem ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-800"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditingProfile ? "Cancel" : "Edit Profile"}
                  </Button>
                </CardHeader>
                <CardContent>
                  <ProfileForm 
                    profile={profile}
                    isEditing={isEditingProfile}
                    onSave={updateProfile}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="books" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Book Reservations</CardTitle>
                </CardHeader>
                <CardContent>
                  <BookReservationsTable 
                    reservations={reservations}
                    onRenew={renewBook}
                    onEbookAccess={handleEbookAccess}
                    onGenerateBarcode={handleGenerateBarcode}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ebooks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Digital Library
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Read ebooks directly in your browser with text-to-speech support
                  </p>
                </CardHeader>
                <CardContent>
                  {ebooks.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No ebooks available</h3>
                      <p className="text-muted-foreground">
                        Check back later for new digital books in our collection.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {ebooks.map((ebook) => (
                        <Card key={ebook.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              {ebook.coverImage ? (
                                <Image
                                  src={ebook.coverImage}
                                  alt={ebook.title}
                                  width={80}
                                  height={120}
                                  className="rounded object-cover"
                                />
                              ) : (
                                <div className="w-20 h-30 bg-muted rounded flex items-center justify-center">
                                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                                  {ebook.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                  by {ebook.author}
                                </p>
                                {ebook.summary && (
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                                    {ebook.summary}
                                  </p>
                                )}
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {ebook.source}
                                  </Badge>
                                  {ebook.genre && (
                                    <Badge variant="outline" className="text-xs">
                                      {Array.isArray(ebook.genre) ? ebook.genre[0] : ebook.genre}
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  className="w-full mt-3"
                                  onClick={() => setSelectedEbook(ebook)}
                                >
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  Read Now
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="space-y-6">
              <MemberFees />
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Chat with Library Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChatInterface 
                    messages={chatMessages}
                    newMessage={newMessage}
                    onMessageChange={setNewMessage}
                    onSendMessage={sendChatMessage}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Support Requests</CardTitle>
                  <CreateSupportRequestButton onSuccess={fetchMemberData} />
                </CardHeader>
                <CardContent>
                  <SupportRequestsTable requests={supportRequests} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <UserDocumentManagement />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reading History</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReadingHistoryTable reservations={reservations} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Barcode Modal */}
      <Dialog open={isBarcodeModalOpen} onOpenChange={setIsBarcodeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Collection Barcode</DialogTitle>
          </DialogHeader>
          {barcodeData && selectedReservation && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <div className="text-2xl font-mono font-bold text-gray-800">
                    {barcodeData.collectionCode}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Collection Code
                  </div>
                </div>
                
                {/* QR Code */}
                <div className="mb-4">
                  <QRCodeComponent 
                    data={barcodeData.qrCodeData} 
                    size={150}
                    className="mb-2"
                  />
                  <p className="text-xs text-gray-500">
                    Scan this QR code for quick collection
                  </p>
                </div>
                
                <div className="space-y-2 text-left">
                  <div>
                    <Label className="text-sm font-medium">Book</Label>
                    <p className="text-sm">{barcodeData.bookTitle}</p>
                    <p className="text-xs text-gray-500">by {barcodeData.bookAuthor}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Due Date</Label>
                    <p className="text-sm">
                      {barcodeData.dueDate ? new Date(barcodeData.dueDate).toLocaleDateString() : "Not set"}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Instructions</Label>
                    <p className="text-xs text-gray-600">
                      Present this code to library staff for book collection. 
                      Keep this code safe until you collect your book.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsBarcodeModalOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    // Here you could add functionality to print or save the barcode
                    window.print()
                  }}
                  className="bg-[#8B4513] hover:bg-[#A0522D]"
                >
                  Print
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ebook Viewer Modal */}
      {selectedEbook && (
        <EbookViewer
          book={selectedEbook}
          onClose={() => setSelectedEbook(null)}
        />
      )}
    </div>
  )
}

function ProfileForm({ profile, isEditing, onSave }: any) {
  const [formData, setFormData] = useState(profile || {})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>First Name</Label>
          <p className="text-sm text-gray-600 dark:text-gray-300">{profile?.firstName || "—"}</p>
        </div>
        <div>
          <Label>Last Name</Label>
          <p className="text-sm text-gray-600 dark:text-gray-300">{profile?.lastName || "—"}</p>
        </div>
        <div>
          <Label>Email</Label>
          <p className="text-sm text-gray-600 dark:text-gray-300">{profile?.email || "—"}</p>
        </div>
        <div>
          <Label>Phone</Label>
          <p className="text-sm text-gray-600 dark:text-gray-300">{profile?.phone || "—"}</p>
        </div>
        <div>
          <Label>Date of Birth</Label>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "—"}
          </p>
        </div>
        <div>
          <Label>Gender</Label>
          <p className="text-sm text-gray-600 dark:text-gray-300">{profile?.gender || "—"}</p>
        </div>
        <div className="md:col-span-2">
          <Label>Bio</Label>
          <p className="text-sm text-gray-600 dark:text-gray-300">{profile?.bio || "—"}</p>
        </div>
                 <div>
           <Label>Preferred Genres</Label>
           <div className="flex flex-wrap gap-2 mt-2">
             {profile?.preferredGenres ? (
               typeof profile.preferredGenres === 'string' ? 
                 profile.preferredGenres.split(', ').map((genre: string) => (
                   <Badge key={genre} variant="secondary">{genre}</Badge>
                 )) :
                 Array.isArray(profile.preferredGenres) ? 
                   profile.preferredGenres.map((genre: string) => (
                     <Badge key={genre} variant="secondary">{genre}</Badge>
                   )) : 
                   <Badge variant="secondary">No genres selected</Badge>
             ) : (
               <Badge variant="secondary">No genres selected</Badge>
             )}
           </div>
         </div>
        <div>
          <Label>Reading Frequency</Label>
          <p className="text-sm text-gray-600 dark:text-gray-300">{profile?.readingFrequency || "—"}</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName || ""}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName || ""}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth || ""}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={formData.gender || ""} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
              <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="readingFrequency">Reading Frequency</Label>
          <Select value={formData.readingFrequency || ""} onValueChange={(value) => setFormData({ ...formData, readingFrequency: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="OCCASIONALLY">Occasionally</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio || ""}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about yourself..."
        />
      </div>

      <div>
        <Label>Profile Picture</Label>
        <FileUpload 
          onFileSelect={async (file) => {
            try {
              const formData = new FormData()
              formData.append('file', file)
              formData.append('type', 'profile')
              
              const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              })
              
              if (response.ok) {
                const { url } = await response.json()
                setFormData({ ...formData, profilePicture: url })
              }
            } catch (error) {
              console.error('Error uploading file:', error)
            }
          }}
          onFileRemove={() => setFormData({ ...formData, profilePicture: "" })}
          previewUrl={formData.profilePicture || null}
          type="profile"
        />
      </div>

      <DialogFooter>
        <Button type="submit" className="bg-[#8B4513] hover:bg-[#A0522D]">
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  )
}

function BookReservationsTable({ reservations, onRenew, onEbookAccess, onGenerateBarcode }: any) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-3">Book</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Reserved</th>
              <th className="text-left p-3">Due Date</th>
              <th className="text-left p-3">Renewals</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation: BookReservation) => (
              <tr key={reservation.id} className="border-t">
                <td className="p-3">
                  <div>
                    <p className="font-medium">{reservation.bookTitle}</p>
                    <p className="text-sm text-gray-500">{reservation.bookAuthor}</p>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      reservation.status === "CHECKED_OUT" ? "default" :
                      reservation.status === "PENDING" ? "secondary" :
                      reservation.status === "OVERDUE" ? "destructive" :
                      reservation.status === "APPROVED" ? "default" :
                      "outline"
                    }>
                      {reservation.status}
                    </Badge>
                    {reservation.status === "APPROVED" && (reservation.isDigital || reservation.isElectronic) && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Download className="h-3 w-3 mr-1" />
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-3 text-sm text-gray-500">
                  {new Date(reservation.reservedAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-sm text-gray-500">
                  {reservation.dueDate ? new Date(reservation.dueDate).toLocaleDateString() : "—"}
                </td>
                <td className="p-3">{reservation.renewalCount}</td>
                <td className="p-3 text-right space-x-2">
                  {reservation.status === "APPROVED" && (
                    <>
                      {(reservation.isDigital || reservation.isElectronic) ? (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onEbookAccess(reservation)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Access Ebook
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onGenerateBarcode(reservation)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          Get Barcode
                        </Button>
                      )}
                    </>
                  )}
                  {reservation.status === "CHECKED_OUT" && (
                    <Button size="sm" variant="outline" onClick={() => onRenew(reservation.id)}>
                      Renew
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
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

function ChatInterface({ messages, newMessage, onMessageChange, onSendMessage }: any) {
  const { data: session } = useSession()
  
  return (
    <div className="space-y-4">
      <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message: ChatMessage) => {
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
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
        />
        <Button 
          onClick={onSendMessage} 
          disabled={!newMessage.trim()}
          className="bg-[#8B4513] hover:bg-[#A0522D]"
        >
          Send
        </Button>
      </div>
    </div>
  )
}

function SupportRequestsTable({ requests }: any) {
  return (
    <div className="space-y-4">
      {requests.map((request: SupportRequest) => (
        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="font-medium">{request.title}</p>
            <p className="text-sm text-gray-500">{request.category}</p>
            <p className="text-xs text-gray-400">
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={
              request.status === "OPEN" ? "default" :
              request.status === "IN_PROGRESS" ? "secondary" :
              "outline"
            }>
              {request.status}
            </Badge>
            <Badge variant={
              request.priority === "URGENT" ? "destructive" :
              request.priority === "HIGH" ? "default" :
              "secondary"
            }>
              {request.priority}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReadingHistoryTable({ reservations }: any) {
  const returnedBooks = reservations.filter((r: BookReservation) => r.status === "RETURNED")
  
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-3">Book</th>
              <th className="text-left p-3">Returned</th>
              <th className="text-left p-3">Duration</th>
              <th className="text-left p-3">Renewals</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {returnedBooks.map((reservation: BookReservation) => (
              <tr key={reservation.id} className="border-t">
                <td className="p-3">
                  <div>
                    <p className="font-medium">{reservation.bookTitle}</p>
                    <p className="text-sm text-gray-500">{reservation.bookAuthor}</p>
                  </div>
                </td>
                <td className="p-3 text-sm text-gray-500">
                  {reservation.returnedAt ? new Date(reservation.returnedAt).toLocaleDateString() : "—"}
                </td>
                <td className="p-3 text-sm text-gray-500">
                  {reservation.reservedAt && reservation.returnedAt ? 
                    Math.ceil((new Date(reservation.returnedAt).getTime() - new Date(reservation.reservedAt).getTime()) / (1000 * 60 * 60 * 24)) + " days" : 
                    "—"
                  }
                </td>
                <td className="p-3">{reservation.renewalCount}</td>
                <td className="p-3 text-right space-x-2">
                  <Button size="sm" variant="outline">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Bookmark className="h-4 w-4" />
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

function CreateSupportRequestButton({ onSuccess }: any) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")

  const handleSubmit = async () => {
    if (!title || !description || !category) return

    try {
      const response = await fetch("/api/member/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category })
      })

      if (response.ok) {
        setOpen(false)
        setTitle("")
        setDescription("")
        setCategory("")
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating support request:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-[#8B4513] hover:bg-[#A0522D]">
          <Plus className="h-4 w-4 mr-2"/>New Request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Support Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of your issue"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TECHNICAL">Technical</SelectItem>
                <SelectItem value="ACCOUNT">Account</SelectItem>
                <SelectItem value="BOOKS">Books</SelectItem>
                <SelectItem value="EVENTS">Events</SelectItem>
                <SelectItem value="GENERAL">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide detailed information about your request..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} className="bg-[#8B4513] hover:bg-[#A0522D]">
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
