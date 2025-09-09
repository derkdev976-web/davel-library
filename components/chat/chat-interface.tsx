"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Send, 
  MessageCircle, 
  Users, 
  User, 
  Shield,
  Clock,
  MoreVertical
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProfilePicture } from "@/components/ui/profile-picture"

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

interface ChatInterfaceProps {
  currentUser: ChatUser
  users: ChatUser[]
  messages: Message[]
  onSendMessage: (content: string, recipientId: string) => void
  onMarkAsRead: (messageId: string) => void
  onSelectUser: (userId: string) => void
  selectedUserId?: string
}

export function ChatInterface({
  currentUser,
  users,
  messages,
  onSendMessage,
  onMarkAsRead,
  onSelectUser,
  selectedUserId
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedUser = users.find(user => user.id === selectedUserId)
  const filteredMessages = messages.filter(
    msg => 
      (msg.senderId === currentUser.id && msg.recipientId === selectedUserId) ||
      (msg.senderId === selectedUserId && msg.recipientId === currentUser.id)
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [filteredMessages])

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUserId) {
      onSendMessage(newMessage.trim(), selectedUserId)
      setNewMessage("")
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(date)
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const messageDate = new Date(date)
    
    if (messageDate.toDateString() === today.toDateString()) {
      return "Today"
    } else if (messageDate.toDateString() === new Date(today.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
      return "Yesterday"
    } else {
      return messageDate.toLocaleDateString()
    }
  }

  return (
    <div className="h-full flex">
      {/* Users List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Messages
          </CardTitle>
        </CardHeader>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUserId === user.id
                    ? "bg-[#8B4513] text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => onSelectUser(user.id)}
              >
                <div className="relative">
                  <ProfilePicture 
                    src={user.avatar}
                    alt={user.name}
                    size="sm"
                    className="h-10 w-10"
                  />
                  {user.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    {user.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                        {user.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {user.role === "ADMIN" && <Shield className="h-3 w-3" />}
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ProfilePicture 
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    size="sm"
                    className="h-10 w-10"
                  />
                  <div>
                    <CardTitle className="text-lg">{selectedUser.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedUser.role}
                      </Badge>
                      {selectedUser.isOnline ? (
                        <span className="text-xs text-green-600">Online</span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Last seen {selectedUser.lastSeen ? formatTime(selectedUser.lastSeen) : "unknown"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Block User</DropdownMenuItem>
                    <DropdownMenuItem>Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {filteredMessages.map((message, index) => {
                  const isOwnMessage = message.senderId === currentUser.id
                  const showDate = index === 0 || 
                    formatDate(message.timestamp) !== formatDate(filteredMessages[index - 1]?.timestamp)
                  
                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="text-center my-4">
                          <Badge variant="outline" className="text-xs">
                            {formatDate(message.timestamp)}
                          </Badge>
                        </div>
                      )}
                      
                      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? "order-2" : "order-1"}`}>
                          {!isOwnMessage && (
                            <div className="flex items-center space-x-2 mb-1">
                              <ProfilePicture 
                                src={selectedUser.avatar}
                                alt={selectedUser.name}
                                size="sm"
                                className="h-6 w-6"
                              />
                              <span className="text-xs font-medium">{message.senderName}</span>
                            </div>
                          )}
                          
                          <div
                            className={`p-3 rounded-lg ${
                              isOwnMessage
                                ? "bg-[#8B4513] text-white"
                                : "bg-gray-100 dark:bg-gray-800"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className={`flex items-center justify-end space-x-1 mt-1 ${
                              isOwnMessage ? "text-white/70" : "text-gray-500"
                            }`}>
                              <Clock className="h-3 w-3" />
                              <span className="text-xs">{formatTime(message.timestamp)}</span>
                              {isOwnMessage && message.isRead && (
                                <span className="text-xs">✓✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-[#8B4513] hover:bg-[#A0522D]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Choose a user from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
