import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch homepage content from database
    const homepageContent = await prisma.homePageContent.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    // Transform database content into the expected format
    const transformedContent = {
      serviceHours: {
        monday_friday: "8:00 AM - 10:00 PM",
        saturday: "9:00 AM - 8:00 PM", 
        sunday: "10:00 AM - 6:00 PM",
        digital_library: "Available 24/7 online"
      },
      contact: {
        email: "help@davel-library.com",
        phone: "(555) 123-4567",
        live_chat: "Available during hours",
        support_message: "Need assistance with any of our services?"
      },
      statistics: {
        books_available: "10,000+",
        active_members: "2,500+", 
        events_this_year: "150+",
        digital_resources: "5,000+"
      },
      hero: {
        title: "Welcome to Davel Library",
        subtitle: "Experience the future of library management with our interactive 3D interface, comprehensive book catalog, and community-driven features.",
        impact_message: "Join thousands of readers who have made Davel Library their literary home"
      }
    }

    // Override with database content if available
    homepageContent.forEach(content => {
      if (content.section === 'serviceHours') {
        try {
          const parsed = JSON.parse(content.content)
          transformedContent.serviceHours = { ...transformedContent.serviceHours, ...parsed }
        } catch (e) {
          console.error('Error parsing serviceHours content:', e)
        }
      } else if (content.section === 'contact') {
        try {
          const parsed = JSON.parse(content.content)
          transformedContent.contact = { ...transformedContent.contact, ...parsed }
        } catch (e) {
          console.error('Error parsing contact content:', e)
        }
      } else if (content.section === 'statistics') {
        try {
          const parsed = JSON.parse(content.content)
          transformedContent.statistics = { ...transformedContent.statistics, ...parsed }
        } catch (e) {
          console.error('Error parsing statistics content:', e)
        }
      } else if (content.section === 'hero') {
        try {
          const parsed = JSON.parse(content.content)
          transformedContent.hero = { ...transformedContent.hero, ...parsed }
        } catch (e) {
          console.error('Error parsing hero content:', e)
        }
      }
    })

    return NextResponse.json(transformedContent)
  } catch (error) {
    console.error("Error fetching homepage content:", error)
    return NextResponse.json(
      { error: "Failed to fetch homepage content" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updates = await request.json()
    
    // Update each section in the database
    const updatePromises = []
    
    if (updates.serviceHours) {
      updatePromises.push(
        prisma.homePageContent.upsert({
          where: { section: 'serviceHours' },
          update: { 
            content: JSON.stringify(updates.serviceHours),
            updatedBy: session.user.id
          },
          create: {
            section: 'serviceHours',
            title: 'Service Hours',
            content: JSON.stringify(updates.serviceHours),
            updatedBy: session.user.id
          }
        })
      )
    }
    
    if (updates.contact) {
      updatePromises.push(
        prisma.homePageContent.upsert({
          where: { section: 'contact' },
          update: { 
            content: JSON.stringify(updates.contact),
            updatedBy: session.user.id
          },
          create: {
            section: 'contact',
            title: 'Contact Information',
            content: JSON.stringify(updates.contact),
            updatedBy: session.user.id
          }
        })
      )
    }
    
    if (updates.statistics) {
      updatePromises.push(
        prisma.homePageContent.upsert({
          where: { section: 'statistics' },
          update: { 
            content: JSON.stringify(updates.statistics),
            updatedBy: session.user.id
          },
          create: {
            section: 'statistics',
            title: 'Library Statistics',
            content: JSON.stringify(updates.statistics),
            updatedBy: session.user.id
          }
        })
      )
    }
    
    if (updates.hero) {
      updatePromises.push(
        prisma.homePageContent.upsert({
          where: { section: 'hero' },
          update: { 
            content: JSON.stringify(updates.hero),
            updatedBy: session.user.id
          },
          create: {
            section: 'hero',
            title: 'Hero Section',
            content: JSON.stringify(updates.hero),
            updatedBy: session.user.id
          }
        })
      )
    }
    
    await Promise.all(updatePromises)
    
    return NextResponse.json({ 
      message: "Homepage content updated successfully"
    })
  } catch (error) {
    console.error("Error updating homepage content:", error)
    return NextResponse.json(
      { error: "Failed to update homepage content" },
      { status: 500 }
    )
  }
}

