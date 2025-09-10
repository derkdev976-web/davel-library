"use client"

import * as React from "react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { X, Upload, Image as ImageIcon, FileText, File, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Image from 'next/image'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  selectedFile?: File | null
  previewUrl?: string | null
  accept?: string
  maxSize?: number
  className?: string
  disabled?: boolean
  type?: "profile" | "gallery" | "news" | "digital" | "document"
}

// File type configurations
const FILE_TYPES = {
  profile: {
    accept: "image/*",
    maxSize: 5 * 1024 * 1024, // 5MB
    description: "PNG, JPG, GIF up to 5MB",
    icon: ImageIcon
  },
  gallery: {
    accept: "image/*,video/*",
    maxSize: 10 * 1024 * 1024, // 10MB
    description: "Images: PNG, JPG, GIF. Videos: MP4, MOV up to 10MB",
    icon: Upload
  },
  news: {
    accept: "image/*",
    maxSize: 5 * 1024 * 1024, // 5MB
    description: "PNG, JPG, GIF up to 5MB",
    icon: Upload
  },
  digital: {
    accept: ".pdf,.docx,.doc,.epub,.txt,.rtf,.odt,.pages,.mobi,.azw3",
    maxSize: 100 * 1024 * 1024, // 100MB
    description: "PDF, DOCX, EPUB, TXT, RTF, ODT, Pages, MOBI, AZW3 up to 100MB",
    icon: BookOpen
  },
  document: {
    accept: ".pdf,.docx,.doc,.txt,.rtf,.odt,.pages",
    maxSize: 50 * 1024 * 1024, // 50MB
    description: "PDF, DOCX, DOC, TXT, RTF, ODT, Pages up to 50MB",
    icon: FileText
  }
}

// Get file type icon based on file extension
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return <FileText className="h-8 w-8 text-red-500" />
    case 'docx':
    case 'doc':
      return <FileText className="h-8 w-8 text-blue-500" />
    case 'epub':
      return <BookOpen className="h-8 w-8 text-green-500" />
    case 'txt':
    case 'rtf':
      return <FileText className="h-8 w-8 text-gray-500" />
    case 'odt':
      return <FileText className="h-8 w-8 text-orange-500" />
    case 'pages':
      return <FileText className="h-8 w-8 text-purple-500" />
    case 'mobi':
    case 'azw3':
      return <BookOpen className="h-8 w-8 text-yellow-500" />
    default:
      return <File className="h-8 w-8 text-gray-400" />
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

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  previewUrl,
  accept,
  maxSize,
  className,
  disabled = false,
  type = "profile"
}: FileUploadProps) {
  const config = FILE_TYPES[type] || FILE_TYPES.profile
  const finalAccept = accept || config.accept
  const finalMaxSize = maxSize || config.maxSize
  const IconComponent = config.icon

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
    accept: finalAccept ? { [finalAccept]: [] } : undefined,
    maxSize: finalMaxSize,
    multiple: false,
    disabled
  })

  const isImage = selectedFile?.type.startsWith("image/") || previewUrl
  const isDigitalFile = type === "digital" || type === "document"

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-[#8B4513] bg-[#8B4513]/10"
            : "border-gray-300 hover:border-[#8B4513] hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        
        {type === "profile" && (
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative inline-block">
                <Image
                  src={previewUrl}
                  alt="Profile preview"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                />
                {onFileRemove && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileRemove()
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {isDragActive ? "Drop your profile picture here" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {config.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {(type === "gallery" || type === "news") && (
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative inline-block">
                <Image
                  src={previewUrl}
                  alt="Upload preview"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-lg object-cover mx-auto border-4 border-white shadow-lg"
                />
                {onFileRemove && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onFileRemove()
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    {isDragActive ? "Drop your image here" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {config.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {isDigitalFile && (
          <div className="space-y-2">
            <IconComponent className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">
                {isDragActive ? "Drop your digital file here" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {config.description}
              </p>
            </div>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="text-sm text-red-600">
          {fileRejections[0].errors.map((error) => (
            <p key={error.code}>
              {error.code === "file-too-large"
                ? `File is too large. Maximum size is ${formatFileSize(finalMaxSize)}.`
                : error.code === "file-invalid-type"
                ? `Invalid file type. Please upload a supported file format.`
                : error.message}
            </p>
          ))}
        </div>
      )}

      {selectedFile && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-3">
            {isDigitalFile ? getFileIcon(selectedFile.name) : <File className="h-5 w-5 text-gray-400" />}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-gray-500">Size: {formatFileSize(selectedFile.size)}</p>
              <p className="text-gray-500">Type: {selectedFile.type || 'Unknown'}</p>
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
    </div>
  )
}


