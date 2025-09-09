import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: "Current password and new password are required" 
      }, { status: 400 })
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: "New password must be at least 8 characters long" 
      }, { status: 400 })
    }

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    if (!user.password) {
      return NextResponse.json({ 
        error: "User has no password set. Please contact support." 
      }, { status: 400 })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ 
        error: "Current password is incorrect" 
      }, { status: 400 })
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    
    if (isSamePassword) {
      return NextResponse.json({ 
        error: "New password must be different from current password" 
      }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: "Password changed successfully" 
    })

  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ 
      error: "Failed to change password" 
    }, { status: 500 })
  }
}
