"use client"

import { useSession } from "next-auth/react"
import { ModernMemberDashboard } from "@/components/dashboard/modern-member-dashboard"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { redirect } from "next/navigation"

export default function MemberDashboardPage() {
  const { data: session, status } = useSession()

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen app-background flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading member dashboard...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect to sign-in if not authenticated
  if (!session) {
    redirect("/auth/signin")
  }

  // Redirect to user dashboard if not a member
  if (session.user?.role !== "MEMBER") {
    redirect("/dashboard/user")
  }

  return (
    <div className="min-h-screen app-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ModernMemberDashboard />
        </div>
      </main>
    </div>
  )
}


