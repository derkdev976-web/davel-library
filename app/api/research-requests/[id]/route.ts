import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = params
    const { status, resolution, assignedTo } = await request.json()

    // Check if user can update this request
    const existingRequest = await prisma.researchRequest.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Only admin/librarian can update status, or user can update their own request
    if (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN" && existingRequest.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      if (status === "RESOLVED" || status === "CLOSED") {
        updateData.resolvedAt = new Date()
      }
    }
    
    if (resolution) {
      updateData.resolution = resolution
    }
    
    if (assignedTo) {
      updateData.assignedTo = assignedTo
    }

    const updatedRequest = await prisma.researchRequest.update({
      where: { id },
      data: updateData,
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
      }
    })

    return NextResponse.json({
      success: true,
      request: updatedRequest
    })

  } catch (error) {
    console.error("Error updating research request:", error)
    return NextResponse.json(
      { error: "Failed to update research request" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = params

    // Check if user can delete this request
    const existingRequest = await prisma.researchRequest.findUnique({
      where: { id }
    })

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Only admin/librarian can delete, or user can delete their own request
    if (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN" && existingRequest.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.researchRequest.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Research request deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting research request:", error)
    return NextResponse.json(
      { error: "Failed to delete research request" },
      { status: 500 }
    )
  }
}
