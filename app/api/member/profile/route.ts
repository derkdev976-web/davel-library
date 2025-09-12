import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
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
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.user.email,
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth?.toISOString().split('T')[0],
      gender: profile.gender,
      profilePicture: profile.profilePicture,
      bio: profile.bio,
      preferredGenres: profile.preferredGenres ? profile.preferredGenres.split(',').map(g => g.trim()) : [],
      readingFrequency: profile.readingFrequency,
      memberSince: profile.user.createdAt.toISOString().split('T')[0]
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
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()

    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        bio: body.bio,
        preferredGenres: body.preferredGenres ? body.preferredGenres.join(', ') : undefined,
        readingFrequency: body.readingFrequency
      }
    })

    return NextResponse.json({
      success: true,
      profile: {
        id: updatedProfile.id,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        phone: updatedProfile.phone,
        bio: updatedProfile.bio,
        preferredGenres: updatedProfile.preferredGenres ? updatedProfile.preferredGenres.split(',').map(g => g.trim()) : [],
        readingFrequency: updatedProfile.readingFrequency
      }
    })

  } catch (error) {
    console.error("Error updating member profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}