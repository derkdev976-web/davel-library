import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getRandomPrintingCost } from "@/lib/currency-utils"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "LIBRARIAN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // For now, return mock data since we don't have a PrintingRequest model yet
    const mockRequests = [
      {
        id: "1",
        userId: "user1",
        userName: "John Doe",
        userEmail: "john@example.com",
        documentName: "Research Paper",
        pages: 15,
        copies: 2,
        paperSize: "A4",
        color: false,
        status: "PENDING",
        priority: "MEDIUM",
        requestedAt: new Date().toISOString(),
        notes: "Please print double-sided"
      },
      {
        id: "2",
        userId: "user2",
        userName: "Jane Smith",
        userEmail: "jane@example.com",
        documentName: "Presentation Slides",
        pages: 8,
        copies: 1,
        paperSize: "A4",
        color: true,
        status: "IN_PROGRESS",
        priority: "HIGH",
        requestedAt: new Date(Date.now() - 3600000).toISOString(),
        notes: "Color printing needed"
      },
      {
        id: "3",
        userId: "user3",
        userName: "Mike Johnson",
        userEmail: "mike@example.com",
        documentName: "Resume",
        pages: 2,
        copies: 5,
        paperSize: "Letter",
        color: false,
        status: "COMPLETED",
        priority: "URGENT",
        requestedAt: new Date(Date.now() - 7200000).toISOString(),
        completedAt: new Date(Date.now() - 3600000).toISOString(),
        notes: "High quality paper needed",
        cost: getRandomPrintingCost()
      }
    ]

    return NextResponse.json({ requests: mockRequests })
  } catch (error) {
    console.error("Error fetching printing requests:", error)
    return NextResponse.json({ error: "Failed to fetch printing requests" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "LIBRARIAN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { userId, documentName, pages, copies, paperSize, color, priority, notes } = body

    // Validate required fields
    if (!userId || !documentName || !pages || !copies) {
      return NextResponse.json({ 
        error: "User ID, document name, pages, and copies are required" 
      }, { status: 400 })
    }

    // For now, return a mock response since we don't have a database model
    const mockRequest = {
      id: Date.now().toString(),
      userId,
      userName: "Mock User",
      userEmail: "user@example.com",
      documentName,
      pages,
      copies,
      paperSize: paperSize || "A4",
      color: color || false,
      status: "PENDING",
      priority: priority || "MEDIUM",
      requestedAt: new Date().toISOString(),
      notes
    }

    return NextResponse.json({ 
      message: "Printing request created successfully",
      request: mockRequest
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating printing request:", error)
    return NextResponse.json({ 
      error: "Failed to create printing request" 
    }, { status: 500 })
  }
}
