import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transactionId = params.id
    const { message } = await request.json()

    // For now, return a mock response since we haven't added fee transactions to the database yet
    // In a real implementation, you would:
    // 1. Verify the transaction belongs to the user
    // 2. Create a payment request record
    // 3. Send notification to admin
    // 4. Update transaction status to "PAYMENT_REQUESTED"

    const paymentRequest = {
      id: Date.now().toString(),
      transactionId,
      userId: session.user.id,
      message: message || "Payment request submitted",
      status: "PENDING",
      submittedAt: new Date().toISOString()
    }

    return NextResponse.json(paymentRequest, { status: 201 })

  } catch (error) {
    console.error("Error submitting payment request:", error)
    return NextResponse.json(
      { error: "Failed to submit payment request" },
      { status: 500 }
    )
  }
}
