import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const requests = await prisma.documentRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: {
              select: {
                idDocument: true,
                proofOfAddress: true,
                additionalDocuments: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ requests })

  } catch (error) {
    console.error("Document requests error:", error)
    return NextResponse.json(
      { error: "Failed to retrieve document requests" },
      { status: 500 }
    )
  }
}
