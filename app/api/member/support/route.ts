import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get member's support requests
    const supportRequests = await prisma.supportRequest.findMany({
      where: { userId },
      include: {
        responses: {
          include: {
            responder: {
              select: {
                name: true,
                role: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format the data
    const formattedRequests = supportRequests.map(request => ({
      id: request.id,
      subject: request.title,
      description: request.description,
      category: request.category,
      priority: request.priority,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      responses: request.responses.map(response => ({
        id: response.id,
        content: response.content,
        responderName: response.responder.name || 'Support Team',
        responderRole: response.responder.role,
        createdAt: response.createdAt.toISOString()
      }))
    }))

    return NextResponse.json({ supportRequests: formattedRequests })

  } catch (error) {
    console.error("Error fetching support requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch support requests" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { subject, description, category, priority } = await request.json()

    if (!subject || !description || !category) {
      return NextResponse.json(
        { error: "Subject, description, and category are required" },
        { status: 400 }
      )
    }

    // Create support request
    const supportRequest = await prisma.supportRequest.create({
      data: {
        userId,
        subject,
        description,
        category,
        priority: priority || 'MEDIUM',
        status: 'OPEN'
      }
    })

    return NextResponse.json({
      success: true,
      supportRequest: {
        id: supportRequest.id,
        subject: supportRequest.subject,
        description: supportRequest.description,
        category: supportRequest.category,
        priority: supportRequest.priority,
        status: supportRequest.status,
        createdAt: supportRequest.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error("Error creating support request:", error)
    return NextResponse.json(
      { error: "Failed to create support request" },
      { status: 500 }
    )
  }
}