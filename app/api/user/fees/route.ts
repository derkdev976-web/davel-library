import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For now, return mock data since we haven't added fee transactions to the database yet
    // In a real implementation, you would fetch from the database
    const mockTransactions = [
      {
        id: "1",
        feeType: "LATE_RETURN",
        amount: 5.00,
        currency: "ZAR",
        reason: "Book returned 3 days late",
        status: "PAID",
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        bookTitle: "Introduction to Algorithms",
        reservationId: "cmevlxoak000i4mhvi8k6ic9p"
      },
      {
        id: "2",
        feeType: "DAMAGE",
        amount: 25.00,
        currency: "ZAR",
        reason: "Book cover damaged",
        status: "PENDING",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        bookTitle: "Clean Code",
        reservationId: "cmf1kzb560001mtaedvkp1rnj"
      },
      {
        id: "3",
        feeType: "LOST_BOOK",
        amount: 50.00,
        currency: "ZAR",
        reason: "Book reported as lost",
        status: "OVERDUE",
        dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        bookTitle: "The Pragmatic Programmer",
        reservationId: "cmf1l0wub0003mtaeztnwjzrl"
      }
    ]

    // Calculate summary
    const summary = {
      totalFees: mockTransactions.reduce((sum, t) => sum + t.amount, 0),
      totalPaid: mockTransactions.filter(t => t.status === "PAID").reduce((sum, t) => sum + t.amount, 0),
      totalPending: mockTransactions.filter(t => t.status === "PENDING").reduce((sum, t) => sum + t.amount, 0),
      totalOverdue: mockTransactions.filter(t => t.status === "OVERDUE").reduce((sum, t) => sum + t.amount, 0),
      totalWaived: mockTransactions.filter(t => t.status === "WAIVED").reduce((sum, t) => sum + t.amount, 0)
    }

    return NextResponse.json({
      transactions: mockTransactions,
      summary
    })

  } catch (error) {
    console.error("Error fetching member fees:", error)
    return NextResponse.json(
      { error: "Failed to fetch member fees" },
      { status: 500 }
    )
  }
}
