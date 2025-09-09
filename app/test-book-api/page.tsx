"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestBookAPI() {
  const [testBook, setTestBook] = useState({
    title: "Test Book",
    author: "Test Author",
    description: "A test book for debugging",
    isbn: "1234567890",
    isElectronic: false,
    isDigital: false,
    visibility: "PUBLIC",
    totalCopies: 1,
    availableCopies: 1,
    category: "Test",
    publishedYear: 2024,
    coverImage: "",
    deweyDecimal: "000",
    
    digitalFileUrl: ""
  })

  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAddBook = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testBook),
      })

      const data = await response.json()
      setResult({
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testGetBooks = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/books')
      const data = await response.json()
      setResult({
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Book API Test</h1>
          <p className="text-gray-600">Test the book API functionality</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Book Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={testBook.title}
                  onChange={(e) => setTestBook({ ...testBook, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={testBook.author}
                  onChange={(e) => setTestBook({ ...testBook, author: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={testBook.description}
                onChange={(e) => setTestBook({ ...testBook, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={testBook.isbn}
                  onChange={(e) => setTestBook({ ...testBook, isbn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={testBook.category}
                  onChange={(e) => setTestBook({ ...testBook, category: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-4">
          <Button 
            onClick={testAddBook} 
            disabled={loading}
            className="bg-[#8B4513] hover:bg-[#A0522D] text-white"
          >
            {loading ? "Testing..." : "Test Add Book"}
          </Button>
          <Button 
            onClick={testGetBooks} 
            disabled={loading}
            variant="outline"
          >
            {loading ? "Testing..." : "Test Get Books"}
          </Button>
        </div>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
