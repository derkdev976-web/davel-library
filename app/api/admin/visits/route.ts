import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch real user visits from database
    const userVisits = await prisma.userVisit.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        visitedAt: 'desc'
      },
      take: 50 // Limit to recent 50 visits
    })

    // Format the data for the frontend
    const formattedVisits = userVisits.map(visit => ({
      id: visit.id,
      userId: visit.userId,
      userName: visit.user?.name || 'Unknown User',
      userEmail: visit.user?.email || 'unknown@email.com',
      userRole: visit.user?.role || 'GUEST',
      page: visit.page,
      duration: visit.duration,
      visitedAt: visit.visitedAt.toISOString(),
      userAgent: visit.userAgent,
      ipAddress: visit.ipAddress
    }))

    return NextResponse.json(formattedVisits)
  } catch (error) {
    console.error("Error fetching user visits:", error)
    return NextResponse.json({ error: "Failed to fetch user visits" }, { status: 500 })
  }
}
