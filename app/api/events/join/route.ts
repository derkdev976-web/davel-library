import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Only allow MEMBER, ADMIN, and LIBRARIAN roles to join events
    if (session.user.role === "GUEST") {
      return NextResponse.json({ error: "Membership required to join events" }, { status: 403 })
    }

    const body = await request.json()
    const { eventId } = body

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    // Check if event exists and is published
    const event = await prisma.newsEvent.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (!event.isPublished) {
      return NextResponse.json({ error: "Event is not published" }, { status: 400 })
    }

    if (event.type !== "EVENT") {
      return NextResponse.json({ error: "This is not an event" }, { status: 400 })
    }

    // Check if user is already registered for this event
    const existingRegistration = await prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: {
          eventId: eventId,
          userId: session.user.id
        }
      }
    })

    if (existingRegistration) {
      return NextResponse.json({ error: "Already registered for this event" }, { status: 400 })
    }

    // Check if event is full
    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 })
    }

    // Create event registration
    const registration = await prisma.eventAttendee.create({
      data: {
        eventId: eventId,
        userId: session.user.id,
        status: "REGISTERED"
      }
    })

    // Update event attendee count
    await prisma.newsEvent.update({
      where: { id: eventId },
      data: {
        currentAttendees: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      message: "Successfully registered for event",
      registration: {
        id: registration.id,
        eventId: registration.eventId,
        userId: registration.userId,
        status: registration.status,
        registeredAt: registration.createdAt
      }
    })

  } catch (error) {
    console.error("Error joining event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get user's event registrations
    const registrations = await prisma.eventAttendee.findMany({
      where: { userId: session.user.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            type: true,
            eventDate: true,
            location: true,
            isPublished: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      registrations: registrations.map(reg => ({
        id: reg.id,
        eventId: reg.eventId,
        status: reg.status,
        registeredAt: reg.createdAt,
        event: reg.event
      }))
    })

  } catch (error) {
    console.error("Error fetching event registrations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


