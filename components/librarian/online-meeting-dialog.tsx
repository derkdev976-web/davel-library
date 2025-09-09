"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Video, Users, Calendar, Clock } from "lucide-react"

interface OnlineMeetingDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function OnlineMeetingDialog({ isOpen, onClose, onSuccess }: OnlineMeetingDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meetingType: "",
    maxParticipants: "",
    startTime: "",
    endTime: "",
    meetingLink: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.meetingType || !formData.maxParticipants || !formData.startTime || !formData.endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/librarian/online-meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxParticipants: parseInt(formData.maxParticipants)
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Online meeting created successfully"
        })
        onSuccess()
        onClose()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to create online meeting")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create online meeting",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      meetingType: "",
      maxParticipants: "",
      startTime: "",
      endTime: "",
      meetingLink: ""
    })
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Video className="h-5 w-5 text-green-600" />
            <span>New Online Meeting</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Book Club Discussion"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the meeting purpose and agenda..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="meetingType">Meeting Type *</Label>
            <Select value={formData.meetingType} onValueChange={(value) => setFormData(prev => ({ ...prev, meetingType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select meeting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDY_GROUP">Study Group</SelectItem>
                <SelectItem value="BOOK_CLUB">Book Club</SelectItem>
                <SelectItem value="TUTORIAL">Tutorial</SelectItem>
                <SelectItem value="WORKSHOP">Workshop</SelectItem>
                <SelectItem value="CONSULTATION">Consultation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="maxParticipants">Maximum Participants *</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="maxParticipants"
                type="number"
                min="1"
                max="100"
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: e.target.value }))}
                placeholder="10"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
            <Input
              id="meetingLink"
              value={formData.meetingLink}
              onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
              placeholder="https://meet.google.com/..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Create Meeting
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
