import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const notifications = await prisma.documentNotification.findMany({
      where: {
        userId: session.user.id,
        status: "ACTIVE"
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({ notifications })

  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { notificationId, status } = await request.json()

    if (!notificationId || !status) {
      return NextResponse.json(
        { error: "Notification ID and status are required" },
        { status: 400 }
      )
    }

    // Update notification status (e.g., mark as read)
    const updatedNotification = await prisma.documentNotification.update({
      where: {
        id: notificationId,
        userId: session.user.id // Ensure user can only update their own notifications
      },
      data: {
        status
      }
    })

    return NextResponse.json({ notification: updatedNotification })

  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
}
