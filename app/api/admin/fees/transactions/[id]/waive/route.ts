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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const transactionId = params.id

    // For now, return a mock response since we haven't added fee transactions to the database yet
    // In a real implementation, you would update the transaction status in the database
    const updatedTransaction = {
      id: transactionId,
      status: "WAIVED",
      waivedBy: session.user.id,
      waivedAt: new Date().toISOString()
    }

    return NextResponse.json(updatedTransaction)

  } catch (error) {
    console.error("Error waiving fee:", error)
    return NextResponse.json(
      { error: "Failed to waive fee" },
      { status: 500 }
    )
  }
}
