import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supportRequests = await prisma.supportRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    const formattedRequests = supportRequests.map(request => ({
      id: request.id,
      title: request.title,
      category: request.category,
      status: request.status,
      priority: request.priority,
      createdAt: request.createdAt.toISOString(),
      description: request.description,
      resolution: request.resolution,
      resolvedAt: request.resolvedAt?.toISOString()
    }))

    return NextResponse.json(formattedRequests)
  } catch (error) {
    console.error("Error fetching member support requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch support requests" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, category } = await request.json()

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description, and category are required" }, { status: 400 })
    }

    const supportRequest = await prisma.supportRequest.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        description: description.trim(),
        category: category,
        priority: "MEDIUM",
        status: "OPEN"
      }
    })

    return NextResponse.json({
      id: supportRequest.id,
      title: supportRequest.title,
      category: supportRequest.category,
      status: supportRequest.status,
      priority: supportRequest.priority,
      createdAt: supportRequest.createdAt.toISOString(),
      description: supportRequest.description
    })
  } catch (error) {
    console.error("Error creating support request:", error)
    return NextResponse.json(
      { error: "Failed to create support request" },
      { status: 500 }
    )
  }
}
