"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Mail, Send, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function EmailTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [configStatus, setConfigStatus] = useState<any>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    to: "",
    subject: "Davel Library - Email Configuration Test",
    message: "This is a test email to verify that your email configuration is working correctly. If you receive this email, your email system is properly configured!"                                                                        
  })

  useEffect(() => {
    const checkConfigStatus = async () => {
      try {
        const response = await fetch('/api/email-status')
        if (response.ok) {
          const data = await response.json()
          setConfigStatus(data)
        }
      } catch (error) {
        console.error('Error checking email config status:', error)
      }
    }

    checkConfigStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setTestResult({ success: true, data })
        toast({
          title: "Email Test Successful",
          description: "Test email sent successfully!",
        })
      } else {
        setTestResult({ success: false, data })
        toast({
          title: "Email Test Failed",
          description: data.message || "Failed to send test email",
          variant: "destructive"
        })
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        data: { error: "Network error", message: "Failed to connect to email service" }
      })
      toast({
        title: "Email Test Error",
        description: "Failed to connect to email service",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {configStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Email Configuration Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {configStatus.configured ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Email Configuration Complete</span>
                </div>
                <p className="text-green-700 mt-2">All required environment variables are set.</p>
                <div className="mt-3 space-y-1 text-sm">
                  <p><strong>SMTP Host:</strong> {configStatus.config.host}</p>
                  <p><strong>SMTP Port:</strong> {configStatus.config.port}</p>
                  <p><strong>From Address:</strong> {configStatus.config.from}</p>
                  <p><strong>User:</strong> {configStatus.config.user}</p>
                  <p><strong>Password:</strong> {configStatus.config.hasPassword ? 'Set' : 'Not set'}</p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">Email Configuration Incomplete</span>
                </div>
                <p className="text-red-700 mt-2">Missing environment variables:</p>
                <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
                  {configStatus.missing.map((config: string) => (
                    <li key={config}>{config}</li>
                  ))}
                </ul>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">Quick Setup Guide:</h4>
                  <div className="text-sm text-blue-700 space-y-2">
                    <p><strong>For Gmail:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Enable 2-Factor Authentication</li>
                      <li>Generate an App Password</li>
                      <li>Use: smtp.gmail.com:587</li>
                    </ul>
                    <p><strong>For Outlook:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Use: smtp-mail.outlook.com:587</li>
                      <li>Use your regular email and password</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Email Configuration Test</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="to">Test Email Address</Label>
              <Input
                id="to"
                type="email"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="Enter email address to test"
                required
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Test Email...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Test Result</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResult.success ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Email Sent Successfully!</span>
                  </div>
                  <p className="text-green-700 mt-2">{testResult.data.message}</p>
                </div>

                {testResult.data.config && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Configuration Details:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>SMTP Host:</strong> {testResult.data.config.host}</p>
                      <p><strong>SMTP Port:</strong> {testResult.data.config.port}</p>
                      <p><strong>From Address:</strong> {testResult.data.config.from}</p>
                      <p><strong>User:</strong> {testResult.data.config.user}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-red-800">
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">Email Test Failed</span>
                  </div>
                  <p className="text-red-700 mt-2">{testResult.data.message}</p>
                </div>

                {testResult.data.missing && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-yellow-800 mb-2">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-semibold">Missing Configuration</span>
                    </div>
                    <p className="text-yellow-700 mb-2">Add these environment variables to your Render deployment:</p>
                    <ul className="list-disc list-inside text-yellow-700 space-y-1">
                      {testResult.data.missing.map((config: string) => (
                        <li key={config}>{config}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {testResult.data.config && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Required Configuration:</h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <p><strong>EMAIL_SERVER_HOST:</strong> {testResult.data.config.EMAIL_SERVER_HOST}</p>
                      <p><strong>EMAIL_SERVER_PORT:</strong> {testResult.data.config.EMAIL_SERVER_PORT}</p>
                      <p><strong>EMAIL_SERVER_USER:</strong> {testResult.data.config.EMAIL_SERVER_USER}</p>
                      <p><strong>EMAIL_SERVER_PASSWORD:</strong> {testResult.data.config.EMAIL_SERVER_PASSWORD}</p>
                      <p><strong>EMAIL_FROM:</strong> {testResult.data.config.EMAIL_FROM}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
