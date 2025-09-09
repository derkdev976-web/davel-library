import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch real news events from database
    const newsEvents = await prisma.newsEvent.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the data for the frontend
    const formattedNewsEvents = newsEvents.map(event => ({
      id: event.id,
      title: event.title,
      type: event.type,
      isPublished: event.isPublished,
      visibility: event.visibility,
      eventDate: event.eventDate?.toISOString() || null,
      createdAt: event.createdAt.toISOString()
    }))

    return NextResponse.json(formattedNewsEvents)
  } catch (error) {
    console.error("Error fetching news events:", error)
    return NextResponse.json({ error: "Failed to fetch news events" }, { status: 500 })
  }
}


