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
    // Fetch real users from database
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        membershipApplication: true,
        userVisits: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || 'Unknown',
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isTemporaryAdmin: user.isTemporaryAdmin,
      tempAdminExpires: user.tempAdminExpires,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      visitCount: user.userVisits.length,
      profile: {
        ...user.profile,
        profilePicture: user.profile?.profilePicture,
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName
      },
      applicationStatus: user.membershipApplication?.status || null
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const { id, data } = await req.json()
    
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        profile: true,
        membershipApplication: true,
        userVisits: true
      }
    })
    
    return NextResponse.json({ user: updated })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const { id } = await req.json()
    
    await prisma.user.delete({
      where: { id }
    })
    
    return NextResponse.json({ ok: true, message: `User ${id} deleted` })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}


