import { NextResponse } from "next/server"
import { getContent } from "@/lib/server-storage"

export async function GET() {
  try {
    // Fetch NEWS and EVENT content directly from server storage
    const newsItems = await getContent({ type: "NEWS", published: true })
    const eventItems = await getContent({ type: "EVENT", published: true })
    
    // Combine and transform content
    const allItems = [...newsItems, ...eventItems].map((item: any) => ({
      id: item.id,
      title: item.title,
      date: item.eventDate || item.createdAt,
      imageUrl: item.imageUrl || "/images/catalog/placeholder.svg",
      content: item.content,
      type: item.type,
      description: item.description,
      category: item.category,
      featured: item.isFeatured,
      tags: item.tags || [],
      location: item.location || "",
      attendees: item.attendees || 0,
      maxAttendees: item.maxAttendees || 0
    }))
    
    // Sort by date (newest first)
    allItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return NextResponse.json({ 
      items: allItems, 
      page: 1, 
      total: allItems.length, 
      pageCount: 1 
    })
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ 
      items: [], 
      page: 1, 
      total: 0, 
      pageCount: 1 
    })
  }
}


