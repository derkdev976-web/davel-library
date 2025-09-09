"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugSessionPage() {
  const { data: session, status } = useSession()

  const handleAdminLogin = async () => {
    console.log("Attempting admin login...")
    const result = await signIn("credentials", {
      email: "davel@admin.library.com",
      password: "admin123",
      redirect: false,
    })
    console.log("Admin login result:", result)
  }

  const handleSignOut = async () => {
    console.log("Signing out...")
    await signOut({ redirect: false })
    console.log("Sign out complete")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Session Debug Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Status: <span className="text-blue-600">{status}</span></h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">User Info:</h3>
              {session ? (
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                  <p><strong>ID:</strong> {session.user?.id || "N/A"}</p>
                  <p><strong>Email:</strong> {session.user?.email || "N/A"}</p>
                  <p><strong>Name:</strong> {session.user?.name || "N/A"}</p>
                  <p><strong>Role:</strong> {session.user?.role || "N/A"}</p>
                </div>
              ) : (
                <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
                  <p>No session data</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Button onClick={handleAdminLogin} className="w-full">
              Test Admin Login
            </Button>
            
            {session && (
              <Button onClick={handleSignOut} className="w-full">
                Sign Out
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Test Links:</h3>
            <div className="flex flex-wrap gap-2">
              <a href="/dashboard/admin" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Go to Admin Dashboard
              </a>
              <a href="/auth/signin" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
                Go to Sign In
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
