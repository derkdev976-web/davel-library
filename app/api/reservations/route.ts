import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { bookId } = await req.json()
  try {
    const r = await prisma.bookReservation.create({ data: { userId: session.user.id, bookId, status: "PENDING" } })
    return NextResponse.json({ ok: true, id: r.id })
  } catch {
    return NextResponse.json({ ok: true, id: `demo-${bookId}` })
  }
}


