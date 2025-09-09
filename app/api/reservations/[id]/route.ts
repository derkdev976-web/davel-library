import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { status } = body

    const reservationId = params.id
    
    // Find the reservation
    const reservation = await prisma.bookReservation.findUnique({
      where: { id: reservationId },
      include: { 
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            isDigital: true
          }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 })
    }

    // Handle different status updates
    let updatedReservation

    switch (status) {
      case "APPROVED":
        if (reservation.status !== "PENDING") {
          return NextResponse.json({ error: "Reservation is not pending approval" }, { status: 400 })
        }
        
        updatedReservation = await prisma.bookReservation.update({
          where: { id: reservationId },
          data: {
            status: "APPROVED",
            approvedBy: session.user.id,
            approvedAt: new Date(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            book: {
              select: {
                title: true,
                author: true
              }
            }
          }
        })
        break

      case "CANCELLED":
        if (reservation.status !== "PENDING") {
          return NextResponse.json({ error: "Only pending reservations can be cancelled" }, { status: 400 })
        }
        
        updatedReservation = await prisma.bookReservation.update({
          where: { id: reservationId },
          data: {
            status: "CANCELLED",
            approvedBy: session.user.id,
            approvedAt: new Date()
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            book: {
              select: {
                title: true,
                author: true
              }
            }
          }
        })
        break

      case "CHECKED_OUT":
        if (reservation.status !== "APPROVED") {
          return NextResponse.json({ error: "Only approved reservations can be checked out" }, { status: 400 })
        }
        
        updatedReservation = await prisma.bookReservation.update({
          where: { id: reservationId },
          data: {
            status: "CHECKED_OUT"
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            book: {
              select: {
                title: true,
                author: true
              }
            }
          }
        })
        break

      case "RETURNED":
        if (reservation.status !== "CHECKED_OUT") {
          return NextResponse.json({ error: "Only checked out reservations can be returned" }, { status: 400 })
        }
        
        updatedReservation = await prisma.bookReservation.update({
          where: { id: reservationId },
          data: {
            status: "RETURNED",
            returnedAt: new Date()
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            book: {
              select: {
                title: true,
                author: true
              }
            }
          }
        })
        break

      default:
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    
    return NextResponse.json({ 
      message: `Reservation ${status.toLowerCase()} successfully`,
      reservation: {
        id: updatedReservation.id,
        userId: updatedReservation.userId,
        userName: updatedReservation.user.name || 
                  `${updatedReservation.user.profile?.firstName || ''} ${updatedReservation.user.profile?.lastName || ''}`.trim() || 
                  updatedReservation.user.email,
        userEmail: updatedReservation.user.email,
        bookId: updatedReservation.bookId,
        bookTitle: updatedReservation.book.title,
        bookAuthor: updatedReservation.book.author,
        status: updatedReservation.status,
        reservedAt: updatedReservation.reservedAt.toISOString(),
        approvedAt: updatedReservation.approvedAt?.toISOString(),
        dueDate: updatedReservation.dueDate?.toISOString(),
        returnedAt: updatedReservation.returnedAt?.toISOString(),
        notes: updatedReservation.notes
      }
    })
  } catch (error) {
    console.error("Error updating reservation:", error)
    return NextResponse.json({ error: "Failed to update reservation" }, { status: 500 })
  }
}
