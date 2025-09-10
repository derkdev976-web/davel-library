import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'davel-library/profile-pictures',
          public_id: `profile-${session.user.id}-${Date.now()}`,
          resource_type: 'auto',
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const cloudinaryResult = result as any
    const uploadPath = cloudinaryResult.secure_url

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
