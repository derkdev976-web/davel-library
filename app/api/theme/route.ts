import { NextResponse } from "next/server"
import { getGlobalTheme } from "@/lib/server-storage"

export async function GET() {
  try {
    const theme = await getGlobalTheme()
    return NextResponse.json({ theme })
  } catch (error) {
    console.error("Error fetching global theme:", error)
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 })
  }
}
