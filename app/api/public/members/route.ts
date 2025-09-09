import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Get public member information (only active members with public profiles)
    const members = await prisma.user.findMany({
      where: {
        role: { in: ["MEMBER", "GUEST"] },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            profilePicture: true,
            city: true,
            state: true,
            preferredGenres: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Filter out members without profiles or with incomplete information
    const publicMembers = members.filter(member => 
      member.profile && 
      member.profile.firstName && 
      member.profile.lastName
    )

    return NextResponse.json({ 
      members: publicMembers,
      total: publicMembers.length
    })

  } catch (error) {
    console.error("Error fetching public members:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}
