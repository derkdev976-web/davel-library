import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subject, message, recipientType, selectedUsers } = await request.json()

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
    }

    let recipients: { email: string; name: string }[] = []

    switch (recipientType) {
      case "all":
        const allUsers = await prisma.user.findMany({
          where: { email: { not: "" } },
          select: { email: true, name: true }
        })
        recipients = allUsers.filter(user => user.email) as { email: string; name: string }[]
        break

      case "members":
        const members = await prisma.user.findMany({
                     where: { 
             email: { not: "" },
             role: "MEMBER"
           },
          select: { email: true, name: true }
        })
        recipients = members.filter(user => user.email) as { email: string; name: string }[]
        break

      case "applicants":
        const applicants = await prisma.membershipApplication.findMany({
          where: { status: "PENDING" },
          select: { email: true, firstName: true, lastName: true }
        })
        recipients = applicants.map(app => ({
          email: app.email,
          name: `${app.firstName} ${app.lastName}`
        }))
        break

      case "custom":
        if (!selectedUsers || selectedUsers.length === 0) {
          return NextResponse.json({ error: "No users selected" }, { status: 400 })
        }
                 const customUsers = await prisma.user.findMany({
           where: { 
             id: { in: selectedUsers },
             email: { not: "" }
           },
          select: { email: true, name: true }
        })
        recipients = customUsers.filter(user => user.email) as { email: string; name: string }[]
        break

      default:
        return NextResponse.json({ error: "Invalid recipient type" }, { status: 400 })
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 })
    }

    // Send emails to all recipients
    const emailPromises = recipients.map(recipient => 
      emailService.sendBroadcastEmail({
        to: recipient.email,
        name: recipient.name,
        subject,
        message,
        senderName: session.user.name || "Davel Library"
      })
    )

    const results = await Promise.allSettled(emailPromises)
    const successfulSends = results.filter(result => result.status === "fulfilled" && result.value).length

    return NextResponse.json({
      success: true,
      sentCount: successfulSends,
      totalRecipients: recipients.length,
      failedCount: recipients.length - successfulSends
    })

  } catch (error) {
    console.error("Error broadcasting email:", error)
    return NextResponse.json(
      { error: "Failed to send broadcast email" },
      { status: 500 }
    )
  }
}
