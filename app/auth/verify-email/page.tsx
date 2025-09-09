"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Shield, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid verification link. Please check your email for the correct link.")
    }
  }, [token, email])

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsVerified(true)
        toast({
          title: "Success!",
          description: "Email verified and password set successfully. You can now log in.",
        })
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin")
        }, 3000)
      } else {
        setError(data.error || "Failed to verify email")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-orange-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-400" />
            </div>
            <CardTitle className="text-2xl text-white">Email Verified!</CardTitle>
            <p className="text-gray-400">Your account is now active and ready to use.</p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">
              You will be redirected to the login page in a few seconds...
            </p>
            <Button 
              onClick={() => router.push("/auth/signin")}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !token && !email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-orange-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-red-400" />
            </div>
            <CardTitle className="text-2xl text-white">Invalid Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">{error}</p>
            <Button 
              onClick={() => router.push("/auth/signin")}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-orange-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-16 w-16 text-orange-400" />
          </div>
          <CardTitle className="text-2xl text-white">Complete Your Account</CardTitle>
          <p className="text-gray-400">
            Welcome to Davel Library! Please set up your password to complete your account.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSetup} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email || ""}
                disabled
                className="bg-gray-700 border-gray-600 text-gray-400"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isLoading ? "Setting up account..." : "Complete Account Setup"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <a 
                href="/auth/signin" 
                className="text-orange-400 hover:text-orange-300 underline"
              >
                Sign in here
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
