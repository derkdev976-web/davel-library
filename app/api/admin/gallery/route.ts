import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Fetch real gallery images from database
    const galleryImages = await prisma.galleryImage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the data for the frontend
    const formattedGalleryImages = galleryImages.map(image => ({
      id: image.id,
      title: image.title,
      imageUrl: image.imageUrl,
      isPublished: image.isPublished,
      visibility: image.visibility,
      createdAt: image.createdAt.toISOString()
    }))

    return NextResponse.json(formattedGalleryImages)
  } catch (error) {
    console.error("Error fetching gallery images:", error)
    return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const data = await req.json()
    
    const created = await prisma.galleryImage.create({
      data: {
        title: data.title || "",
        imageUrl: data.imageUrl,
        description: data.description || "",
        uploadedBy: session.user.id,
        isPublished: data.isPublished || false,
        visibility: data.visibility || "PUBLIC"
      }
    })
    
    return NextResponse.json({ item: created })
  } catch (error) {
    console.error("Error creating gallery image:", error)
    return NextResponse.json({ error: "Failed to create gallery image" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const { id } = await req.json()
    
    await prisma.galleryImage.delete({
      where: { id }
    })
    
    return NextResponse.json({ ok: true, message: `Gallery image ${id} deleted` })
  } catch (error) {
    console.error("Error deleting gallery image:", error)
    return NextResponse.json({ error: "Failed to delete gallery image" }, { status: 500 })
  }
}


