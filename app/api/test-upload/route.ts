import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET() {
  try {
    // Test if we can create the uploads directory
    const uploadsDir = join(process.cwd(), "public", "uploads", "test")
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Test if we can write a file
    const testFile = join(uploadsDir, "test.txt")
    await writeFile(testFile, "Test upload functionality")

    return NextResponse.json({
      success: true,
      message: "Upload directory and file writing test successful",
      uploadsDir: uploadsDir,
      testFile: testFile
    })
  } catch (error) {
    console.error("Upload test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
