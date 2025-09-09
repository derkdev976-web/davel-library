"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAuthPage() {
  const { data: session, status } = useSession()

  const handleTestLogin = async () => {
    const result = await signIn("credentials", {
      email: "davel@admin.library.com",
      password: "myDavellibraAdminiCITIE123@",
      redirect: false,
    })
    console.log("Test login result:", result)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>NextAuth Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Session:</strong> {JSON.stringify(session, null, 2)}</p>
          </div>
          
          <div className="space-y-2">
            <Button onClick={handleTestLogin} className="w-full">
              Test Admin Login
            </Button>
            
            {session && (
              <Button onClick={() => signOut()} className="w-full">
                Sign Out
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
