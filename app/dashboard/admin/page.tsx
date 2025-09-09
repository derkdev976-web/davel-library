"use client"

import { useSession } from "next-auth/react"
import { EnhancedAdminDashboard } from "@/components/dashboard/enhanced-admin-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading admin dashboard...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to access the admin dashboard.</p>
            <a 
              href="/auth/signin" 
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white px-4 py-2 rounded-lg transition-colors"
            >
              Go to Sign In
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if not admin
  if (session.user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to access this dashboard.</p>
            <p className="text-sm text-gray-500">Current role: {session.user?.role}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <EnhancedAdminDashboard />
}
