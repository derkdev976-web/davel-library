"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { GraduationCap, Users, Calendar, MapPin, DollarSign } from "lucide-react"

interface AfternoonClassDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AfternoonClassDialog({ isOpen, onClose, onSuccess }: AfternoonClassDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    maxStudents: "",
    startDate: "",
    endDate: "",
    schedule: "",
    location: "",
    materials: "",
    cost: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category || !formData.maxStudents || !formData.startDate || !formData.endDate || !formData.schedule || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/librarian/afternoon-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxStudents: parseInt(formData.maxStudents),
          cost: parseFloat(formData.cost) || 0
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Afternoon class created successfully"
        })
        onSuccess()
        onClose()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to create afternoon class")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create afternoon class",
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
      category: "",
      maxStudents: "",
      startDate: "",
      endDate: "",
      schedule: "",
      location: "",
      materials: "",
      cost: ""
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
      <DialogContent className="max-w-lg bg-white dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <GraduationCap className="h-5 w-5 text-purple-600" />
            <span>New Afternoon Class</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-900 dark:text-gray-100 text-sm font-medium">Class Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Basic Computer Skills for Seniors"
              className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-900 dark:text-gray-100 text-sm font-medium">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the class content and objectives..."
              rows={4}
              className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 resize-none"
              required
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-gray-900 dark:text-gray-100">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectItem value="LITERACY">Literacy</SelectItem>
                <SelectItem value="COMPUTER_SKILLS">Computer Skills</SelectItem>
                <SelectItem value="CRAFTS">Crafts</SelectItem>
                <SelectItem value="LANGUAGE">Language</SelectItem>
                <SelectItem value="MUSIC">Music</SelectItem>
                <SelectItem value="ART">Art</SelectItem>
                <SelectItem value="COOKING">Cooking</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="maxStudents">Maximum Students *</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="maxStudents"
                type="number"
                min="1"
                max="50"
                value={formData.maxStudents}
                onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                placeholder="15"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="schedule">Schedule *</Label>
            <Input
              id="schedule"
              value={formData.schedule}
              onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
              placeholder="e.g., Tuesdays and Thursdays, 2:00 PM - 3:30 PM"
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Computer Lab, Conference Room A"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="materials">Materials Required</Label>
            <Textarea
              id="materials"
              value={formData.materials}
              onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
              placeholder="e.g., Laptops provided, bring notebook"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="cost">Class Cost ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="0.00"
                className="pl-10"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Create Class
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
