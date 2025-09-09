import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `profile-${session.user.id}-${timestamp}${fileExtension}`
    const uploadPath = `/uploads/profile-pictures/${fileName}`

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profile-pictures")
    await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()))

    // Update user profile with new picture path
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: { profilePicture: uploadPath },
      create: {
        userId: session.user.id,
        firstName: session.user.name?.split(" ")[0] || "User",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
        preferredGenres: "General",
        profilePicture: uploadPath
      }
    })

    return NextResponse.json({
      success: true,
      message: "Profile picture uploaded successfully",
      profilePicture: uploadPath,
      profile: updatedProfile
    })

  } catch (error) {
    console.error("Profile picture upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload profile picture" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get current profile picture path
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { profilePicture: true }
    })

    if (userProfile?.profilePicture) {
      // Remove profile picture from profile
      await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: { profilePicture: null }
      })

      // Note: Physical file deletion could be added here if needed
      // For now, we just remove the reference
    }

    return NextResponse.json({
      success: true,
      message: "Profile picture removed successfully"
    })

  } catch (error) {
    console.error("Profile picture removal error:", error)
    return NextResponse.json(
      { error: "Failed to remove profile picture" },
      { status: 500 }
    )
  }
}
