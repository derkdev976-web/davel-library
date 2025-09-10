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
    const { status } = await request.json()

    // Check if user can update this print job
    const existingJob = await prisma.printJob.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Print job not found" }, { status: 404 })
    }

    // Only admin/librarian can update status, or user can update their own job
    if (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN" && existingJob.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updateData: any = { status }
    
    if (status === "COMPLETED") {
      updateData.completedAt = new Date()
    }

    const updatedJob = await prisma.printJob.update({
      where: { id },
      data: updateData,
      include: {
        service: true,
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
      printJob: updatedJob
    })

  } catch (error) {
    console.error("Error updating print job:", error)
    return NextResponse.json(
      { error: "Failed to update print job" },
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

    // Check if user can delete this print job
    const existingJob = await prisma.printJob.findUnique({
      where: { id }
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Print job not found" }, { status: 404 })
    }

    // Only admin/librarian can delete, or user can delete their own job
    if (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN" && existingJob.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if job can be cancelled
    if (existingJob.status === "COMPLETED") {
      return NextResponse.json({ 
        error: "Cannot cancel completed print job" 
      }, { status: 400 })
    }

    if (existingJob.status === "PROCESSING") {
      return NextResponse.json({ 
        error: "Cannot cancel print job that is being processed" 
      }, { status: 400 })
    }

    await prisma.printJob.update({
      where: { id },
      data: { status: "CANCELLED" }
    })

    return NextResponse.json({
      success: true,
      message: "Print job cancelled successfully"
    })

  } catch (error) {
    console.error("Error cancelling print job:", error)
    return NextResponse.json(
      { error: "Failed to cancel print job" },
      { status: 500 }
    )
  }
}
