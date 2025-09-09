"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload"
import { ProfilePicture } from "@/components/ui/profile-picture"
import { PasswordChangeForm } from "@/components/ui/password-change-form"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Clock,
  Edit3,
  Save,
  X,
  Shield,
  Award,
  Camera
} from "lucide-react"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  dateOfBirth?: string
  avatar?: string
  membershipType: string
  membershipStatus: string
  joinDate: string
  totalBooksBorrowed: number
  currentBorrowed: number
  favoriteGenres: string[]
  readingGoals: {
    booksThisYear: number
    target: number
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoadingTimeout(true)
    }, 10000) // 10 seconds timeout

    // Fetch real profile data from API with caching
    const fetchProfile = async () => {
      try {
        console.log('Fetching profile for user:', session.user?.id)
        const res = await fetch("/api/user/profile", {
          // Add cache headers to reduce server load
          headers: {
            'Cache-Control': 'max-age=300' // 5 minutes
          }
        })
        console.log('Profile API response status:', res.status)
        if (res.ok) {
          const data = await res.json()
          console.log('Profile data received:', data)
          setProfile(data)
          setEditedProfile(data)
          clearTimeout(timeoutId)
        } else {
          console.error('Profile API error:', res.status, res.statusText)
          setProfile(null)
          setEditedProfile(null)
          clearTimeout(timeoutId)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
        setEditedProfile(null)
        clearTimeout(timeoutId)
      }
    }

    // Only fetch if we don't have profile data yet
    if (!profile) {
      fetchProfile()
    }

    return () => clearTimeout(timeoutId)
  }, [session, status, router, profile])

  // Show loading state while profile is being fetched
  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <main className="pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B4513] mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
                {loadingTimeout && (
                  <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      Loading is taking longer than expected. Please try refreshing the page.
                    </p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="mt-2 px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#A0522D] transition-colors"
                    >
                      Refresh Page
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleSave = async () => {
    try {
      const updatedProfile: UserProfile = {
        ...editedProfile!
      }
      
      setProfile(updatedProfile)
      setEditedProfile(updatedProfile)
      setIsEditing(false)
      
      // Here you would typically save to the database
      console.log('Profile updated:', updatedProfile)
    } catch (error) {
      console.error('Failed to save profile:', error)
      // Handle error (show toast notification, etc.)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (!editedProfile) return
    setEditedProfile({
      ...editedProfile,
      [field]: value
    })
  }

  if (status === "loading" as any) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-white to-[#F5F5DC] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <main className="pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="h-96 bg-gray-200 rounded"></div>
                <div className="lg:col-span-2 space-y-4">
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-white to-[#F5F5DC] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="pt-24 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">My Profile</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your account information and preferences
              </p>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="bg-[#8B4513] hover:bg-[#A0522D]">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                                 <div className="flex justify-center mb-4">
                  <ProfilePicture
                    src={profile.avatar}
                    alt={profile.name || "User"}
                    size="xl"
                    fallback={(profile.name || "U").charAt(0)}
                  />
                </div>
                <CardTitle className="text-xl">{profile.name || "User"}</CardTitle>
                <div className="flex justify-center space-x-2 mt-2">
                  <Badge variant="secondary" className="bg-[#8B4513] text-white">
                    {profile.membershipType || "Member"}
                  </Badge>
                  <Badge variant={(profile.membershipStatus || "Inactive") === "Active" ? "default" : "destructive"}>
                    {profile.membershipStatus || "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Member since</p>
                  <p className="font-semibold">{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : "N/A"}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#8B4513]">{profile.totalBooksBorrowed || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Borrowed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#8B4513]">{profile.currentBorrowed || 0}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Currently Out</p>
                  </div>
                </div>
                
                {isEditing && (
                  <div className="mt-4">
                    <Label className="flex items-center mb-2">
                      <Camera className="h-4 w-4 mr-2" />
                      Profile Picture
                    </Label>
                    <ProfilePictureUpload
                      currentPicture={profile.avatar}
                      onPictureChange={(picturePath) => {
                        setProfile({ ...profile, avatar: picturePath })
                        if (editedProfile) {
                          setEditedProfile({ ...editedProfile, avatar: picturePath })
                        }
                      }}
                      size="lg"
                      showPreview={false}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editedProfile?.name || ""}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{profile.name || "Not provided"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editedProfile?.email || ""}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{profile.email || "Not provided"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editedProfile?.phone || ""}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{profile.phone || "Not provided"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={editedProfile?.dateOfBirth || ""}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        />
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Textarea
                        id="address"
                        value={editedProfile?.address || ""}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        rows={2}
                      />
                    ) : (
                                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{profile.address || "Not provided"}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reading Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Reading Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                                     <div>
                     <Label>Favorite Genres</Label>
                     <div className="flex flex-wrap gap-2 mt-2">
                       {Array.isArray(profile.favoriteGenres) && profile.favoriteGenres.length > 0 ? (
                         profile.favoriteGenres.map((genre, index) => (
                           <Badge key={index} variant="outline">
                             {genre}
                           </Badge>
                         ))
                       ) : (
                         <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                           {profile.favoriteGenres ? 
                             (typeof profile.favoriteGenres === 'string' ? 
                               `Genres: ${profile.favoriteGenres}` : 
                               'No favorite genres set'
                             ) : 
                             'No favorite genres set'
                           }
                         </p>
                       )}
                     </div>
                   </div>
                                     <div>
                     <Label>Reading Goal Progress</Label>
                     <div className="mt-2">
                       {profile.readingGoals && typeof profile.readingGoals === 'object' && profile.readingGoals.target > 0 ? (
                         <>
                           <div className="flex justify-between text-sm mb-1">
                             <span>{profile.readingGoals.booksThisYear || 0} of {profile.readingGoals.target} books</span>
                             <span>{Math.round(((profile.readingGoals.booksThisYear || 0) / profile.readingGoals.target) * 100)}%</span>
                           </div>
                           <div className="w-full bg-gray-200 rounded-full h-2">
                             <div 
                               className="bg-[#8B4513] h-2 rounded-full transition-all duration-300"
                               style={{ width: `${((profile.readingGoals.booksThisYear || 0) / profile.readingGoals.target) * 100}%` }}
                             ></div>
                           </div>
                         </>
                       ) : (
                         <p className="text-sm text-gray-500 dark:text-gray-400 italic">No reading goals set</p>
                       )}
                     </div>
                   </div>
                </CardContent>
              </Card>

              {/* Membership Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Membership Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Membership Type</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{profile.membershipType || "Member"}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{profile.membershipStatus || "Inactive"}</p>
                    </div>
                    <div>
                      <Label>Member Since</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                    <div>
                      <Label>Total Books Borrowed</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{profile.totalBooksBorrowed || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Password Change Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PasswordChangeForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
