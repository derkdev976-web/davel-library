import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, role, tempAdminExpires, notes } = body

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let updatedUser

    switch (action) {
      case "change_role":
        if (!role || !["ADMIN", "LIBRARIAN", "MEMBER", "GUEST"].includes(role)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 })
        }
        
        updatedUser = await prisma.user.update({
          where: { id: params.id },
          data: { 
            role: role as any,
            isTemporaryAdmin: false,
            tempAdminExpires: null
          },
          include: { profile: true }
        })
        break

      case "grant_temp_admin":
        if (!tempAdminExpires) {
          return NextResponse.json({ error: "Temporary admin expiration date is required" }, { status: 400 })
        }
        
        updatedUser = await prisma.user.update({
          where: { id: params.id },
          data: { 
            isTemporaryAdmin: true,
            tempAdminExpires: new Date(tempAdminExpires)
          },
          include: { profile: true }
        })
        break

      case "revoke_temp_admin":
        updatedUser = await prisma.user.update({
          where: { id: params.id },
          data: { 
            isTemporaryAdmin: false,
            tempAdminExpires: null
          },
          include: { profile: true }
        })
        break

      case "toggle_active":
        updatedUser = await prisma.user.update({
          where: { id: params.id },
          data: { isActive: !user.isActive },
          include: { profile: true }
        })
        break

      case "reset_password":
        const defaultPassword = process.env.MEMBER_DEFAULT_PASSWORD || "member123"
        const bcrypt = await import("bcryptjs")
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)
        
        updatedUser = await prisma.user.update({
          where: { id: params.id },
          data: { password: hashedPassword },
          include: { profile: true }
        })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ 
      message: "User permissions updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        isTemporaryAdmin: updatedUser.isTemporaryAdmin,
        tempAdminExpires: updatedUser.tempAdminExpires,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
        profile: updatedUser.profile
      }
    })

  } catch (error) {
    console.error('Error updating user permissions:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { 
        profile: true,
        reservations: {
          include: { 
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                isbn: true,
                genre: true,
                deweyDecimal: true,
                isElectronic: true,
                summary: true,
                coverImage: true,
                totalCopies: true,
                availableCopies: true,
                isDigital: true,
                digitalFile: true,
                isLocked: true,
                maxReservations: true,
                currentReservations: true,
                publishedYear: true,
                publisher: true,
                language: true,
                pages: true,
                isActive: true,
                visibility: true,
                createdAt: true,
                updatedAt: true
              }
            }
          },
          orderBy: { reservedAt: 'desc' }
        },
        userVisits: {
          orderBy: { visitedAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isTemporaryAdmin: user.isTemporaryAdmin,
        tempAdminExpires: user.tempAdminExpires,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        profile: user.profile,
        recentReservations: user.reservations.slice(0, 5).map(reservation => ({
          id: reservation.id,
          status: reservation.status,
          reservedAt: reservation.reservedAt,
          dueDate: reservation.dueDate,
          book: reservation.book
        })),
        recentVisits: user.userVisits,
        totalReservations: user.reservations.length,
        totalVisits: user.userVisits.length
      }
    })

  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
