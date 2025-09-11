import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getGlobalTheme, setGlobalTheme } from "@/lib/server-storage"

export async function GET() {
  try {
    const theme = await getGlobalTheme()
    return NextResponse.json({ theme })
  } catch (error) {
    console.error("Error fetching global theme:", error)
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const updatedTheme = await setGlobalTheme(body)
    
    return NextResponse.json({ 
      message: "Theme updated successfully",
      theme: updatedTheme 
    })
  } catch (error) {
    console.error("Error updating global theme:", error)
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 })
  }
}