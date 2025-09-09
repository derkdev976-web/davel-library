"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Save,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  BarChart3,
  Users,
  BookOpen,
  Calendar,
  Globe,
  RefreshCw
} from "lucide-react"

interface ServiceHours {
  monday_friday: string
  saturday: string
  sunday: string
  digital_library: string
}

interface Contact {
  email: string
  phone: string
  live_chat: string
  support_message: string
}

interface Statistics {
  books_available: string
  active_members: string
  events_this_year: string
  digital_resources: string
}

interface Hero {
  title: string
  subtitle: string
  impact_message: string
}

interface HomepageContent {
  serviceHours: ServiceHours
  contact: Contact
  statistics: Statistics
  hero: Hero
}

interface HomepageManagerProps {
  onContentUpdate?: (content: HomepageContent) => void
}

export function HomepageManager({ onContentUpdate }: HomepageManagerProps) {
  const [content, setContent] = useState<HomepageContent>({
    serviceHours: {
      monday_friday: "",
      saturday: "",
      sunday: "",
      digital_library: ""
    },
    contact: {
      email: "",
      phone: "",
      live_chat: "",
      support_message: ""
    },
    statistics: {
      books_available: "",
      active_members: "",
      events_this_year: "",
      digital_resources: ""
    },
    hero: {
      title: "",
      subtitle: "",
      impact_message: ""
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/homepage')
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      }
    } catch (error) {
      console.error('Error fetching homepage content:', error)
      toast({
        title: "Error",
        description: "Failed to load homepage content",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: "Homepage content updated successfully"
        })
        onContentUpdate?.(result.content)
      } else {
        throw new Error('Failed to update content')
      }
    } catch (error) {
      console.error('Error saving homepage content:', error)
      toast({
        title: "Error",
        description: "Failed to save homepage content",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateServiceHours = (field: keyof ServiceHours, value: string) => {
    setContent(prev => ({
      ...prev,
      serviceHours: {
        ...prev.serviceHours,
        [field]: value
      }
    }))
  }

  const updateContact = (field: keyof Contact, value: string) => {
    setContent(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }))
  }

  const updateStatistics = (field: keyof Statistics, value: string) => {
    setContent(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        [field]: value
      }
    }))
  }

  const updateHero = (field: keyof Hero, value: string) => {
    setContent(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading homepage content...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Homepage Content Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Update the dynamic content displayed on the homepage
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="hours" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hours">Service Hours</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
        </TabsList>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Service Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monday-friday">Monday - Friday</Label>
                  <Input
                    id="monday-friday"
                    value={content.serviceHours.monday_friday}
                    onChange={(e) => updateServiceHours('monday_friday', e.target.value)}
                    placeholder="8:00 AM - 10:00 PM"
                  />
                </div>
                <div>
                  <Label htmlFor="saturday">Saturday</Label>
                  <Input
                    id="saturday"
                    value={content.serviceHours.saturday}
                    onChange={(e) => updateServiceHours('saturday', e.target.value)}
                    placeholder="9:00 AM - 8:00 PM"
                  />
                </div>
                <div>
                  <Label htmlFor="sunday">Sunday</Label>
                  <Input
                    id="sunday"
                    value={content.serviceHours.sunday}
                    onChange={(e) => updateServiceHours('sunday', e.target.value)}
                    placeholder="10:00 AM - 6:00 PM"
                  />
                </div>
                <div>
                  <Label htmlFor="digital-library">Digital Library</Label>
                  <Input
                    id="digital-library"
                    value={content.serviceHours.digital_library}
                    onChange={(e) => updateServiceHours('digital_library', e.target.value)}
                    placeholder="Available 24/7 online"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="support-message">Support Message</Label>
                <Textarea
                  id="support-message"
                  value={content.contact.support_message}
                  onChange={(e) => updateContact('support_message', e.target.value)}
                  placeholder="Need assistance with any of our services?"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={content.contact.email}
                    onChange={(e) => updateContact('email', e.target.value)}
                    placeholder="help@davel-library.com"
                    type="email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={content.contact.phone}
                    onChange={(e) => updateContact('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    type="tel"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="live-chat">Live Chat Availability</Label>
                <Input
                  id="live-chat"
                  value={content.contact.live_chat}
                  onChange={(e) => updateContact('live_chat', e.target.value)}
                  placeholder="Available during hours"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Impact Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="books-available" className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Books Available
                  </Label>
                  <Input
                    id="books-available"
                    value={content.statistics.books_available}
                    onChange={(e) => updateStatistics('books_available', e.target.value)}
                    placeholder="10,000+"
                  />
                </div>
                <div>
                  <Label htmlFor="active-members" className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Active Members
                  </Label>
                  <Input
                    id="active-members"
                    value={content.statistics.active_members}
                    onChange={(e) => updateStatistics('active_members', e.target.value)}
                    placeholder="2,500+"
                  />
                </div>
                <div>
                  <Label htmlFor="events-this-year" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Events This Year
                  </Label>
                  <Input
                    id="events-this-year"
                    value={content.statistics.events_this_year}
                    onChange={(e) => updateStatistics('events_this_year', e.target.value)}
                    placeholder="150+"
                  />
                </div>
                <div>
                  <Label htmlFor="digital-resources" className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    Digital Resources
                  </Label>
                  <Input
                    id="digital-resources"
                    value={content.statistics.digital_resources}
                    onChange={(e) => updateStatistics('digital_resources', e.target.value)}
                    placeholder="5,000+"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero-title">Main Title</Label>
                <Input
                  id="hero-title"
                  value={content.hero.title}
                  onChange={(e) => updateHero('title', e.target.value)}
                  placeholder="Welcome to Davel Library"
                />
              </div>
              <div>
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Textarea
                  id="hero-subtitle"
                  value={content.hero.subtitle}
                  onChange={(e) => updateHero('subtitle', e.target.value)}
                  placeholder="Experience the future of library management..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="impact-message">Impact Message</Label>
                <Input
                  id="impact-message"
                  value={content.hero.impact_message}
                  onChange={(e) => updateHero('impact_message', e.target.value)}
                  placeholder="Join thousands of readers who have made Davel Library their literary home"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

