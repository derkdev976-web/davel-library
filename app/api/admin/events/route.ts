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
    const events = await prisma.newsEvent.findMany({
      where: { type: "EVENT" },
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
      },
      orderBy: { eventDate: 'desc' }
    })

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      content: event.content,
      type: event.type,
      image: event.image,
      isPublished: event.isPublished,
      publishedAt: event.publishedAt,
      eventDate: event.eventDate,
      location: event.location,
      maxAttendees: event.maxAttendees,
      currentAttendees: event.currentAttendees,
      visibility: event.visibility,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      attendees: event.attendees.map(attendee => ({
        id: attendee.id,
        userId: attendee.userId,
        status: attendee.status,
        registeredAt: attendee.createdAt,
        user: {
          id: attendee.user.id,
          name: attendee.user.name || 
                `${attendee.user.profile?.firstName || ''} ${attendee.user.profile?.lastName || ''}`.trim() || 
                attendee.user.email,
          email: attendee.user.email,
          role: attendee.user.role
        }
      }))
    }))

    return NextResponse.json(formattedEvents)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const event = await prisma.newsEvent.create({
      data: {
        title,
        content,
        type: "EVENT",
        eventDate: new Date(eventDate),
        location,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        currentAttendees: 0,
        visibility: visibility || "PUBLIC",
        isPublished: false
      }
    })

    return NextResponse.json({
      message: "Event created successfully",
      event
    })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
