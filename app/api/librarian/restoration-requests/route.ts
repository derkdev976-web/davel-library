import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getRandomRestorationCost } from "@/lib/currency-utils"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "LIBRARIAN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // For now, return mock data since we don't have a RestorationRequest model yet
    const mockRequests = [
      {
        id: "1",
        userId: "user1",
        userName: "Sarah Wilson",
        userEmail: "sarah@example.com",
        bookTitle: "The Great Gatsby",
        bookAuthor: "F. Scott Fitzgerald",
        bookIsbn: "978-0-7432-7356-5",
        damageType: "Water Damage",
        damageDescription: "Pages are wrinkled and stained from water exposure",
        urgency: "HIGH",
        estimatedCost: getRandomRestorationCost(),
        status: "PENDING",
        requestedAt: new Date().toISOString(),
        notes: "Family heirloom book, needs careful restoration"
      },
      {
        id: "2",
        userId: "user2",
        userName: "David Brown",
        userEmail: "david@example.com",
        bookTitle: "Pride and Prejudice",
        bookAuthor: "Jane Austen",
        bookIsbn: "978-0-14-143951-8",
        damageType: "Spine Damage",
        damageDescription: "Spine is broken and pages are loose",
        urgency: "MEDIUM",
        estimatedCost: getRandomRestorationCost(),
        status: "ASSESSED",
        requestedAt: new Date(Date.now() - 86400000).toISOString(),
        notes: "Antique edition from 1890s"
      },
      {
        id: "3",
        userId: "user3",
        userName: "Emily Davis",
        userEmail: "emily@example.com",
        bookTitle: "To Kill a Mockingbird",
        bookAuthor: "Harper Lee",
        bookIsbn: "978-0-06-112008-4",
        damageType: "Page Tears",
        damageDescription: "Several pages have tears and need repair",
        urgency: "LOW",
        estimatedCost: getRandomRestorationCost(),
        status: "IN_PROGRESS",
        requestedAt: new Date(Date.now() - 172800000).toISOString(),
        notes: "School library book, needs quick turnaround"
      }
    ]

    return NextResponse.json({ requests: mockRequests })
  } catch (error) {
    console.error("Error fetching restoration requests:", error)
    return NextResponse.json({ error: "Failed to fetch restoration requests" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "LIBRARIAN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { userId, bookTitle, bookAuthor, damageType, damageDescription, estimatedCost, notes } = body

    // Validate required fields
    if (!userId || !bookTitle || !bookAuthor || !damageType || !damageDescription) {
      return NextResponse.json({ 
        error: "User ID, book title, book author, damage type, and damage description are required" 
      }, { status: 400 })
    }

    // For now, return a mock response since we don't have a database model
    const mockRequest = {
      id: Date.now().toString(),
      userId,
      userName: "Mock User",
      userEmail: "user@example.com",
      bookTitle,
      bookAuthor,
      damageType,
      damageDescription,
      estimatedCost: estimatedCost || 0,
      status: "PENDING",
      requestedAt: new Date().toISOString(),
      notes
    }

    return NextResponse.json({ 
      message: "Restoration request created successfully",
      request: mockRequest
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating restoration request:", error)
    return NextResponse.json({ 
      error: "Failed to create restoration request" 
    }, { status: 500 })
  }
}
