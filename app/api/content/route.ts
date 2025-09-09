import { NextRequest, NextResponse } from "next/server"
import { getContent, addContent, updateContent, deleteContent } from "@/lib/server-storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const published = searchParams.get("published") === "true"
    const featured = searchParams.get("featured") === "true"

    const filters: any = {}
    if (type) filters.type = type
    if (published) filters.published = published
    if (featured) filters.featured = featured

    const items = await getContent(filters)
    
    return NextResponse.json({ 
      items, 
      total: items.length 
    })
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newContent = await addContent(body)
    
    return NextResponse.json({ 
      message: "Content added successfully", 
      content: newContent 
    }, { status: 201 })
  } catch (error) {
    console.error("Error adding content:", error)
    return NextResponse.json({ error: "Failed to add content" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }
    
    const updatedContent = await updateContent(id, updateData)
    
    if (!updatedContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: "Content updated successfully", 
      content: updatedContent 
    })
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }
    
    const deletedContent = await deleteContent(id)
    
    if (!deletedContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }
    
    return NextResponse.json({ 
      message: "Content deleted successfully", 
      content: deletedContent 
    })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 })
  }
}
