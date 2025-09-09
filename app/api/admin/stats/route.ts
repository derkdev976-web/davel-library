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
    // Get today's date for filtering
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch real data from database
    const [
      totalUsers,
      activeMembers,
      pendingApplications,
      totalBooks,
      reservedBooks,
      overdueBooks,
      upcomingEvents,
      chatMessages,
      totalVisits,
      todayVisits
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active members (users with MEMBER role and isActive = true)
      prisma.user.count({
        where: {
          role: "MEMBER",
          isActive: true
        }
      }),
      
      // Pending applications
      prisma.membershipApplication.count({
        where: {
          status: "PENDING"
        }
      }),
      
      // Total books
      prisma.book.count({
        where: {
          isActive: true
        }
      }),
      
      // Reserved books (active reservations)
      prisma.bookReservation.count({
        where: {
          status: {
            in: ["PENDING", "APPROVED", "CHECKED_OUT"]
          }
        }
      }),
      
      // Overdue books (past due date)
      prisma.bookReservation.count({
        where: {
          status: "CHECKED_OUT",
          dueDate: {
            lt: new Date()
          }
        }
      }),
      
      // Upcoming events (placeholder - you can add events table later)
      Promise.resolve(8), // Mock for now
      
      // Chat messages
      prisma.chatMessage.count(),
      
      // Total visits
      prisma.userVisit.count(),
      
      // Today's visits
      prisma.userVisit.count({
        where: {
          visitedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    ])

    const stats = {
      totalUsers,
      activeMembers,
      pendingApplications,
      totalBooks,
      reservedBooks,
      overdueBooks,
      upcomingEvents,
      chatMessages,
      totalVisits,
      todayVisits
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}


