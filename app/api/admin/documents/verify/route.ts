import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    const { userId, documentType, verified, notes } = await request.json()

    if (!userId || !documentType || typeof verified !== "boolean") {
      return NextResponse.json({ 
        error: "Missing required fields: userId, documentType, verified" 
      }, { status: 400 })
    }

    // Update the verification status for the specific document type
    const updateData: any = {}
    const verifiedAt = new Date()
    const verifiedBy = session.user.name || session.user.email

    switch (documentType) {
      case "idDocument":
        updateData.idDocumentVerified = verified
        updateData.idDocumentVerifiedAt = verified ? verifiedAt : null
        updateData.idDocumentVerifiedBy = verified ? verifiedBy : null
        updateData.idDocumentNotes = notes || null
        break
      case "proofOfAddress":
        updateData.proofOfAddressVerified = verified
        updateData.proofOfAddressVerifiedAt = verified ? verifiedAt : null
        updateData.proofOfAddressVerifiedBy = verified ? verifiedBy : null
        updateData.proofOfAddressNotes = notes || null
        break
      case "additionalDocuments":
        updateData.additionalDocsVerified = verified
        updateData.additionalDocsVerifiedAt = verified ? verifiedAt : null
        updateData.additionalDocsVerifiedBy = verified ? verifiedBy : null
        updateData.additionalDocsNotes = notes || null
        break
      default:
        return NextResponse.json({ 
          error: "Invalid document type" 
        }, { status: 400 })
    }

    // Update the user profile
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Document ${verified ? 'verified' : 'rejected'} successfully`,
      profile: updatedProfile
    })

  } catch (error) {
    console.error("Error verifying document:", error)
    return NextResponse.json(
      { error: "Failed to verify document" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ 
        error: "Missing userId parameter" 
      }, { status: 400 })
    }

    // Get user profile with verification status
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ 
        error: "User profile not found" 
      }, { status: 404 })
    }

    return NextResponse.json({
      profile: {
        ...profile,
        verificationStatus: {
          idDocument: {
            verified: profile.idDocumentVerified,
            verifiedAt: profile.idDocumentVerifiedAt,
            verifiedBy: profile.idDocumentVerifiedBy,
            notes: profile.idDocumentNotes
          },
          proofOfAddress: {
            verified: profile.proofOfAddressVerified,
            verifiedAt: profile.proofOfAddressVerifiedAt,
            verifiedBy: profile.proofOfAddressVerifiedBy,
            notes: profile.proofOfAddressNotes
          },
          additionalDocuments: {
            verified: profile.additionalDocsVerified,
            verifiedAt: profile.additionalDocsVerifiedAt,
            verifiedBy: profile.additionalDocsVerifiedBy,
            notes: profile.additionalDocsNotes
          }
        }
      }
    })

  } catch (error) {
    console.error("Error fetching verification status:", error)
    return NextResponse.json(
      { error: "Failed to fetch verification status" },
      { status: 500 }
    )
  }
}
