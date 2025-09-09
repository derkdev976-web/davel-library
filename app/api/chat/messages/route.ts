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

    const { searchParams } = new URL(request.url)
    const recipientId = searchParams.get("recipientId")

    if (!recipientId) {
      return NextResponse.json(
        { error: "Missing recipientId" },
        { status: 400 }
      )
    }

    // Get messages between the two users
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            recipientId: recipientId
          },
          {
            senderId: recipientId,
            recipientId: session.user.id
          }
        ]
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderRole: message.sender.role,
      recipientId: message.recipientId,
      recipientName: message.recipient.name,
      recipientRole: message.recipient.role,
      timestamp: message.createdAt,
      isRead: message.isRead
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content, recipientId } = body

    if (!content || !recipientId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId }
    })

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      )
    }

    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        recipientId: recipientId,
        isRead: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    const formattedMessage = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderRole: message.sender.role,
      recipientId: message.recipientId,
      recipientName: message.recipient.name,
      recipientRole: message.recipient.role,
      timestamp: message.createdAt,
      isRead: message.isRead
    }

    return NextResponse.json(formattedMessage)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
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

    const body = await request.json()
    const { messageId, isRead } = body

    if (!messageId) {
      return NextResponse.json(
        { error: "Missing messageId" },
        { status: 400 }
      )
    }

    const message = await prisma.chatMessage.update({
      where: {
        id: messageId,
        recipientId: session.user.id // Only allow updating messages sent to current user
      },
      data: {
        isRead: isRead !== undefined ? isRead : true
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error updating message:", error)
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    )
  }
}
