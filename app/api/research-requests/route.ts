import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")

    // Build where clause
    const where: any = {}
    
    // If user is not admin/librarian, only show their own requests
    if (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN") {
      where.userId = session.user.id
    }
    
    if (status) {
      where.status = status
    }
    
    if (category) {
      where.category = category
    }

    const requests = await prisma.researchRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        librarian: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(requests)

  } catch (error) {
    console.error("Error fetching research requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch research requests" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { title, description, category, priority } = await request.json()

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }

    const researchRequest = await prisma.researchRequest.create({
      data: {
        userId: session.user.id,
        title,
        description,
        category: category || "GENERAL",
        priority: priority || "MEDIUM",
        status: "OPEN"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      request: researchRequest
    })

  } catch (error) {
    console.error("Error creating research request:", error)
    return NextResponse.json(
      { error: "Failed to create research request" },
      { status: 500 }
    )
  }
}
