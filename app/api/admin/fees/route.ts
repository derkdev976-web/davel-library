import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all fees with user information
    const fees = await prisma.memberFee.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get fee statistics
    const totalFees = await prisma.memberFee.aggregate({
      _sum: { amount: true },
      _count: { id: true }
    })

    const paidFees = await prisma.memberFee.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
      _count: { id: true }
    })

    const pendingFees = await prisma.memberFee.aggregate({
      where: { status: 'PENDING' },
      _sum: { amount: true },
      _count: { id: true }
    })

    const overdueFees = await prisma.memberFee.aggregate({
      where: { 
        status: 'OVERDUE',
        dueDate: { lt: new Date() }
      },
      _sum: { amount: true },
      _count: { id: true }
    })

    // Format the data
    const formattedFees = fees.map(fee => ({
      id: fee.id,
      userId: fee.userId,
      userName: fee.user.name || `${fee.user.profile?.firstName || ''} ${fee.user.profile?.lastName || ''}`.trim() || 'Unknown',
      userEmail: fee.user.email,
      type: fee.type,
      description: fee.description,
      amount: fee.amount,
      status: fee.status,
      dueDate: fee.dueDate?.toISOString(),
      paidAt: fee.paidAt?.toISOString(),
      createdAt: fee.createdAt.toISOString(),
      payments: fee.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt.toISOString()
      }))
    }))

    const collectionRate = totalFees._count.id > 0 
      ? (paidFees._count.id / totalFees._count.id) * 100 
      : 0

    return NextResponse.json({
      fees: formattedFees,
      statistics: {
        totalFees: totalFees._sum.amount || 0,
        totalCount: totalFees._count.id,
        paidFees: paidFees._sum.amount || 0,
        paidCount: paidFees._count.id,
        pendingFees: pendingFees._sum.amount || 0,
        pendingCount: pendingFees._count.id,
        overdueFees: overdueFees._sum.amount || 0,
        overdueCount: overdueFees._count.id,
        collectionRate: Math.round(collectionRate * 10) / 10
      }
    })

  } catch (error) {
    console.error("Error fetching admin fees:", error)
    return NextResponse.json(
      { error: "Failed to fetch fees" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, type, description, amount, dueDate } = await request.json()

    if (!userId || !type || !description || !amount) {
      return NextResponse.json(
        { error: "User ID, type, description, and amount are required" },
        { status: 400 }
      )
    }

    // Create fee
    const fee = await prisma.memberFee.create({
      data: {
        userId,
        type,
        description,
        amount: parseFloat(amount),
        status: 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      fee: {
        id: fee.id,
        userId: fee.userId,
        userName: fee.user.name || `${fee.user.profile?.firstName || ''} ${fee.user.profile?.lastName || ''}`.trim() || 'Unknown',
        userEmail: fee.user.email,
        type: fee.type,
        description: fee.description,
        amount: fee.amount,
        status: fee.status,
        dueDate: fee.dueDate?.toISOString(),
        createdAt: fee.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error("Error creating fee:", error)
    return NextResponse.json(
      { error: "Failed to create fee" },
      { status: 500 }
    )
  }
}
