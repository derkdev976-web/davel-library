import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Simple in-memory cache for profile data (in production, use Redis or similar)
const profileCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Function to invalidate cache for a user
function invalidateProfileCache(userId: string) {
  profileCache.delete(`profile_${userId}`)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check cache first
    const cacheKey = `profile_${session.user.id}`
    const cached = profileCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached profile data for user:', session.user.id)
      return NextResponse.json(cached.data)
    }

    // First, get basic user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            street: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            dateOfBirth: true,
            gender: true,
            preferredGenres: true,
            readingFrequency: true,
            profilePicture: true,
            bio: true
          }
        }
      }
    })

    // Get reservation counts separately to avoid heavy joins
    const [totalReservations, currentBorrowed, booksThisYear] = await Promise.all([
      prisma.bookReservation.count({
        where: { userId: session.user.id }
      }),
      prisma.bookReservation.count({
        where: { 
          userId: session.user.id,
          status: 'BORROWED'
        }
      }),
      prisma.bookReservation.count({
        where: { 
          userId: session.user.id,
          status: 'RETURNED',
          returnedAt: {
            gte: new Date(new Date().getFullYear(), 0, 1)
          }
        }
      })
    ])

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

         // Transform the data to match the frontend expectations
     console.log('Raw user data:', user)
     console.log('Raw preferredGenres:', user.profile?.preferredGenres, 'Type:', typeof user.profile?.preferredGenres)
     
     const transformedProfile = {
      id: user.id,
      name: user.name || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'User',
      email: user.email,
      phone: user.phone || null,
      address: user.profile ? [
        user.profile.street,
        user.profile.city,
        user.profile.state,
        user.profile.zipCode,
        user.profile.country
      ].filter(Boolean).join(', ') : null,
      dateOfBirth: user.profile?.dateOfBirth || null,
      avatar: user.image || user.profile?.profilePicture || null,
      membershipType: user.role === 'ADMIN' ? 'Administrator' : user.role === 'LIBRARIAN' ? 'Librarian' : 'Member',
      membershipStatus: 'Active', // Default to active for now
      joinDate: user.createdAt,
      totalBooksBorrowed: totalReservations,
      currentBorrowed: currentBorrowed,
      favoriteGenres: user.profile?.preferredGenres ? 
        (typeof user.profile.preferredGenres === 'string' ? 
          user.profile.preferredGenres.split(',').map(g => g.trim()).filter(g => g.length > 0) : 
          Array.isArray(user.profile.preferredGenres) ? user.profile.preferredGenres : []
        ) : [],
      readingGoals: {
        booksThisYear: booksThisYear,
        target: 12 // Default target of 12 books per year
      }
    }

    // Cache the result
    profileCache.set(cacheKey, {
      data: transformedProfile,
      timestamp: Date.now()
    })

    return NextResponse.json(transformedProfile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updateData = await request.json()

    // Update user profile
    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        ...updateData
      }
    })

    // Invalidate cache after update
    invalidateProfileCache(session.user.id)

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
