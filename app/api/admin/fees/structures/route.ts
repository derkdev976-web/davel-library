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

    // For now, return mock data since we haven't added fee structures to the database yet
    const mockFeeStructures = [
      {
        id: "1",
        type: "LATE_RETURN",
        name: "Late Return Fee",
        description: "Fee charged for books returned after the due date",
        amount: 5.00,
        currency: "ZAR",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "2",
        type: "DAMAGE",
        name: "Book Damage Fee",
        description: "Fee charged for damaged books",
        amount: 25.00,
        currency: "ZAR",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "3",
        type: "LOST_BOOK",
        name: "Lost Book Fee",
        description: "Fee charged for lost books",
        amount: 50.00,
        currency: "ZAR",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "4",
        type: "MEMBERSHIP",
        name: "Annual Membership Fee",
        description: "Annual membership fee for library access",
        amount: 100.00,
        currency: "ZAR",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return NextResponse.json(mockFeeStructures)

  } catch (error) {
    console.error("Error fetching fee structures:", error)
    return NextResponse.json(
      { error: "Failed to fetch fee structures" },
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

    const { type, name, description, amount, currency, isActive } = await request.json()

    if (!type || !name || !description || amount === undefined) {
      return NextResponse.json({ 
        error: "Missing required fields: type, name, description, amount" 
      }, { status: 400 })
    }

    // For now, return a mock response since we haven't added fee structures to the database yet
    const newFeeStructure = {
      id: Date.now().toString(),
      type,
      name,
      description,
      amount: parseFloat(amount),
      currency: currency || "ZAR",
      isActive: isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(newFeeStructure, { status: 201 })

  } catch (error) {
    console.error("Error creating fee structure:", error)
    return NextResponse.json(
      { error: "Failed to create fee structure" },
      { status: 500 }
    )
  }
}
