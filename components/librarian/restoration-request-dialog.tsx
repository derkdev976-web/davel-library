"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { BookMarked, DollarSign } from "lucide-react"

interface RestorationRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RestorationRequestDialog({ isOpen, onClose, onSuccess }: RestorationRequestDialogProps) {
  const [formData, setFormData] = useState({
    userId: "",
    bookTitle: "",
    bookAuthor: "",
    damageType: "",
    damageDescription: "",
    estimatedCost: "",
    notes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.userId || !formData.bookTitle || !formData.bookAuthor || !formData.damageType || !formData.damageDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/librarian/restoration-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedCost: parseFloat(formData.estimatedCost) || 0
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Restoration request created successfully"
        })
        onSuccess()
        onClose()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to create restoration request")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create restoration request",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      userId: "",
      bookTitle: "",
      bookAuthor: "",
      damageType: "",
      damageDescription: "",
      estimatedCost: "",
      notes: ""
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
            <BookMarked className="h-5 w-5 text-amber-600" />
            <span>New Restoration Request</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="userId" className="text-gray-900 dark:text-gray-100 text-sm font-medium">User ID *</Label>
            <Input
              id="userId"
              value={formData.userId}
              onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
              placeholder="Enter user ID"
              className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 h-11"
              required
            />
          </div>

          <div>
            <Label htmlFor="bookTitle" className="text-gray-900 dark:text-gray-100">Book Title *</Label>
            <Input
              id="bookTitle"
              value={formData.bookTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, bookTitle: e.target.value }))}
              placeholder="e.g., The Great Gatsby"
              className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <Label htmlFor="bookAuthor">Book Author *</Label>
            <Input
              id="bookAuthor"
              value={formData.bookAuthor}
              onChange={(e) => setFormData(prev => ({ ...prev, bookAuthor: e.target.value }))}
              placeholder="e.g., F. Scott Fitzgerald"
              required
            />
          </div>

          <div>
            <Label htmlFor="damageType">Type of Damage *</Label>
            <Select value={formData.damageType} onValueChange={(value) => setFormData(prev => ({ ...prev, damageType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select damage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Water Damage">Water Damage</SelectItem>
                <SelectItem value="Spine Damage">Spine Damage</SelectItem>
                <SelectItem value="Page Tears">Page Tears</SelectItem>
                <SelectItem value="Cover Damage">Cover Damage</SelectItem>
                <SelectItem value="Mold Damage">Mold Damage</SelectItem>
                <SelectItem value="Insect Damage">Insect Damage</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="damageDescription">Damage Description *</Label>
            <Textarea
              id="damageDescription"
              value={formData.damageDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, damageDescription: e.target.value }))}
              placeholder="Describe the damage in detail..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="estimatedCost"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                placeholder="0.00"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Special instructions, book value, urgency level..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <BookMarked className="h-4 w-4 mr-2" />
                  Create Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
