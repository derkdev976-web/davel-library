"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DocumentUploadProps {
  label: string
  description?: string
  required?: boolean
  acceptedTypes?: string[]
  maxSize?: number // in MB
  value?: File[]
  onChange: (files: File[]) => void
  error?: string
}

export function DocumentUpload({
  label,
  description,
  required = false,
  acceptedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
  maxSize = 10, // 10MB default
  value = [],
  onChange,
  error
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onChange([...value, ...acceptedFiles])
  }, [value, onChange])

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index)
    onChange(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      if (type.startsWith('.')) {
        acc[type] = []
      } else {
        acc[type] = []
      }
      return acc
    }, {} as Record<string, string[]>),
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: true
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4 text-blue-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      )}

      <Card className={cn(
        "border-2 border-dashed transition-colors",
        isDragActive ? "border-[#8B4513] bg-[#8B4513]/5" : "border-gray-300 dark:border-gray-600",
        error ? "border-red-500" : ""
      )}>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className="text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isDragActive
                ? "Drop the files here..."
                : "Drag & drop files here, or click to select files"
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: {acceptedTypes.join(", ")} (Max {maxSize}MB each)
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {value.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Uploaded Files:</Label>
          <div className="space-y-2">
            {value.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
