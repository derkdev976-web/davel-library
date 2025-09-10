import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const capacity = searchParams.get("capacity")
    const location = searchParams.get("location")

    // Build where clause
    const where: any = {
      isActive: true
    }
    
    if (capacity) {
      where.capacity = {
        gte: parseInt(capacity)
      }
    }
    
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      }
    }

    const spaces = await prisma.studySpace.findMany({
      where,
      orderBy: { name: "asc" }
    })

    return NextResponse.json(spaces)

  } catch (error) {
    console.error("Error fetching study spaces:", error)
    return NextResponse.json(
      { error: "Failed to fetch study spaces" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, capacity, location, amenities, hourlyRate, image } = await request.json()

    if (!name || !description || !capacity || !location || !hourlyRate) {
      return NextResponse.json(
        { error: "Name, description, capacity, location, and hourly rate are required" },
        { status: 400 }
      )
    }

    const studySpace = await prisma.studySpace.create({
      data: {
        name,
        description,
        capacity: parseInt(capacity),
        location,
        amenities: amenities || [],
        hourlyRate: parseFloat(hourlyRate),
        image,
        isActive: true,
        isAvailable: true
      }
    })

    return NextResponse.json({
      success: true,
      space: studySpace
    })

  } catch (error) {
    console.error("Error creating study space:", error)
    return NextResponse.json(
      { error: "Failed to create study space" },
      { status: 500 }
    )
  }
}
