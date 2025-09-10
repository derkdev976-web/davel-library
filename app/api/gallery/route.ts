import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch GALLERY content from database
    const contentItems = await prisma.content.findMany({
      where: { type: "GALLERY", isPublished: true },
      orderBy: { createdAt: 'desc' }
    })

    // Transform content to gallery format
    const items = contentItems.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl || "/images/catalog/placeholder.svg",
      createdAt: item.createdAt,
      category: item.category || "General",
      tags: item.tags ? JSON.parse(item.tags) : []
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching gallery:", error)
    return NextResponse.json({ items: [] })
  }
}


