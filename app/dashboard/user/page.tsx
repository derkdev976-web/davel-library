"use client"

import { useSession } from "next-auth/react"
import { UserEbookDashboard } from "@/components/dashboard/user-ebook-dashboard"
import { GuestDashboard } from "@/components/dashboard/guest-dashboard"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function UserDashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen app-background flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen app-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <GuestDashboard />
          </div>
        </main>
      </div>
    )
  }

  // Show appropriate dashboard based on user role
  const userRole = session.user?.role || "GUEST"

  return (
    <div className="min-h-screen app-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {userRole === "MEMBER" ? (
            <UserEbookDashboard />
          ) : userRole === "GUEST" ? (
            <GuestDashboard />
          ) : (
            <GuestDashboard />
          )}
        </div>
      </main>
    </div>
  )
}
