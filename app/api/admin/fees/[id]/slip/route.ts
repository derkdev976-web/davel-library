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
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const feeId = params.id

    // Get fee with user information
    const fee = await prisma.memberFee.findUnique({
      where: { id: feeId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!fee) {
      return NextResponse.json(
        { error: "Fee not found" },
        { status: 404 }
      )
    }

    // Generate PDF content (simplified version - in production, use a proper PDF library)
    const userName = fee.user.name || `${fee.user.profile?.firstName || ''} ${fee.user.profile?.lastName || ''}`.trim() || 'Unknown'
    const userEmail = fee.user.email
    const userPhone = fee.user.phone || 'N/A'
    
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Fee Slip - ${feeId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .library-name { font-size: 24px; font-weight: bold; color: #2563eb; }
        .slip-title { font-size: 18px; margin-top: 10px; }
        .content { margin: 20px 0; }
        .section { margin: 15px 0; }
        .label { font-weight: bold; display: inline-block; width: 150px; }
        .value { display: inline-block; }
        .fee-details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .amount { font-size: 20px; font-weight: bold; color: #dc2626; }
        .status { padding: 5px 10px; border-radius: 3px; font-weight: bold; }
        .status.PAID { background: #dcfce7; color: #166534; }
        .status.PENDING { background: #fef3c7; color: #92400e; }
        .status.OVERDUE { background: #fee2e2; color: #991b1b; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="library-name">Davel Library</div>
        <div class="slip-title">Fee Payment Slip</div>
    </div>
    
    <div class="content">
        <div class="section">
            <span class="label">Slip Number:</span>
            <span class="value">${feeId}</span>
        </div>
        <div class="section">
            <span class="label">Date:</span>
            <span class="value">${new Date().toLocaleDateString('en-ZA')}</span>
        </div>
        <div class="section">
            <span class="label">Member Name:</span>
            <span class="value">${userName}</span>
        </div>
        <div class="section">
            <span class="label">Email:</span>
            <span class="value">${userEmail}</span>
        </div>
        <div class="section">
            <span class="label">Phone:</span>
            <span class="value">${userPhone}</span>
        </div>
        
        <div class="fee-details">
            <div class="section">
                <span class="label">Fee Type:</span>
                <span class="value">${fee.type}</span>
            </div>
            <div class="section">
                <span class="label">Description:</span>
                <span class="value">${fee.description}</span>
            </div>
            <div class="section">
                <span class="label">Amount:</span>
                <span class="value amount">R ${fee.amount.toFixed(2)}</span>
            </div>
            <div class="section">
                <span class="label">Status:</span>
                <span class="value status ${fee.status}">${fee.status}</span>
            </div>
            ${fee.dueDate ? `
            <div class="section">
                <span class="label">Due Date:</span>
                <span class="value">${new Date(fee.dueDate).toLocaleDateString('en-ZA')}</span>
            </div>
            ` : ''}
            ${fee.paidAt ? `
            <div class="section">
                <span class="label">Paid Date:</span>
                <span class="value">${new Date(fee.paidAt).toLocaleDateString('en-ZA')}</span>
            </div>
            ` : ''}
        </div>
        
        ${fee.payments.length > 0 ? `
        <div class="section">
            <span class="label">Payment Method:</span>
            <span class="value">${fee.payments[0].method}</span>
        </div>
        <div class="section">
            <span class="label">Transaction ID:</span>
            <span class="value">${fee.payments[0].transactionId}</span>
        </div>
        ` : ''}
    </div>
    
    <div class="footer">
        <p>Thank you for using Davel Library services.</p>
        <p>For queries, contact: support@davel.library.com</p>
    </div>
</body>
</html>
    `

    // Return HTML content that can be converted to PDF
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="fee-slip-${feeId}.html"`
      }
    })

  } catch (error) {
    console.error("Error generating fee slip:", error)
    return NextResponse.json(
      { error: "Failed to generate fee slip" },
      { status: 500 }
    )
  }
}
