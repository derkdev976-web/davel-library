"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SessionTestPage() {
  const { data: session, status } = useSession()

  const handleAdminLogin = async () => {
    const result = await signIn("credentials", {
      email: "davel@admin.library.com",
      password: "myDavellibraAdminiCITIE123@",
      redirect: false,
    })
    console.log("Admin login result:", result)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Session Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Status: {status}</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button onClick={handleAdminLogin} className="w-full">
              Test Admin Login
            </Button>
            
            {session && (
              <Button onClick={() => signOut()} className="w-full">
                Sign Out
              </Button>
            )}
          </div>

          {session && (
            <div className="space-y-2">
              <h3 className="font-semibold">User Info:</h3>
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
                <p><strong>ID:</strong> {session.user?.id}</p>
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Name:</strong> {session.user?.name}</p>
                <p><strong>Role:</strong> {session.user?.role}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
