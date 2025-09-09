"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ProfilePicture } from "./profile-picture"
import { Upload, X, Camera, Loader2 } from "lucide-react"

interface ProfilePictureUploadProps {
  currentPicture?: string | null
  onPictureChange?: (picturePath: string) => void
  size?: "sm" | "md" | "lg" | "xl"
  showPreview?: boolean
  className?: string
  disabled?: boolean
}

export function ProfilePictureUpload({
  currentPicture,
  onPictureChange,
  size = "md",
  showPreview = true,
  className = "",
  disabled = false
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, GIF, and WebP images are allowed.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive",
      })
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Upload file
    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/user/profile-picture", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload profile picture")
      }

      const data = await response.json()
      
      toast({
        title: "Success",
        description: "Profile picture uploaded successfully!",
      })

      // Call the callback with the new picture path
      if (onPictureChange) {
        onPictureChange(data.profilePicture)
      }

      // Refresh header profile picture
      if (typeof window !== 'undefined' && (window as any).refreshHeaderProfilePicture) {
        (window as any).refreshHeaderProfilePicture()
      }

      // Clean up preview URL
      URL.revokeObjectURL(url)
      setPreviewUrl(null)

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      })
      
      // Clean up preview URL on error
      URL.revokeObjectURL(url)
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }, [onPictureChange, toast])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [handleFileSelect])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const removePicture = async () => {
    try {
      const response = await fetch("/api/user/profile-picture", {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile picture removed successfully!",
        })

        if (onPictureChange) {
          onPictureChange("")
        }

        // Refresh header profile picture
        if (typeof window !== 'undefined' && (window as any).refreshHeaderProfilePicture) {
          (window as any).refreshHeaderProfilePicture()
        }
      } else {
        throw new Error("Failed to remove profile picture")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove profile picture",
        variant: "destructive",
      })
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const displayPicture = previewUrl || currentPicture

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Profile Picture Display */}
      {showPreview && (
        <div className="relative">
          <ProfilePicture
            src={displayPicture}
            alt="Profile picture"
            size={size}
            className="border-2 border-gray-200"
          />
          
          {/* Remove button for existing pictures */}
          {currentPicture && !isUploading && (
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={removePicture}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative w-full max-w-xs ${
          dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"
        } border-2 border-dashed rounded-lg p-6 transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <div className="text-center">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF, WebP up to 5MB
              </p>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={openFileDialog}
                disabled={disabled}
                className="mt-3"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
