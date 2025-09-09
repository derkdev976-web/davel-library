import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({
      ...profile,
      email: profile.user.email,
      memberSince: profile.user.createdAt
    })
  } catch (error) {
    console.error("Error fetching member profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updateData = await request.json()

    // Check if profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id }
    })

    let profile
    if (existingProfile) {
      // Update existing profile
      const processedData = { ...updateData }
      if (Array.isArray(updateData.preferredGenres)) {
        processedData.preferredGenres = updateData.preferredGenres.join(", ")
      }
      
      profile = await prisma.userProfile.update({
        where: { userId: session.user.id },
        data: processedData,
        include: {
          user: {
            select: {
              email: true,
              createdAt: true
            }
          }
        }
      })
    } else {
          // Create new profile
    profile = await prisma.userProfile.create({
      data: {
        userId: session.user.id,
        preferredGenres: Array.isArray(updateData.preferredGenres) 
          ? updateData.preferredGenres.join(", ") 
          : (updateData.preferredGenres || "Fiction"), // Convert array to string or use default
        ...updateData
      },
      include: {
        user: {
          select: {
            email: true,
            createdAt: true
          }
        }
      }
    })
    }

    return NextResponse.json({
      ...profile,
      email: profile.user.email,
      memberSince: profile.user.createdAt
    })
  } catch (error) {
    console.error("Error updating member profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
