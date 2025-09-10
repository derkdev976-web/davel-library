"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { 
  Mail, 
  Send, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2
} from "lucide-react"

interface Member {
  id: string
  name: string
  email: string
  createdAt: string
}

interface BroadcastResult {
  recipient: string
  status: string
  error?: string
}

export function BroadcastEmail() {
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [recipientType, setRecipientType] = useState<"all" | "selected">("all")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<any>(null)
  const { toast } = useToast()

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/broadcast-email')
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      } else {
        toast({ title: "Error fetching members", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      toast({ title: "Error fetching members", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleMemberSelect = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers(prev => [...prev, memberId])
    } else {
      setSelectedMembers(prev => prev.filter(id => id !== memberId))
    }
  }

  const selectAllMembers = () => {
    setSelectedMembers(members.map(member => member.id))
  }

  const clearSelection = () => {
    setSelectedMembers([])
  }

  const handleSendEmail = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ title: "Please fill in subject and message", variant: "destructive" })
      return
    }

    if (recipientType === "selected" && selectedMembers.length === 0) {
      toast({ title: "Please select at least one member", variant: "destructive" })
      return
    }

    try {
      setIsSending(true)
      setSendResult(null)

      const response = await fetch('/api/broadcast-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          message,
          recipientType,
          recipientIds: recipientType === "selected" ? selectedMembers : undefined
        })
      })

      const result = await response.json()

      if (response.ok) {
        setSendResult(result)
        toast({ 
          title: "Email broadcast completed!", 
          description: `${result.summary.successful} emails sent successfully` 
        })
        // Clear form
        setSubject("")
        setMessage("")
        setSelectedMembers([])
        setRecipientType("all")
      } else {
        toast({ title: result.error || "Failed to send emails", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error sending broadcast email:', error)
      toast({ title: "Error sending emails", variant: "destructive" })
    } finally {
      setIsSending(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Broadcast Email to Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recipient Selection */}
          <div className="space-y-4">
            <div>
              <Label>Recipients</Label>
              <Select value={recipientType} onValueChange={(value: "all" | "selected") => setRecipientType(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Active Members ({members.length})</SelectItem>
                  <SelectItem value="selected">Selected Members Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recipientType === "selected" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Select Members</Label>
                  <div className="space-x-2">
                    <Button onClick={selectAllMembers} variant="outline" size="sm">
                      Select All
                    </Button>
                    <Button onClick={clearSelection} variant="outline" size="sm">
                      Clear All
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading members...</span>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={member.id}
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={(checked) => handleMemberSelect(member.id, checked as boolean)}
                          />
                          <Label htmlFor={member.id} className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{member.name}</span>
                              <span className="text-sm text-gray-500">{member.email}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  {selectedMembers.length} member(s) selected
                </div>
              </div>
            )}
          </div>

          {/* Email Content */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message to members..."
                className="resize-none"
              />
            </div>
          </div>

          {/* Send Button */}
          <Button 
            onClick={handleSendEmail} 
            disabled={isSending || !subject.trim() || !message.trim()}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Emails...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email to {recipientType === "all" ? `All Members (${members.length})` : `${selectedMembers.length} Selected Members`}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Send Results */}
      {sendResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Send Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{sendResult.summary.total}</div>
                  <div className="text-sm text-blue-600">Total Recipients</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{sendResult.summary.successful}</div>
                  <div className="text-sm text-green-600">Successful</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{sendResult.summary.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>

              {/* Detailed Results */}
              {sendResult.results && sendResult.results.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Detailed Results</h4>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <div className="space-y-2 p-4">
                      {sendResult.results.map((result: BroadcastResult, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{result.recipient}</span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(result.status)}
                            <span className="text-sm capitalize">{result.status}</span>
                            {result.error && (
                              <span className="text-xs text-red-500">({result.error})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
