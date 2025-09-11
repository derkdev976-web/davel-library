import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Try to query the Content table
    const content = await prisma.content.findMany({
      take: 1
    })
    
    return NextResponse.json({ 
      success: true, 
      message: "Content table exists and is accessible",
      count: content.length
    })
  } catch (error) {
    console.error("Content table test error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      details: "The Content table may not exist in the database"
    }, { status: 500 })
  }
}
