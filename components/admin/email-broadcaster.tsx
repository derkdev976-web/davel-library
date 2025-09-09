"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Mail, Users, Send, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailBroadcasterProps {
  userRole: "ADMIN" | "LIBRARIAN"
}

interface User {
  id: string
  email: string
  name: string
  role: string
}

export default function EmailBroadcaster({ userRole }: EmailBroadcasterProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [recipientType, setRecipientType] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const { toast } = useToast()

  const recipientTypes = [
    { value: "all", label: "All Users", description: "Send to all registered users" },
    { value: "members", label: "Members Only", description: "Send to approved members only" },
    { value: "applicants", label: "Applicants", description: "Send to pending applications" },
    { value: "custom", label: "Custom Selection", description: "Select specific users" }
  ]

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleExpand = () => {
    if (!isExpanded) {
      fetchUsers()
    }
    setIsExpanded(!isExpanded)
  }

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const getRecipientCount = () => {
    switch (recipientType) {
      case "all":
        return users.length
      case "members":
        return users.filter(user => user.role === "MEMBER").length
      case "applicants":
        return users.filter(user => user.role === "GUEST").length
      case "custom":
        return selectedUsers.length
      default:
        return 0
    }
  }

  const sendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message.",
        variant: "destructive",
      })
      return
    }

    if (recipientType === "custom" && selectedUsers.length === 0) {
      toast({
        title: "No Recipients",
        description: "Please select at least one recipient.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/broadcast-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          message,
          recipientType,
          selectedUsers: recipientType === "custom" ? selectedUsers : undefined,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Email Sent Successfully",
          description: `Email sent to ${result.sentCount} recipients.`,
        })
        setSubject("")
        setMessage("")
        setSelectedUsers([])
      } else {
        const error = await response.json()
        toast({
          title: "Failed to Send Email",
          description: error.error || "An error occurred while sending the email.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Broadcast
        </CardTitle>
        <p className="text-sm text-gray-600">
          Send important messages and updates to library users
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipient-type">Recipient Type</Label>
            <Select value={recipientType} onValueChange={setRecipientType}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient type" />
              </SelectTrigger>
              <SelectContent>
                {recipientTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {getRecipientCount()} recipients
            </span>
          </div>
        </div>

        {recipientType === "custom" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Recipients</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpand}
              >
                {isExpanded ? "Hide Users" : "Show Users"}
              </Button>
            </div>
            
            {isExpanded && (
              <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={user.id}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <Label htmlFor={user.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>{user.name || user.email}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject..."
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            rows={6}
            className="mt-1"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            This email will be sent to {getRecipientCount()} recipient{getRecipientCount() !== 1 ? 's' : ''}.
          </span>
        </div>

        <Button
          onClick={sendEmail}
          disabled={isLoading || !subject.trim() || !message.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
