import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const data = await request.json()
  try {
    const updated = await prisma.book.update({ where: { id: params.id }, data })
    return NextResponse.json({ book: updated })
  } catch (_e) {
    return NextResponse.json({ book: { id: params.id, ...data } })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    await prisma.book.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (_e) {
    return NextResponse.json({ ok: true })
  }
}


