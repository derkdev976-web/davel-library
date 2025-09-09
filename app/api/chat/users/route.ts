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

    // Get all users except the current user
    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        role: { in: ["MEMBER", "ADMIN", "LIBRARIAN"] } // Only show relevant users
      },
      include: {
        profile: true
      },
      orderBy: { name: "asc" }
    })

    // Get unread message counts for each user
    const usersWithUnreadCounts = await Promise.all(
      users.map(async (user) => {
        const unreadCount = await prisma.chatMessage.count({
          where: {
            senderId: user.id,
            recipientId: session.user.id,
            isRead: false
          }
        })

        return {
          ...user,
          unreadCount,
          isOnline: true, // For now, assume all users are online
          avatar: user.profile?.profilePicture || null // Use real profile picture
        }
      })
    )

    return NextResponse.json(usersWithUnreadCounts)
  } catch (error) {
    console.error("Error fetching chat users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}
