import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { duration } = await request.json()
    
    // Mock response for development
    return NextResponse.json({ 
      success: true, 
      message: `User ${params.id} promoted to temporary admin for ${duration} hours` 
    })
  } catch (error) {
    console.error("Error promoting user:", error)
    return NextResponse.json({ error: "Failed to promote user" }, { status: 500 })
  }
}
