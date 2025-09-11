import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const printJobId = params.id
    const body = await request.json()
    const { status } = body

    // Check if user can modify this print job
    const existingPrintJob = await prisma.printJob.findUnique({
      where: { id: printJobId },
      include: { user: true }
    })

    if (!existingPrintJob) {
      return NextResponse.json({ error: "Print job not found" }, { status: 404 })
    }

    // Only admin/librarian can update print job status
    if (session.user.role === "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updatedPrintJob = await prisma.printJob.update({
      where: { id: printJobId },
      data: { 
        status,
        ...(status === "COMPLETED" && { completedAt: new Date() })
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        service: {
          select: { id: true, name: true, description: true }
        }
      }
    })

    return NextResponse.json({
      message: "Print job updated successfully",
      printJob: updatedPrintJob
    })
  } catch (error) {
    console.error("Error updating print job:", error)
    return NextResponse.json({ error: "Failed to update print job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const printJobId = params.id

    // Check if user can delete this print job
    const existingPrintJob = await prisma.printJob.findUnique({
      where: { id: printJobId },
      include: { user: true }
    })

    if (!existingPrintJob) {
      return NextResponse.json({ error: "Print job not found" }, { status: 404 })
    }

    // Only admin/librarian can delete print jobs
    if (session.user.role === "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.printJob.delete({
      where: { id: printJobId }
    })

    return NextResponse.json({
      message: "Print job deleted successfully"
    })
  } catch (error) {
    console.error("Error deleting print job:", error)
    return NextResponse.json({ error: "Failed to delete print job" }, { status: 500 })
  }
}