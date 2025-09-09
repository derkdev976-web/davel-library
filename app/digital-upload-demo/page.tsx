"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DigitalFileUpload } from "@/components/ui/digital-file-upload"
import { FileUpload } from "@/components/ui/file-upload"
import { useToast } from "@/hooks/use-toast"
import { FileText, BookOpen, Upload, CheckCircle } from "lucide-react"

export default function DigitalUploadDemo() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)
  const [uploadType, setUploadType] = useState<string>("digital")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    fileType: "",
    fileSize: ""
  })
  const { toast } = useToast()

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setFormData({
      ...formData,
      fileType: file.type || "Unknown",
      fileSize: formatFileSize(file.size)
    })
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setUploadedFileUrl(null)
    setFormData({
      ...formData,
      fileType: "",
      fileSize: ""
    })
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive"
      })
      return
    }

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile)
      uploadFormData.append('type', uploadType)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })
      
      if (response.ok) {
        const result = await response.json()
        setUploadedFileUrl(result.url)
        toast({
          title: "Upload Successful",
          description: "File uploaded successfully",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Upload Failed",
          description: errorData.error || "Failed to upload file",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Error",
        description: "Failed to upload file",
        variant: "destructive"
      })
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Digital File Upload Demo</h1>
          <p className="text-lg text-gray-600">
            Test the enhanced file upload functionality supporting PDFs, DOCX, EPUB, and more digital file types
          </p>
        </div>

        {/* Upload Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>Upload Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="uploadType">Upload Type</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Digital Books (PDF, EPUB, etc.)</SelectItem>
                  <SelectItem value="document">Documents (PDF, DOCX, etc.)</SelectItem>
                  <SelectItem value="gallery">Gallery (Images & Videos)</SelectItem>
                  <SelectItem value="profile">Profile Pictures</SelectItem>
                  <SelectItem value="news">News Images</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* File Upload Component */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>File Upload</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uploadType === "digital" || uploadType === "document" ? (
              <DigitalFileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                selectedFile={selectedFile}
                uploadedFileUrl={uploadedFileUrl}
                maxSize={uploadType === "digital" ? 100 * 1024 * 1024 : 50 * 1024 * 1024}
              />
            ) : (
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                selectedFile={selectedFile}
                type={uploadType as any}
              />
            )}
          </CardContent>
        </Card>

        {/* File Information */}
        {selectedFile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>File Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">File Name</Label>
                  <Input
                    id="title"
                    value={selectedFile.name}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="fileType">File Type</Label>
                  <Input
                    id="fileType"
                    value={formData.fileType}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="fileSize">File Size</Label>
                  <Input
                    id="fileSize"
                    value={formData.fileSize}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <Label htmlFor="lastModified">Last Modified</Label>
                  <Input
                    id="lastModified"
                    value={new Date(selectedFile.lastModified).toLocaleString()}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button onClick={handleUpload} className="bg-[#8B4513] hover:bg-[#A0522D] text-white">
                  Upload File
                </Button>
                <Button variant="outline" onClick={handleFileRemove}>
                  Remove File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Result */}
        {uploadedFileUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Upload Result</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-800">File uploaded successfully!</span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  File URL: <code className="bg-green-100 px-2 py-1 rounded">{uploadedFileUrl}</code>
                </p>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(uploadedFileUrl, '_blank')}
                >
                  View File
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(uploadedFileUrl)
                    toast({
                      title: "URL Copied",
                      description: "File URL copied to clipboard",
                    })
                  }}
                >
                  Copy URL
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supported File Types Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Supported File Types</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Digital Books & Documents</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• PDF (.pdf) - Portable Document Format</li>
                  <li>• DOCX (.docx) - Microsoft Word Document</li>
                  <li>• DOC (.doc) - Legacy Word Document</li>
                  <li>• EPUB (.epub) - Electronic Publication</li>
                  <li>• TXT (.txt) - Plain Text File</li>
                  <li>• RTF (.rtf) - Rich Text Format</li>
                  <li>• ODT (.odt) - OpenDocument Text</li>
                  <li>• Pages (.pages) - Apple Pages Document</li>
                  <li>• MOBI (.mobi) - Mobipocket eBook</li>
                  <li>• AZW3 (.azw3) - Kindle Format</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Media Files</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Images: JPG, PNG, GIF, WebP</li>
                  <li>• Videos: MP4, MOV, WebM</li>
                  <li>• Profile Pictures: JPG, PNG, GIF</li>
                  <li>• News Images: JPG, PNG, GIF</li>
                </ul>
                
                <h4 className="font-medium text-gray-900 mb-3 mt-6">File Size Limits</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Digital Books: Up to 100MB</li>
                  <li>• Documents: Up to 50MB</li>
                  <li>• Gallery: Up to 10MB</li>
                  <li>• Profile/News: Up to 5MB</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
