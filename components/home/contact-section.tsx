"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MessageSquare, HelpCircle } from "lucide-react"
import Link from "next/link"

interface Contact {
  email: string
  phone: string
  live_chat: string
  support_message: string
}

interface ContactSectionProps {
  className?: string
}

export function ContactSection({ className }: ContactSectionProps) {
  const [contact, setContact] = useState<Contact>({
    email: "help@davel-library.com",
    phone: "(555) 123-4567",
    live_chat: "Available during hours",
    support_message: "Need assistance with any of our services?"
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/admin/homepage')
      if (response.ok) {
        const data = await response.json()
        setContact(data.contact)
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HelpCircle className="h-5 w-5 mr-2 text-[#8B4513] dark:text-[#d2691e]" />
          Get Help
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {contact.support_message}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-[#8B4513] dark:text-[#d2691e] flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-medium block">Email</span>
              <a 
                href={`mailto:${contact.email}`}
                className="text-[#8B4513] dark:text-[#d2691e] hover:underline"
              >
                {contact.email}
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-[#8B4513] dark:text-[#d2691e] flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-medium block">Phone</span>
              <a 
                href={`tel:${contact.phone}`}
                className="text-[#8B4513] dark:text-[#d2691e] hover:underline"
              >
                {contact.phone}
              </a>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-4 w-4 text-[#8B4513] dark:text-[#d2691e] flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-medium block">Live Chat</span>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {contact.live_chat}
              </span>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <Link href="/contact">
            <Button className="w-full bg-[#8B4513] hover:bg-[#A0522D] dark:bg-[#d2691e] dark:hover:bg-[#f4a460]">
              Contact Support
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

