"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { DigitalFileUpload } from "@/components/ui/digital-file-upload"
import { FileUpload } from "@/components/ui/file-upload"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle } from "lucide-react"
import Image from 'next/image'

export default function UploadTestPage() {
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    digitalFile: "",
    coverImage: ""
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!bookData.title || !bookData.author) {
      toast({
        title: "Validation Error",
        description: "Title and Author are required",
        variant: "destructive"
      })
      return
    }

    if (!bookData.digitalFile) {
      toast({
        title: "Validation Error",
        description: "Digital file is required",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Success",
      description: "Book data ready for submission",
    })

    console.log("Book data:", bookData)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Ebook Upload Test</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Book Title *</Label>
                <Input
                  id="title"
                  value={bookData.title}
                  onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={bookData.author}
                  onChange={(e) => setBookData({ ...bookData, author: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Digital Book File *</Label>
              <DigitalFileUpload
                onFileSelect={async (file) => {
                  try {
                    const uploadFormData = new FormData()
                    uploadFormData.append('file', file)
                    uploadFormData.append('type', 'digital')
                    
                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: uploadFormData
                    })
                    
                    if (response.ok) {
                      const result = await response.json()
                      setBookData({ ...bookData, digitalFile: result.url })
                      toast({
                        title: "Success",
                        description: "Digital file uploaded successfully",
                      })
                    } else {
                      const errorData = await response.json()
                      toast({
                        title: "Upload Failed",
                        description: errorData.error || "Failed to upload digital file",
                        variant: "destructive"
                      })
                    }
                  } catch (error) {
                    console.error('Upload error:', error)
                    toast({
                      title: "Upload Error",
                      description: "Failed to upload digital file",
                      variant: "destructive"
                    })
                  }
                }}
                onFileRemove={() => {
                  setBookData({ ...bookData, digitalFile: "" })
                }}
                selectedFile={null}
                uploadedFileUrl={bookData.digitalFile}
              />
              
              {bookData.digitalFile && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">Digital file uploaded successfully</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">{bookData.digitalFile}</p>
                </div>
              )}
            </div>

            <div>
              <Label>Cover Page (Optional)</Label>
              <FileUpload
                onFileSelect={async (file) => {
                  try {
                    const uploadFormData = new FormData()
                    uploadFormData.append('file', file)
                    uploadFormData.append('type', 'gallery')
                    
                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: uploadFormData
                    })
                    
                    if (response.ok) {
                      const result = await response.json()
                      setBookData({ ...bookData, coverImage: result.url })
                      toast({
                        title: "Success",
                        description: "Cover image uploaded successfully",
                      })
                    } else {
                      const errorData = await response.json()
                      toast({
                        title: "Upload Failed",
                        description: errorData.error || "Failed to upload cover image",
                        variant: "destructive"
                      })
                    }
                  } catch (error) {
                    console.error('Upload error:', error)
                    toast({
                      title: "Upload Error",
                      description: "Failed to upload cover image",
                      variant: "destructive"
                    })
                  }
                }}
                onFileRemove={() => {
                  setBookData({ ...bookData, coverImage: "" })
                }}
                type="gallery"
              />
              
              {bookData.coverImage && (
                <div className="mt-2">
                  <Image src={bookData.coverImage} alt="Book cover preview" width={128} height={128} className="object-cover rounded-lg border" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="submit" className="bg-[#8B4513] hover:bg-[#A0522D] text-white">
                Test Upload
              </Button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Current Book Data:</h3>
            <pre className="text-sm text-gray-600 overflow-auto">
              {JSON.stringify(bookData, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
