import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getRandomClassCost } from "@/lib/currency-utils"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "LIBRARIAN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // For now, return mock data since we don't have an AfternoonClass model yet
    const mockClasses = [
      {
        id: "1",
        title: "Basic Computer Skills for Seniors",
        description: "Learn essential computer skills including email, internet browsing, and basic word processing",
        instructorId: "instructor1",
        instructorName: "Mrs. Rodriguez",
        category: "COMPUTER",
        status: "ONGOING",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        duration: 90,
        maxStudents: 12,
        currentStudents: 8,
        schedule: "Tuesdays and Thursdays, 2:00 PM - 3:30 PM",
        location: "Computer Lab",
        students: ["student1", "student2", "student3"],
        materials: "Laptops provided, bring notebook",
        cost: getRandomClassCost(),
        createdAt: new Date().toISOString()
      },
      {
        id: "2",
        title: "Creative Writing Workshop",
        description: "Explore your creativity through various writing exercises and techniques",
        instructorId: "instructor2",
        instructorName: "Mr. Thompson",
        category: "OTHER",
        status: "ONGOING",
        scheduledAt: new Date(Date.now() + 172800000).toISOString(),
        duration: 90,
        maxStudents: 15,
        currentStudents: 12,
        schedule: "Wednesdays, 3:00 PM - 4:30 PM",
        location: "Conference Room A",
        students: ["student4", "student5", "student6"],
        materials: "Bring your own notebook and pen",
        cost: 25.00,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "3",
        title: "Spanish Conversation Club",
        description: "Practice Spanish conversation in a friendly, supportive environment",
        instructorId: "instructor3",
        instructorName: "Ms. Garcia",
        category: "LANGUAGE",
        status: "ONGOING",
        scheduledAt: new Date(Date.now() - 86400000).toISOString(),
        duration: 60,
        maxStudents: 20,
        currentStudents: 18,
        schedule: "Fridays, 2:00 PM - 3:00 PM",
        location: "Community Room",
        students: ["student7", "student8", "student9"],
        materials: "Basic Spanish knowledge helpful but not required",
        cost: 0,
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: "4",
        title: "Art and Craft Workshop",
        description: "Create beautiful handmade crafts using various materials and techniques",
        instructorId: "instructor4",
        instructorName: "Mrs. Chen",
        category: "CRAFTS",
        maxStudents: 10,
        currentStudents: 6,
        startDate: new Date(Date.now() + 259200000).toISOString(),
        endDate: new Date(Date.now() + 5184000000).toISOString(),
        schedule: "Saturdays, 1:00 PM - 3:00 PM",
        location: "Art Studio",
        status: "SCHEDULED",
        students: ["student10", "student11"],
        materials: "Basic supplies provided, additional materials may be needed",
        cost: getRandomClassCost(),
        createdAt: new Date().toISOString()
      }
    ]

    return NextResponse.json({ classes: mockClasses })
  } catch (error) {
    console.error("Error fetching afternoon classes:", error)
    return NextResponse.json({ error: "Failed to fetch afternoon classes" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "LIBRARIAN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, description, category, maxStudents, startDate, endDate, schedule, location, materials, cost } = body

    // Validate required fields
    if (!title || !description || !category || !maxStudents || !startDate || !endDate || !schedule || !location) {
      return NextResponse.json({ 
        error: "Title, description, category, max students, start date, end date, schedule, and location are required" 
      }, { status: 400 })
    }

    // For now, return a mock response since we don't have a database model
    const mockClass = {
      id: Date.now().toString(),
      title,
      description,
      instructorId: session.user.id,
      instructorName: session.user.name || "Librarian",
      category,
      maxStudents,
      currentStudents: 0,
      startDate,
      endDate,
      schedule,
      location,
      status: "SCHEDULED",
      students: [],
      materials: materials || "",
      cost: cost || 0,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({ 
      message: "Afternoon class created successfully",
      class: mockClass
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating afternoon class:", error)
    return NextResponse.json({ 
      error: "Failed to create afternoon class" 
    }, { status: 500 })
  }
}
