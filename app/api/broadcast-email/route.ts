import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { emailService } from "@/lib/email-service"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, message, recipientType, recipientIds } = await request.json()

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
    }

    let recipients = []

    if (recipientType === "all") {
      // Get all active members
      recipients = await prisma.user.findMany({
        where: { 
          role: "MEMBER",
          status: "ACTIVE"
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      })
    } else if (recipientType === "selected" && recipientIds?.length > 0) {
      // Get selected members
      recipients = await prisma.user.findMany({
        where: { 
          id: { in: recipientIds },
          role: "MEMBER"
        },
        select: {
          id: true,
          name: true,
          email: true
        }
      })
    } else {
      return NextResponse.json({ error: "Invalid recipient selection" }, { status: 400 })
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 })
    }

    // Send emails to all recipients
    const results = []
    let successCount = 0
    let failureCount = 0

    for (const recipient of recipients) {
      try {
        const success = await emailService.sendBroadcastEmail({
          to: recipient.email,
          name: recipient.name || "Member",
          subject,
          message,
          senderName: session.user.name || "Davel Library Team"
        })

        if (success) {
          successCount++
          results.push({
            recipient: recipient.email,
            status: "success"
          })
        } else {
          failureCount++
          results.push({
            recipient: recipient.email,
            status: "failed"
          })
        }
      } catch (error) {
        failureCount++
        results.push({
          recipient: recipient.email,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }

    return NextResponse.json({
      message: `Email broadcast completed`,
      summary: {
        total: recipients.length,
        successful: successCount,
        failed: failureCount
      },
      results
    })

  } catch (error) {
    console.error("Broadcast email error:", error)
    return NextResponse.json(
      { error: "Failed to send broadcast email" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all members for recipient selection
    const members = await prisma.user.findMany({
      where: { 
        role: "MEMBER",
        status: "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ members })

  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}
