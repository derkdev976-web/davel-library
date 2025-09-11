"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Mail, Send, CheckCircle, XCircle, AlertCircle, 
  Settings, TestTube, Clock, User
} from "lucide-react"

interface EmailConfig {
  configured: boolean
  missingConfig: string[]
  config: {
    host?: string
    port?: string
    user?: string
    pass?: string
    from?: string
  }
  availableTestTypes: Array<{
    value: string
    label: string
  }>
}

export function EmailTestManager() {
  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const [testType, setTestType] = useState("basic")
  const { toast } = useToast()

  const fetchEmailConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/email/test')
      if (response.ok) {
        const config = await response.json()
        setEmailConfig(config)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch email configuration",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching email config:', error)
      toast({
        title: "Error",
        description: "Failed to fetch email configuration",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive"
      })
      return
    }

    try {
      setTesting(true)
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType,
          recipientEmail: testEmail
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send test email",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive"
      })
    } finally {
      setTesting(false)
    }
  }

  // Fetch config on component mount
  useState(() => {
    fetchEmailConfig()
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Email System Manager</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading email configuration...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Email Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Email Configuration Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emailConfig ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {emailConfig.configured ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <Badge className="bg-green-100 text-green-800">Configured</Badge>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <Badge className="bg-red-100 text-red-800">Not Configured</Badge>
                  </>
                )}
              </div>

              {!emailConfig.configured && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-800">Missing Configuration</h4>
                  </div>
                  <p className="text-sm text-yellow-700 mb-2">
                    The following environment variables need to be configured:
                  </p>
                  <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                    {emailConfig.missingConfig.map((config) => (
                      <li key={config}><code className="bg-yellow-100 px-1 rounded">{config}</code></li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host</Label>
                  <p className="text-sm text-gray-600">{emailConfig.config.host || "Not set"}</p>
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <p className="text-sm text-gray-600">{emailConfig.config.port || "Not set"}</p>
                </div>
                <div>
                  <Label>SMTP User</Label>
                  <p className="text-sm text-gray-600">{emailConfig.config.user || "Not set"}</p>
                </div>
                <div>
                  <Label>SMTP Password</Label>
                  <p className="text-sm text-gray-600">{emailConfig.config.pass || "Not set"}</p>
                </div>
                <div className="md:col-span-2">
                  <Label>From Email</Label>
                  <p className="text-sm text-gray-600">{emailConfig.config.from || "Not set"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Failed to load email configuration</p>
              <Button onClick={fetchEmailConfig} className="mt-2">
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Email Testing</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                placeholder="Enter email address to send test to"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="testType">Test Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  {emailConfig?.availableTestTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={sendTestEmail}
                disabled={testing || !emailConfig?.configured || !testEmail}
                className="flex items-center space-x-2"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Test Email</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={fetchEmailConfig}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Refresh Config</span>
              </Button>
            </div>

            {!emailConfig?.configured && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <h4 className="font-medium text-red-800">Cannot Send Test Emails</h4>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Please configure the email system first by setting the required environment variables.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Email System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Email System Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Supported Email Types</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Membership Application Confirmations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Application Approval Emails</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Application Rejection Emails</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Under Review Notifications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Document Request Emails</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">NextAuth Email Verification</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Configuration Requirements</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  Set these environment variables in your deployment:
                </p>
                <div className="space-y-1 text-sm font-mono">
                  <div>EMAIL_SERVER_HOST=smtp.gmail.com</div>
                  <div>EMAIL_SERVER_PORT=587</div>
                  <div>EMAIL_SERVER_USER=your-email@gmail.com</div>
                  <div>EMAIL_SERVER_PASSWORD=your-app-password</div>
                  <div>EMAIL_FROM=noreply@davellibrary.com</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
