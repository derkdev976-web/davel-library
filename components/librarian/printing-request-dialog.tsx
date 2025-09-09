"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Printer, X } from "lucide-react"

interface PrintingRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PrintingRequestDialog({ isOpen, onClose, onSuccess }: PrintingRequestDialogProps) {
  const [formData, setFormData] = useState({
    userId: "",
    documentName: "",
    pages: "",
    copies: "",
    paperSize: "A4",
    color: false,
    priority: "MEDIUM",
    notes: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.userId || !formData.documentName || !formData.pages || !formData.copies) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/librarian/printing-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pages: parseInt(formData.pages),
          copies: parseInt(formData.copies)
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Printing request created successfully"
        })
        onSuccess()
        onClose()
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to create printing request")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create printing request",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      userId: "",
      documentName: "",
      pages: "",
      copies: "",
      paperSize: "A4",
      color: false,
      priority: "MEDIUM",
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Printer className="h-5 w-5 text-blue-600" />
            <span>New Printing Request</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userId">User ID *</Label>
            <Input
              id="userId"
              value={formData.userId}
              onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
              placeholder="Enter user ID"
              required
            />
          </div>

          <div>
            <Label htmlFor="documentName">Document Name *</Label>
            <Input
              id="documentName"
              value={formData.documentName}
              onChange={(e) => setFormData(prev => ({ ...prev, documentName: e.target.value }))}
              placeholder="e.g., Research Paper, Resume"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pages">Pages *</Label>
              <Input
                id="pages"
                type="number"
                min="1"
                value={formData.pages}
                onChange={(e) => setFormData(prev => ({ ...prev, pages: e.target.value }))}
                placeholder="1"
                required
              />
            </div>
            <div>
              <Label htmlFor="copies">Copies *</Label>
              <Input
                id="copies"
                type="number"
                min="1"
                value={formData.copies}
                onChange={(e) => setFormData(prev => ({ ...prev, copies: e.target.value }))}
                placeholder="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paperSize">Paper Size</Label>
              <Select value={formData.paperSize} onValueChange={(value) => setFormData(prev => ({ ...prev, paperSize: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">A4</SelectItem>
                  <SelectItem value="Letter">Letter</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="A3">A3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="color"
              checked={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="color">Color Printing</Label>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Special instructions or requirements..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
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
