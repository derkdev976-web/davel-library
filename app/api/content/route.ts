import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const published = searchParams.get("published") === "true"
    const featured = searchParams.get("featured") === "true"

    const where: any = {}
    if (type) where.type = type
    if (published) where.isPublished = true
    if (featured) where.isFeatured = true

    const items = await prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      items,
      total: items.length
    })
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const newContent = await prisma.content.create({
      data: body
    })

    return NextResponse.json({
      message: "Content added successfully",
      content: newContent
    }, { status: 201 })
  } catch (error) {
    console.error("Error adding content:", error)
    return NextResponse.json({ 
      error: "Failed to add content", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }

    const updatedContent = await prisma.content.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      message: "Content updated successfully",
      content: updatedContent
    })
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Content ID is required" }, { status: 400 })
    }

    const deletedContent = await prisma.content.delete({
      where: { id }
    })

    return NextResponse.json({
      message: "Content deleted successfully",
      content: deletedContent
    })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 })
  }
}
