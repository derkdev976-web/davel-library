import { NextRequest, NextResponse } from "next/server"
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
    const body = await request.json()
    const { theme } = body
    
    if (!theme) {
      return NextResponse.json({ error: "Theme data is required" }, { status: 400 })
    }
    
    const updatedTheme = await setGlobalTheme(theme)
    
    return NextResponse.json({ 
      message: "Global theme updated successfully", 
      theme: updatedTheme 
    })
  } catch (error) {
    console.error("Error updating global theme:", error)
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 })
  }
}
