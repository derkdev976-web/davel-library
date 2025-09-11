"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, BookOpen, User, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("admin")
  const router = useRouter()
  const { toast } = useToast()

  const [adminCredentials, setAdminCredentials] = useState({
    email: "",
    password: ""
  })

  const [librarianCredentials, setLibrarianCredentials] = useState({
    email: "",
    password: ""
  })

  const [memberCredentials, setMemberCredentials] = useState({
    email: "",
    password: ""
  })

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: adminCredentials.email,
        password: adminCredentials.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Login Failed",
          description: "Invalid admin credentials. Please check your email and password.",
          variant: "destructive"
        })
      } else if (result?.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome back, Admin!",
        })
        router.push("/dashboard/admin")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLibrarianLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: librarianCredentials.email,
        password: librarianCredentials.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Login Failed",
          description: "Invalid librarian credentials. Please check your email and password.",
          variant: "destructive"
        })
      } else if (result?.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome back, Librarian!",
        })
        router.push("/dashboard/admin")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: memberCredentials.email,
        password: memberCredentials.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Login Failed",
          description: "Invalid member credentials. Please check your email and password.",
          variant: "destructive"
        })
      } else if (result?.ok) {
        toast({
          title: "Login Successful",
          description: "Welcome back, Member!",
        })
        router.push("/dashboard/member")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-orange-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-2">Welcome Back</h1>
          <p className="text-gray-300 text-lg">Sign in to your Davel Library account</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700">
            <TabsTrigger 
              value="admin" 
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </TabsTrigger>
            <TabsTrigger 
              value="librarian" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Librarian
            </TabsTrigger>
            <TabsTrigger 
              value="member" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <User className="h-4 w-4 mr-2" />
              Member
            </TabsTrigger>
          </TabsList>

          {/* Admin Login Tab */}
          <TabsContent value="admin" className="mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="h-8 w-8 text-orange-400 mr-2" />
                  <CardTitle className="text-2xl text-white">Admin Sign In</CardTitle>
                </div>
                <p className="text-gray-400">Access admin dashboard and system management</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="admin-email" className="text-gray-300">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter admin email"
                      value={adminCredentials.email}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-password" className="text-gray-300">Admin Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="Enter admin password"
                      value={adminCredentials.password}
                      onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {isLoading ? "Signing In..." : "Admin Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Librarian Login Tab */}
          <TabsContent value="librarian" className="mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-8 w-8 text-purple-400 mr-2" />
                  <CardTitle className="text-2xl text-white">Librarian Sign In</CardTitle>
                </div>
                <p className="text-gray-400">Access librarian dashboard and book management</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLibrarianLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="librarian-email" className="text-gray-300">Librarian Email</Label>
                    <Input
                      id="librarian-email"
                      type="email"
                      placeholder="Enter librarian email"
                      value={librarianCredentials.email}
                      onChange={(e) => setLibrarianCredentials({ ...librarianCredentials, email: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="librarian-password" className="text-gray-300">Librarian Password</Label>
                    <Input
                      id="librarian-password"
                      type="password"
                      placeholder="Enter librarian password"
                      value={librarianCredentials.password}
                      onChange={(e) => setLibrarianCredentials({ ...librarianCredentials, password: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isLoading ? "Signing In..." : "Librarian Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Member Login Tab */}
          <TabsContent value="member" className="mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <User className="h-8 w-8 text-blue-400 mr-2" />
                  <CardTitle className="text-2xl text-white">Member Sign In</CardTitle>
                </div>
                <p className="text-gray-400">Access member dashboard and book reservations</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMemberLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="member-email" className="text-gray-300">Member Email</Label>
                    <Input
                      id="member-email"
                      type="email"
                      placeholder="Enter member email"
                      value={memberCredentials.email}
                      onChange={(e) => setMemberCredentials({ ...memberCredentials, email: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="member-password" className="text-gray-300">Member Password</Label>
                    <Input
                      id="member-password"
                      type="password"
                      placeholder="Enter member password"
                      value={memberCredentials.password}
                      onChange={(e) => setMemberCredentials({ ...memberCredentials, password: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? "Signing In..." : "Member Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don&apos;t have an account?{" "}
            <a href="/apply" className="text-orange-400 hover:text-orange-300 underline">
              Apply for membership
            </a>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
          <div className="flex items-center space-x-2 text-gray-300">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-sm">
              <strong>Security Notice:</strong> Each user type has separate authentication. 
              Admin credentials cannot be used for librarian access and vice versa.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
