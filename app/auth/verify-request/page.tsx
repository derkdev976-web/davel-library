"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <Card className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#8B4513] via-[#D2691E] to-[#CD853F] bg-clip-text text-transparent">
            Check Your Email
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300">
            We&apos;ve sent you a sign-in link to your email address
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <Mail className="h-12 w-12 text-[#8B4513] mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Sign-in Link Sent</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Click the link in your email to sign in to your Davel Library account. 
              The link will expire in 24 hours for security.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Didn&apos;t receive the email?
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes for the email to arrive</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              asChild 
              className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white rounded-xl transition-all duration-300"
            >
              <Link href="/auth/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              className="w-full border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white rounded-xl transition-all duration-300"
            >
              <Link href="/">
                Return to Home
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Need help? Contact us at{" "}
              <a 
                href="mailto:support@davellibrary.com" 
                className="text-[#8B4513] hover:underline"
              >
                support@davellibrary.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
