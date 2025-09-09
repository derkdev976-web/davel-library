import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const event = await prisma.newsEvent.findUnique({
      where: { id: params.id },
      include: {
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, content, eventDate, location, maxAttendees, visibility } = body

    if (!title || !content || !eventDate) {
      return NextResponse.json({ error: "Title, content, and event date are required" }, { status: 400 })
    }

    const event = await prisma.newsEvent.update({
      where: { id: params.id },
      data: {
        title,
        content,
        eventDate: new Date(eventDate),
        location,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        visibility: visibility || "PUBLIC"
      }
    })

    return NextResponse.json({
      message: "Event updated successfully",
      event
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { isPublished } = body

    const event = await prisma.newsEvent.update({
      where: { id: params.id },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null
      }
    })

    return NextResponse.json({
      message: isPublished ? "Event published successfully" : "Event unpublished successfully",
      event
    })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Delete event attendees first
    await prisma.eventAttendee.deleteMany({
      where: { eventId: params.id }
    })

    // Delete the event
    await prisma.newsEvent.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: "Event deleted successfully"
    })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
