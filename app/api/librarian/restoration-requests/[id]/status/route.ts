import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "LIBRARIAN" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { status } = await req.json()
    const requestId = params.id

    // Validate status
    const validStatuses = ["PENDING", "ASSESSED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: "Invalid status. Must be one of: PENDING, ASSESSED, IN_PROGRESS, COMPLETED, CANCELLED" 
      }, { status: 400 })
    }

    // For now, return a mock response since we don't have a database model
    const mockUpdatedRequest = {
      id: requestId,
      status,
      updatedAt: new Date().toISOString(),
      message: `Restoration request status updated to ${status}`
    }

    return NextResponse.json({ 
      request: mockUpdatedRequest,
      message: "Restoration request status updated successfully" 
    })
  } catch (error) {
    console.error("Error updating restoration request status:", error)
    return NextResponse.json({ 
      error: "Failed to update restoration request status" 
    }, { status: 500 })
  }
}
