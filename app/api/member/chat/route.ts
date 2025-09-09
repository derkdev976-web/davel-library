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

    // Get messages where the current user is either sender or recipient
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ]
      },
      orderBy: { createdAt: "asc" }, // Show oldest first for chat flow
      take: 100, // Get more messages
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
      isSystem: message.isSystem,
      createdAt: message.createdAt.toISOString(),
      isRead: message.isRead
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error("Error fetching member chat messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch chat messages" },
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

    const { content, recipientId } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    // Determine recipient - if not specified, send to admin
    let targetRecipientId = recipientId

    // If member is sending message, ensure it goes to admin or librarian
    if (session.user.role === "MEMBER") {
      // Find an admin or librarian to send the message to
      const staffMember = await prisma.user.findFirst({
        where: {
          role: {
            in: ["ADMIN", "LIBRARIAN"]
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      })

      if (staffMember) {
        targetRecipientId = staffMember.id
      } else {
        return NextResponse.json({ error: "No staff member available to receive messages" }, { status: 404 })
      }
    }

    if (!targetRecipientId) {
      return NextResponse.json({ error: "Recipient ID is required" }, { status: 400 })
    }

    // Verify that the recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: targetRecipientId }
    })

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: session.user.id,
        recipientId: targetRecipientId,
        content: content.trim(),
        isSystem: false,
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

    return NextResponse.json({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderRole: message.sender.role,
      recipientId: message.recipientId,
      recipientName: message.recipient.name,
      recipientRole: message.recipient.role,
      isSystem: message.isSystem,
      createdAt: message.createdAt.toISOString(),
      isRead: message.isRead
    })
  } catch (error) {
    console.error("Error creating chat message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
