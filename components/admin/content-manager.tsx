"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/ui/file-upload"
import { 
  Plus, Edit, Trash, Eye, EyeOff, Star, Calendar, Tag,
  Image as ImageIcon, Video, FileText, Globe, Lock, Users
} from "lucide-react"
import Image from 'next/image'

interface ContentItem {
  id: string
  title: string
  description: string
  content: string
  type: "NEWS" | "EVENT" | "GALLERY"
  category: string
  tags: string[]
  imageUrl: string
  isPublished: boolean
  isFeatured: boolean
  createdAt: string
  eventDate?: string
  location?: string
  attendees?: number
  maxAttendees?: number
}

export function ContentManager() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [activeTab, setActiveTab] = useState("news")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    type: "NEWS" as "NEWS" | "EVENT" | "GALLERY",
    category: "",
    tags: [] as string[],
    imageUrl: "/images/catalog/placeholder.svg",
    isPublished: true,
    isFeatured: false,
    eventDate: "",
    location: "",
    attendees: 0,
    maxAttendees: 0
  })

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        setContent(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching content:', error)
      toast({ title: "Error fetching content", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        toast({ title: "Content added successfully" })
        setIsAddDialogOpen(false)
        resetForm()
        fetchContent()
      } else {
        const errorData = await response.json()
        console.error('Content API error:', errorData)
        toast({ 
          title: "Error adding content", 
          description: errorData.details || errorData.error || "Unknown error",
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error('Error adding content:', error)
      toast({ title: "Error adding content", variant: "destructive" })
    }
  }

  const handleEdit = async () => {
    if (!selectedItem) return
    
    try {
      const response = await fetch(`/api/content/${selectedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        toast({ title: "Content updated successfully" })
        setIsEditDialogOpen(false)
        resetForm()
        fetchContent()
      } else {
        toast({ title: "Error updating content", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating content:', error)
      toast({ title: "Error updating content", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast({ title: "Content deleted successfully" })
        fetchContent()
      } else {
        toast({ title: "Error deleting content", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error deleting content:', error)
      toast({ title: "Error deleting content", variant: "destructive" })
    }
  }

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished })
      })
      
      if (response.ok) {
        toast({ title: `Content ${isPublished ? 'unpublished' : 'published'} successfully` })
        fetchContent()
      } else {
        toast({ title: "Error updating content status", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error updating content status:', error)
      toast({ title: "Error updating content status", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      type: "NEWS",
      category: "",
      tags: [],
      imageUrl: "/images/catalog/placeholder.svg",
      isPublished: true,
      isFeatured: false,
      eventDate: "",
      location: "",
      attendees: 0,
      maxAttendees: 0
    })
  }

  const openEditDialog = (item: ContentItem) => {
    setSelectedItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content,
      type: item.type,
      category: item.category,
      tags: item.tags,
      imageUrl: item.imageUrl,
      isPublished: item.isPublished,
      isFeatured: item.isFeatured,
      eventDate: item.eventDate || "",
      location: item.location || "",
      attendees: item.attendees || 0,
      maxAttendees: item.maxAttendees || 0
    })
    setIsEditDialogOpen(true)
  }

  const filteredContent = content.filter(item => {
    if (activeTab === "news") return item.type === "NEWS"
    if (activeTab === "events") return item.type === "EVENT"
    if (activeTab === "gallery") return item.type === "GALLERY"
    return true
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "NEWS": return <FileText className="h-4 w-4" />
      case "EVENT": return <Calendar className="h-4 w-4" />
      case "GALLERY": return <ImageIcon className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "NEWS": return "bg-blue-100 text-blue-800"
      case "EVENT": return "bg-green-100 text-green-800"
      case "GALLERY": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-gray-600">Manage news, events, and gallery content</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#8B4513] hover:bg-[#A0522D]">
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("news")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "news" 
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          News
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "events" 
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "gallery" 
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          }`}
        >
          Gallery
        </button>
      </div>

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ({filteredContent.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading content...</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No {activeTab} found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center space-x-4">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.title} 
                      width={64}
                      height={64}
                      className="object-cover rounded"
                    />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        {getTypeIcon(item.type)}
                        <Badge className={getTypeColor(item.type)}>
                          {item.type}
                        </Badge>
                        {item.isFeatured && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {item.isPublished ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Globe className="h-3 w-3 mr-1" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600 border-gray-600">
                            <Lock className="h-3 w-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{item.category}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.eventDate && (
                          <span>Event: {new Date(item.eventDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTogglePublish(item.id, item.isPublished)}
                    >
                      {item.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "Edit Content" : "Add New Content"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Content title"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value: "NEWS" | "EVENT" | "GALLERY") => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEWS">News</SelectItem>
                    <SelectItem value="EVENT">Event</SelectItem>
                    <SelectItem value="GALLERY">Gallery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Category"
                />
              </div>
              
              {formData.type === "EVENT" && (
                <div>
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  />
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="content">Full Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Full content details"
                rows={6}
              />
            </div>
            
            {formData.type === "EVENT" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Event location"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="attendees">Current Attendees</Label>
                    <Input
                      id="attendees"
                      type="number"
                      value={formData.attendees}
                      onChange={(e) => setFormData({ ...formData, attendees: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxAttendees">Max Attendees</Label>
                    <Input
                      id="maxAttendees"
                      type="number"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags.join(", ")}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag) })}
                placeholder="tag1, tag2, tag3"
              />
            </div>
            
            <div>
              <Label>Media Upload</Label>
              <FileUpload
                onFileSelect={async (file) => {
                  try {
                    const uploadFormData = new FormData()
                    uploadFormData.append('file', file)
                    uploadFormData.append('type', formData.type.toLowerCase())

                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: uploadFormData
                    })

                    if (response.ok) {
                      const { url } = await response.json()
                      setFormData({ ...formData, imageUrl: url })
                    }
                  } catch (error) {
                    console.error('Error uploading file:', error)
                  }
                }}
                onFileRemove={() => setFormData({ ...formData, imageUrl: "/images/catalog/placeholder.svg" })}
                previewUrl={formData.imageUrl && formData.imageUrl !== "/images/catalog/placeholder.svg" ? formData.imageUrl : null}
                type={formData.type === "EVENT" ? "news" : formData.type.toLowerCase() as "news" | "gallery"}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
                <Label htmlFor="isPublished">Published</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false)
              setIsEditDialogOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={isEditDialogOpen ? handleEdit : handleSubmit} className="bg-[#8B4513] hover:bg-[#A0522D]">
              {isEditDialogOpen ? "Update Content" : "Add Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
