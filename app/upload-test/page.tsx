"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { Upload, CheckCircle, XCircle, FileText, Image, Video } from "lucide-react"

export default function UploadTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState<string>("profile")
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const { toast } = useToast()

  const uploadTypes = [
    { value: "profile", label: "Profile Picture", icon: Image, description: "User profile pictures (5MB max)" },
    { value: "gallery", label: "Gallery", icon: Image, description: "Gallery images and videos (10MB max)" },
    { value: "news", label: "News", icon: FileText, description: "News article images (5MB max)" },
    { value: "digital", label: "Digital Books", icon: FileText, description: "E-books and documents (100MB max)" },
    { value: "document", label: "Documents", icon: FileText, description: "General documents (50MB max)" },
    { value: "print", label: "Print Jobs", icon: FileText, description: "Print service files (25MB max)" }
  ]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: "Please select a file", variant: "destructive" })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('type', uploadType)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setUploadResult(result)
        toast({ title: "Upload successful!", description: `File uploaded to: ${result.url}` })
      } else {
        toast({ title: "Upload failed", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({ title: "Upload failed", description: "Network error occurred", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen app-background">
      <Header />
      
      <main className="pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              File Upload Test
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Test all file upload types to ensure Cloudinary integration is working
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Form */}
            <Card className="card-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Type Selection */}
                <div>
                  <Label>Upload Type</Label>
                  <Select value={uploadType} onValueChange={setUploadType}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {uploadTypes.map((type) => {
                        const Icon = type.icon
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-gray-500">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* File Selection */}
                <div>
                  <Label>Select File</Label>
                  <Input
                    type="file"
                    onChange={handleFileSelect}
                    className="mt-2"
                    accept={
                      uploadType === 'profile' || uploadType === 'news' ? 'image/*' :
                      uploadType === 'gallery' ? 'image/*,video/*' :
                      uploadType === 'digital' ? '.pdf,.docx,.doc,.epub,.txt,.rtf,.odt,.pages,.mobi,.azw3' :
                      uploadType === 'document' ? '.pdf,.docx,.doc,.txt,.rtf,.odt,.pages' :
                      uploadType === 'print' ? '.pdf,.docx,.doc,.txt,.rtf,.odt,.pptx,.ppt,.xlsx,.xls,.jpg,.jpeg,.png,.gif,.webp' :
                      '*'
                    }
                  />
                </div>

                {/* File Info */}
                {selectedFile && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {getFileIcon(selectedFile)}
                      <span className="font-medium">{selectedFile.name}</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>Size: {formatFileSize(selectedFile.size)}</div>
                      <div>Type: {selectedFile.type}</div>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full"
                >
                  {uploading ? "Uploading..." : "Upload File"}
                </Button>
              </CardContent>
            </Card>

            {/* Upload Result */}
            <Card className="card-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {uploadResult ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                  Upload Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {uploadResult ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-800 dark:text-green-200">
                          Upload Successful!
                        </span>
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        File uploaded to Cloudinary successfully
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium">File URL:</Label>
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm break-all">
                          {uploadResult.url}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="font-medium">Original Name:</Label>
                          <div>{uploadResult.originalName}</div>
                        </div>
                        <div>
                          <Label className="font-medium">File Size:</Label>
                          <div>{formatFileSize(uploadResult.size)}</div>
                        </div>
                        <div>
                          <Label className="font-medium">File Type:</Label>
                          <div>{uploadResult.type}</div>
                        </div>
                        <div>
                          <Label className="font-medium">Uploaded At:</Label>
                          <div>{new Date(uploadResult.uploadedAt).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {uploadResult.url && (
                      <div>
                        <Label className="text-sm font-medium">Preview:</Label>
                        <div className="mt-2">
                          {uploadResult.type.startsWith('image/') ? (
                            <img
                              src={uploadResult.url}
                              alt="Upload preview"
                              className="max-w-full h-32 object-cover rounded border"
                            />
                          ) : (
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded text-center">
                              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {uploadResult.originalName}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No upload result yet</p>
                    <p className="text-sm">Upload a file to see the result here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="card-background mt-8">
            <CardHeader>
              <CardTitle>Upload Test Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  How to Test:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Select an upload type from the dropdown</li>
                  <li>Choose a file that matches the allowed types for that category</li>
                  <li>Click "Upload File" to test the upload</li>
                  <li>Check the result panel for success/failure details</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Supported File Types:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Images:</strong> JPG, PNG, GIF, WebP
                  </div>
                  <div>
                    <strong>Videos:</strong> MP4, MOV, WebM (Gallery only)
                  </div>
                  <div>
                    <strong>Documents:</strong> PDF, DOCX, DOC, TXT, RTF, ODT, Pages
                  </div>
                  <div>
                    <strong>E-books:</strong> EPUB, MOBI, AZW3
                  </div>
                  <div>
                    <strong>Presentations:</strong> PPTX, PPT (Print only)
                  </div>
                  <div>
                    <strong>Spreadsheets:</strong> XLSX, XLS (Print only)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}