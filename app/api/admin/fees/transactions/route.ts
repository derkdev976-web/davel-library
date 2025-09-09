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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // For now, return mock data since we haven't added fee transactions to the database yet
    const mockTransactions = [
      {
        id: "1",
        userId: "cmesh30be000bgxtv84zsfm35",
        userName: "Sipho Zwane",
        userEmail: "davellibrary37@gmail.com",
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
        userId: "cmesh30be000bgxtv84zsfm35",
        userName: "Sipho Zwane",
        userEmail: "davellibrary37@gmail.com",
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
        userId: "cmesh30be000bgxtv84zsfm35",
        userName: "Sipho Zwane",
        userEmail: "davellibrary37@gmail.com",
        feeType: "LOST_BOOK",
        amount: 50.00,
        currency: "ZAR",
        reason: "Book reported as lost",
        status: "OVERDUE",
        dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        bookTitle: "The Pragmatic Programmer",
        reservationId: "cmf1l0wub0003mtaeztnwjzrl"
      },
      {
        id: "4",
        userId: "cmesh30be000bgxtv84zsfm35",
        userName: "Sipho Zwane",
        userEmail: "davellibrary37@gmail.com",
        feeType: "MEMBERSHIP",
        amount: 100.00,
        currency: "ZAR",
        reason: "Annual membership renewal",
        status: "WAIVED",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    return NextResponse.json(mockTransactions)

  } catch (error) {
    console.error("Error fetching fee transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch fee transactions" },
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { 
      userId, 
      feeType, 
      amount, 
      reason, 
      dueDate, 
      bookTitle, 
      reservationId 
    } = await request.json()

    if (!userId || !feeType || amount === undefined || !reason) {
      return NextResponse.json({ 
        error: "Missing required fields: userId, feeType, amount, reason" 
      }, { status: 400 })
    }

    // Get user information
    const userInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    if (!userInfo) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // For now, return a mock response since we haven't added fee transactions to the database yet
    const newTransaction = {
      id: Date.now().toString(),
      userId,
      userName: userInfo.name,
      userEmail: userInfo.email,
      feeType,
      amount: parseFloat(amount),
      currency: "ZAR",
      reason,
      status: "PENDING",
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      bookTitle,
      reservationId
    }

    return NextResponse.json(newTransaction, { status: 201 })

  } catch (error) {
    console.error("Error creating fee transaction:", error)
    return NextResponse.json(
      { error: "Failed to create fee transaction" },
      { status: 500 }
    )
  }
}
