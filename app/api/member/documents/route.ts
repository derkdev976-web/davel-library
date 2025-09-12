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

    // Get member's profile to access documents
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: {
        idDocument: true,
        proofOfAddress: true,
        additionalDocuments: true
      }
    })

    // Get document requests
    const documentRequests = await prisma.documentRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Format documents
    const documents = []
    if (profile?.idDocument) {
      documents.push({
        id: 'id-document',
        type: 'ID Document',
        filename: 'ID Document',
        url: profile.idDocument,
        uploadedAt: new Date().toISOString(),
        status: 'UPLOADED'
      })
    }
    if (profile?.proofOfAddress) {
      documents.push({
        id: 'proof-of-address',
        type: 'Proof of Address',
        filename: 'Proof of Address',
        url: profile.proofOfAddress,
        uploadedAt: new Date().toISOString(),
        status: 'UPLOADED'
      })
    }
    if (profile?.additionalDocuments) {
      documents.push({
        id: 'additional-documents',
        type: 'Additional Documents',
        filename: 'Additional Documents',
        url: profile.additionalDocuments,
        uploadedAt: new Date().toISOString(),
        status: 'UPLOADED'
      })
    }

    // Format document requests
    const formattedRequests = documentRequests.map(request => ({
      id: request.id,
      documentType: request.documentType,
      reason: request.requestReason,
      status: request.status,
      dueDate: request.dueDate?.toISOString(),
      createdAt: request.createdAt.toISOString(),
      adminNotes: request.adminNotes
    }))

    return NextResponse.json({
      documents,
      documentRequests: formattedRequests
    })

  } catch (error) {
    console.error("Error fetching member documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}
