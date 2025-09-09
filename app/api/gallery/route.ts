import { NextResponse } from "next/server"
import { getContent } from "@/lib/server-storage"

export async function GET() {
  try {
    // Fetch GALLERY content directly from server storage
    const contentItems = await getContent({ type: "GALLERY", published: true })
    
    // Transform content to gallery format
    const items = contentItems.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl || "/images/catalog/placeholder.svg",
      createdAt: item.createdAt,
      category: item.category || "General",
      tags: item.tags || []
    }))
    
    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching gallery:", error)
    return NextResponse.json({ items: [] })
  }
}


