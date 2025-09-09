import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { visibility } = await request.json()
    
    // Mock response for development
    return NextResponse.json({ 
      success: true, 
      message: `${params.type} visibility updated to ${visibility}` 
    })
  } catch (error) {
    console.error("Error updating content visibility:", error)
    return NextResponse.json({ error: "Failed to update visibility" }, { status: 500 })
  }
}
