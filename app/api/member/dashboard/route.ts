import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get member profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        profilePicture: true,
        bio: true,
        preferredGenres: true,
        readingFrequency: true,
        createdAt: true
      }
    })

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        phone: true,
        createdAt: true
      }
    })

    // Get active reservations
    const reservations = await prisma.bookReservation.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImage: true
          }
        }
      },
      orderBy: { reservedAt: 'desc' }
    })

    // Get chat messages
    const chatMessages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            name: true,
            role: true
          }
        },
        recipient: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get available ebooks
    const ebooks = await prisma.book.findMany({
      where: {
        isElectronic: true,
        isLocked: false,
        availableCopies: {
          gt: 0
        }
      },
      select: {
        id: true,
        title: true,
        author: true,
        coverImage: true,
        digitalFile: true
      },
      take: 10
    })

    // Format the data
    const formattedProfile = profile ? {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: user?.email,
      phone: user?.phone,
      dateOfBirth: profile.dateOfBirth?.toISOString().split('T')[0],
      gender: profile.gender,
      profilePicture: profile.profilePicture,
      bio: profile.bio,
      preferredGenres: profile.preferredGenres ? profile.preferredGenres.split(',').map(g => g.trim()) : [],
      readingFrequency: profile.readingFrequency,
      memberSince: user?.createdAt.toISOString().split('T')[0]
    } : null

    const formattedReservations = reservations.map(reservation => ({
      id: reservation.id,
      bookTitle: reservation.book.title,
      bookAuthor: reservation.book.author,
      bookCover: reservation.book.coverImage,
      status: reservation.status,
      reservedAt: reservation.reservedAt.toISOString(),
      dueDate: reservation.dueDate?.toISOString(),
      returnedAt: reservation.returnedAt?.toISOString(),
      renewalCount: reservation.renewalCount
    }))

    const formattedChatMessages = chatMessages.map(message => ({
      id: message.id,
      content: message.content,
      senderName: message.sender.name || 'Unknown',
      senderRole: message.sender.role,
      recipientName: message.recipient.name || 'Unknown',
      recipientRole: message.recipient.role,
      createdAt: message.createdAt.toISOString(),
      isRead: message.isRead,
      isSystem: message.isSystem
    }))

    const formattedEbooks = ebooks.map(ebook => ({
      id: ebook.id,
      title: ebook.title,
      author: ebook.author,
      coverImage: ebook.coverImage,
      downloadUrl: ebook.digitalFile,
      isDownloaded: false // This would need to be tracked separately
    }))

    return NextResponse.json({
      profile: formattedProfile,
      reservations: formattedReservations,
      chatMessages: formattedChatMessages,
      ebooks: formattedEbooks
    })

  } catch (error) {
    console.error("Error fetching member dashboard data:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
