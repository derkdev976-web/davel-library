import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all membership applications from database
    const applications = await prisma.membershipApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    })

    // Get approved members from database
    const approvedMembers = await prisma.user.findMany({
      where: {
        role: "MEMBER",
        isActive: true
      },
      include: {
        profile: true,
        membershipApplication: true
      }
    })

    // Format applications
    const formattedApplications = applications.map(app => ({
      id: app.id,
      userId: app.userId,
      name: `${app.firstName} ${app.lastName}`.trim(),
      email: app.email,
      phone: app.phone,
      address: `${app.street || ''}, ${app.city || ''}, ${app.state || ''} ${app.zipCode || ''}, ${app.country || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ','),
      appliedAt: app.createdAt.toISOString().slice(0, 10),
      status: app.status,
      hasDisability: app.hasDisability,
      disabilityDetails: app.disabilityDetails,
      preferredGenres: app.preferredGenres,
      readingFrequency: app.readingFrequency,
      subscribeNewsletter: app.subscribeNewsletter,
      reviewedBy: app.reviewedBy,
      reviewedAt: app.reviewedAt?.toISOString().slice(0, 10),
      reviewNotes: app.reviewNotes,
      // Include document fields
      idDocument: app.idDocument,
      proofOfAddress: app.proofOfAddress,
      additionalDocuments: app.additionalDocuments,
      source: 'database'
    }))

    // Format approved members
    const formattedApprovedMembers = approvedMembers.map(member => ({
      id: member.id,
      userId: member.id,
      name: member.name || `${member.profile?.firstName || ''} ${member.profile?.lastName || ''}`.trim() || 'Unknown',
      email: member.email,
      phone: member.phone || 'N/A',
      address: `${member.profile?.street || ''}, ${member.profile?.city || ''}, ${member.profile?.state || ''} ${member.profile?.zipCode || ''}, ${member.profile?.country || ''}`.replace(/^,\s*/, '').replace(/,\s*,/g, ','),
      appliedAt: member.createdAt.toISOString().slice(0, 10),
      status: "APPROVED",
      hasDisability: member.profile?.hasDisability || false,
      disabilityDetails: member.profile?.disabilityDetails || '',
      preferredGenres: member.profile?.preferredGenres || [],
      readingFrequency: member.profile?.readingFrequency || 'OCCASIONALLY',
      subscribeNewsletter: false,
      // Include document fields from profile
      idDocument: member.profile?.idDocument,
      proofOfAddress: member.profile?.proofOfAddress,
      additionalDocuments: member.profile?.additionalDocuments,
      source: 'database',
      lastLogin: member.lastLogin?.toISOString().slice(0, 10),
      memberSince: member.createdAt.toISOString().slice(0, 10)
    }))

    // Combine both sources
    const allApplications = [...formattedApplications, ...formattedApprovedMembers]

    // Sort by applied date (newest first)
    allApplications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())

    return NextResponse.json(allApplications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}


