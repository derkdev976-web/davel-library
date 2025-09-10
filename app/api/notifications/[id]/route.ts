import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = params
    const { read } = await request.json()

    // Update notification
    const notification = await prisma.notification.update({
      where: { 
        id,
        userId: session.user.id // Ensure user can only update their own notifications
      },
      data: { read: read ?? true }
    })

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: notification.createdAt,
        read: notification.read,
        category: notification.category,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText
      }
    })

  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { id } = params

    // Delete notification
    await prisma.notification.delete({
      where: { 
        id,
        userId: session.user.id // Ensure user can only delete their own notifications
      }
    })

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully"
    })

  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    )
  }
}
