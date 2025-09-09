"use client"

import * as React from "react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { X } from "lucide-react"
import { Upload } from "lucide-react"
import { FileText } from "lucide-react"
import { BookOpen } from "lucide-react"
import { File } from "lucide-react"
import { CheckCircle } from "lucide-react"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface DigitalFileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  selectedFile?: File | null
  uploadedFileUrl?: string | null
  className?: string
  disabled?: boolean
  maxSize?: number
  acceptedTypes?: string[]
}

// Supported digital file types
const SUPPORTED_TYPES: Record<string, {
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  mimeType: string
}> = {
  pdf: {
    name: "PDF Document",
    icon: FileText,
    color: "text-red-500",
    mimeType: "application/pdf"
  },
  docx: {
    name: "Word Document",
    icon: FileText,
    color: "text-blue-500",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  },
  doc: {
    name: "Word Document",
    icon: FileText,
    color: "text-blue-500",
    mimeType: "application/msword"
  },
  epub: {
    name: "EPUB Book",
    icon: BookOpen,
    color: "text-green-500",
    mimeType: "application/epub+zip"
  },
  txt: {
    name: "Text File",
    icon: FileText,
    color: "text-gray-500",
    mimeType: "text/plain"
  },
  rtf: {
    name: "Rich Text",
    icon: FileText,
    color: "text-gray-500",
    mimeType: "application/rtf"
  },
  odt: {
    name: "OpenDocument",
    icon: FileText,
    color: "text-orange-500",
    mimeType: "application/vnd.oasis.opendocument.text"
  },
  pages: {
    name: "Pages Document",
    icon: FileText,
    color: "text-purple-500",
    mimeType: "application/x-iwork-pages-sffpages"
  },
  mobi: {
    name: "Mobi Book",
    icon: BookOpen,
    color: "text-yellow-500",
    mimeType: "application/x-mobipocket-ebook"
  },
  azw3: {
    name: "Kindle Book",
    icon: BookOpen,
    color: "text-yellow-500",
    mimeType: "application/vnd.amazon.ebook"
  }
}

// Get file type info
const getFileTypeInfo = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return SUPPORTED_TYPES[extension as keyof typeof SUPPORTED_TYPES] || {
    name: "Document",
    icon: File,
    color: "text-gray-400",
    mimeType: ""
  }
}

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function DigitalFileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  uploadedFileUrl,
  className,
  disabled = false,
  maxSize = 100 * 1024 * 1024, // 100MB default
  acceptedTypes = Object.values(SUPPORTED_TYPES).map(type => type.mimeType)
}: DigitalFileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/epub+zip': ['.epub'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf'],
      'application/vnd.oasis.opendocument.text': ['.odt'],
      'application/x-iwork-pages-sffpages': ['.pages'],
      'application/x-mobipocket-ebook': ['.mobi'],
      'application/vnd.amazon.ebook': ['.azw3']
    },
    maxSize,
    multiple: false,
    disabled: disabled || isUploading
  })

  const currentFile = selectedFile || (uploadedFileUrl ? { name: "uploaded-file", size: 0 } as File : null)
  const fileTypeInfo = currentFile ? getFileTypeInfo(currentFile.name) : null
  const IconComponent = fileTypeInfo?.icon || File

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-[#8B4513] bg-[#8B4513]/10 scale-105"
            : "border-gray-300 hover:border-[#8B4513] hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed",
          isUploading && "pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className={cn(
              "p-4 rounded-full bg-gray-100",
              isDragActive && "bg-[#8B4513]/20"
            )}>
              <IconComponent className={cn(
                "h-12 w-12",
                fileTypeInfo?.color || "text-gray-400",
                isDragActive && "text-[#8B4513]"
              )} />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">
              {isDragActive ? "Drop your digital file here" : "Upload Digital File"}
            </h3>
            <p className="text-sm text-gray-600">
              {isDragActive 
                ? "Release to upload your file" 
                : "Click to upload or drag and drop your file"
              }
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: PDF, DOCX, EPUB, TXT, RTF, ODT, Pages, MOBI, AZW3
            </p>
            <p className="text-xs text-gray-500">
              Maximum file size: {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-800">Upload Error</span>
          </div>
          <div className="mt-2 text-sm text-red-700">
            {fileRejections[0].errors.map((error) => (
              <p key={error.code}>
                {error.code === "file-too-large"
                  ? `File is too large. Maximum size is ${formatFileSize(maxSize)}.`
                  : error.code === "file-invalid-type"
                  ? "Invalid file type. Please upload a supported digital file format."
                  : error.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Selected File Display */}
      {currentFile && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-lg bg-white", fileTypeInfo?.color)}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-green-900">{currentFile.name}</h4>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-sm text-green-700">
                {fileTypeInfo?.name} • {formatFileSize(currentFile.size)}
              </p>
              {uploadedFileUrl && (
                <p className="text-xs text-green-600">
                  Successfully uploaded
                </p>
              )}
            </div>
            {onFileRemove && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onFileRemove}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Supported File Types Info */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Supported File Types</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(SUPPORTED_TYPES).map(([ext, info]) => {
            const Icon = info.icon
            return (
              <div key={ext} className="flex items-center space-x-2 text-sm">
                <Icon className={cn("h-4 w-4", info.color)} />
                <span className="text-gray-600">.{ext.toUpperCase()}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
