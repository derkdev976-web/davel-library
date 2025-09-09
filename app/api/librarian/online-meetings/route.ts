import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "LIBRARIAN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // For now, return mock data since we don't have an OnlineMeeting model yet
    const mockMeetings = [
      {
        id: "1",
        title: "Book Club Discussion: The Midnight Library",
        description: "Join us for a lively discussion about Matt Haig's The Midnight Library",
        hostId: "librarian1",
        hostName: "Ms. Johnson",
        meetingType: "STUDY_GROUP",
        status: "SCHEDULED",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        duration: 90,
        maxParticipants: 15,
        currentParticipants: 8,
        meetingLink: "https://meet.google.com/abc-defg-hij",
        participants: ["user1", "user2", "user3"],
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        title: "Study Group: Advanced Mathematics",
        description: "Weekly study session for advanced mathematics students",
        hostId: "librarian2",
        hostName: "Mr. Smith",
        meetingType: "STUDY_GROUP",
        status: "SCHEDULED",
        scheduledAt: new Date(Date.now() + 172800000).toISOString(),
        duration: 120,
        maxParticipants: 10,
        currentParticipants: 6,
        meetingLink: "https://zoom.us/j/123456789",
        participants: ["user4", "user5", "user6"],
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "3",
        title: "Writing Workshop: Creative Fiction",
        description: "Learn the art of creative fiction writing with professional tips",
        hostId: "librarian1",
        hostName: "Ms. Johnson",
        meetingType: "TUTORIAL",
        status: "ONGOING",
        scheduledAt: new Date(Date.now() - 3600000).toISOString(),
        duration: 90,
        maxParticipants: 20,
        currentParticipants: 15,
        meetingLink: "https://meet.google.com/xyz-uvw-rst",
        participants: ["user7", "user8", "user9"],
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ]

    return NextResponse.json({ meetings: mockMeetings })
  } catch (error) {
    console.error("Error fetching online meetings:", error)
    return NextResponse.json({ error: "Failed to fetch online meetings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "LIBRARIAN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, description, meetingType, maxParticipants, startTime, endTime, meetingLink } = body

    // Validate required fields
    if (!title || !description || !meetingType || !maxParticipants || !startTime || !endTime) {
      return NextResponse.json({ 
        error: "Title, description, meeting type, max participants, start time, and end time are required" 
      }, { status: 400 })
    }

    // For now, return a mock response since we don't have a database model
    const mockMeeting = {
      id: Date.now().toString(),
      title,
      description,
      hostId: session.user.id,
      hostName: session.user.name || "Librarian",
      meetingType,
      maxParticipants,
      currentParticipants: 0,
      startTime,
      endTime,
      status: "SCHEDULED",
      meetingLink: meetingLink || "",
      participants: [],
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ 
      message: "Online meeting created successfully",
      meeting: mockMeeting
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating online meeting:", error)
    return NextResponse.json({ 
      error: "Failed to create online meeting" 
    }, { status: 500 })
  }
}
