"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card } from "@/components/ui/card"
import { ChatInterface } from "@/components/chat/chat-interface"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Shield, UserCheck } from "lucide-react"

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderRole: string
  recipientId: string
  recipientName: string
  recipientRole: string
  timestamp: Date
  isRead: boolean
}

interface ChatUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  isOnline: boolean
  lastSeen?: Date
  unreadCount: number
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<ChatUser[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/users')
      if (response.ok) {
        const data = await response.json()
        const formattedUsers: ChatUser[] = data.map((user: any) => ({
          id: user.id,
          name: user.displayName || user.name,
          email: user.email,
          role: user.role,
          avatar: undefined,
          isOnline: true, // For now, assume all users are online
          lastSeen: new Date(),
          unreadCount: 0
        }))
        setUsers(formattedUsers)
        
        // Auto-select first user if none selected
        if (!selectedUserId && formattedUsers.length > 0) {
          setSelectedUserId(formattedUsers[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [selectedUserId, toast])

  const fetchMessages = useCallback(async () => {
    try {
      if (selectedUserId && session?.user?.id) {
        const response = await fetch(`/api/chat/messages?userId=${session.user.id}&recipientId=${selectedUserId}`)
        if (response.ok) {
          const data = await response.json()
          const formattedMessages: Message[] = data.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderId: msg.senderId,
            senderName: msg.senderName,
            senderRole: msg.senderRole,
            recipientId: msg.recipientId,
            recipientName: msg.recipientName,
            recipientRole: msg.recipientRole,
            timestamp: new Date(msg.timestamp),
            isRead: msg.isRead
          }))
          setMessages(formattedMessages)
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }, [selectedUserId, session?.user?.id])

  useEffect(() => {
    if (session?.user) {
      fetchUsers()
      fetchMessages()
    }
  }, [session, fetchUsers, fetchMessages])

  useEffect(() => {
    fetchMessages()
  }, [selectedUserId, fetchMessages])

  const handleSendMessage = async (content: string, recipientId: string) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          senderId: session.user.id,
          senderName: session.user.name || 'Unknown',
          senderRole: session.user.role || 'USER',
          recipientId
        }),
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages(prev => [...prev, {
          id: newMessage.id,
          content: newMessage.content,
          senderId: newMessage.senderId,
          senderName: newMessage.senderName,
          senderRole: newMessage.senderRole,
          recipientId: newMessage.recipientId,
          recipientName: newMessage.recipientName,
          recipientRole: newMessage.recipientRole,
          timestamp: new Date(newMessage.timestamp),
          isRead: newMessage.isRead
        }])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      })
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          isRead: true
        }),
      })
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId)
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to access chat</h1>
            <p className="text-gray-600">You need to be logged in to use the chat feature.</p>
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chat...</p>
          </div>
        </Card>
      </div>
    )
  }

  const currentUser: ChatUser = {
    id: session.user.id || '',
    name: session.user.name || 'Unknown',
    email: session.user.email || '',
    role: session.user.role || 'USER',
    avatar: undefined,
    isOnline: true,
    lastSeen: new Date(),
    unreadCount: 0
  }

  // Filter to show only approved users (ADMIN, LIBRARIAN, MEMBER)
  const approvedUsers = users.filter(user => 
    user.role === "ADMIN" || user.role === "LIBRARIAN" || user.role === "MEMBER"
  )

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-200px)]">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Library Chat</h1>
            <p className="text-gray-600">Connect with approved library members and staff</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              {approvedUsers.length} Approved Users
            </Badge>
            <Badge variant="outline" className="text-sm">
              {users.filter(u => u.role === "ADMIN").length} Admins
            </Badge>
            <Badge variant="outline" className="text-sm">
              {users.filter(u => u.role === "LIBRARIAN").length} Librarians
            </Badge>
            <Badge variant="outline" className="text-sm">
              {users.filter(u => u.role === "MEMBER").length} Members
            </Badge>
          </div>
        </div>
      </div>
      
      <Card className="h-full">
        <ChatInterface
          currentUser={currentUser}
          users={approvedUsers}
          messages={messages}
          onSendMessage={handleSendMessage}
          onMarkAsRead={handleMarkAsRead}
          onSelectUser={handleSelectUser}
          selectedUserId={selectedUserId}
        />
      </Card>
    </div>
  )
}
