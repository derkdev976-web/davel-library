import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const { title, content, type, imageUrl, date } = body as { title?: string; content?: string; type?: "NEWS" | "EVENT" | "ANNOUNCEMENT"; imageUrl?: string; date?: string }
  try {
    const updated = await prisma.newsEvent.update({
      where: { id: params.id },
      data: {
        title,
        content,
        type,
        image: imageUrl,
        eventDate: date ? new Date(date) : undefined,
      },
    })
    return NextResponse.json({ item: updated })
  } catch {
    return NextResponse.json({ item: { id: params.id, title, content, type, image: imageUrl, eventDate: date ? new Date(date) : undefined } })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try { await prisma.newsEvent.delete({ where: { id: params.id } }) } catch {}
  return NextResponse.json({ ok: true })
}


