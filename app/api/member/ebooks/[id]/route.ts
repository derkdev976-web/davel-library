import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ebookId = params.id

    // Get the ebook
    const ebook = await prisma.book.findUnique({
      where: { 
        id: ebookId,
        isElectronic: true,
        isLocked: false
      },
      select: {
        id: true,
        title: true,
        author: true,
        coverImage: true,
        summary: true,
        digitalFile: true,
        publishedYear: true,
        publisher: true,
        language: true,
        pages: true
      }
    })

    if (!ebook) {
      return NextResponse.json({ error: "Ebook not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      ebook
    })

  } catch (error) {
    console.error("Error fetching ebook:", error)
    return NextResponse.json(
      { error: "Failed to fetch ebook" },
      { status: 500 }
    )
  }
}
