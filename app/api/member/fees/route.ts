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

    // Get member's fees and payments
    const fees = await prisma.memberFee.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Get payment history
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate totals
    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0)
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const outstandingBalance = totalFees - totalPaid

    // Format the data
    const formattedFees = fees.map(fee => ({
      id: fee.id,
      type: fee.type,
      description: fee.description,
      amount: fee.amount,
      status: fee.status,
      dueDate: fee.dueDate?.toISOString(),
      createdAt: fee.createdAt.toISOString(),
      paidAt: fee.paidAt?.toISOString()
    }))

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      description: payment.description,
      createdAt: payment.createdAt.toISOString(),
      transactionId: payment.transactionId
    }))

    return NextResponse.json({
      fees: formattedFees,
      payments: formattedPayments,
      summary: {
        totalFees,
        totalPaid,
        outstandingBalance,
        currency: 'ZAR'
      }
    })

  } catch (error) {
    console.error("Error fetching member fees:", error)
    return NextResponse.json(
      { error: "Failed to fetch fees" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const { feeId, amount, method } = await request.json()

    if (!feeId || !amount || !method) {
      return NextResponse.json(
        { error: "Fee ID, amount, and payment method are required" },
        { status: 400 }
      )
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        feeId,
        amount,
        method,
        status: 'PENDING',
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      }
    })

    // Update fee status
    await prisma.memberFee.update({
      where: { id: feeId },
      data: { 
        status: 'PAID',
        paidAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    )
  }
}
