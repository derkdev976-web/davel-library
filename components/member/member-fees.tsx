"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, 
  Eye, Calendar, CreditCard, FileText, Send, MessageSquare 
} from "lucide-react"

interface FeeTransaction {
  id: string
  feeType: string
  amount: number
  currency: string
  reason: string
  status: "PENDING" | "PAID" | "WAIVED" | "OVERDUE"
  dueDate: string
  paidDate?: string
  createdAt: string
  bookTitle?: string
  reservationId?: string
}

interface FeeSummary {
  totalFees: number
  totalPaid: number
  totalPending: number
  totalOverdue: number
  totalWaived: number
}

export function MemberFees() {
  const [transactions, setTransactions] = useState<FeeTransaction[]>([])
  const [summary, setSummary] = useState<FeeSummary | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<FeeTransaction | null>(null)
  const [isPaymentRequestDialogOpen, setIsPaymentRequestDialogOpen] = useState(false)
  const [paymentMessage, setPaymentMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchMemberFees()
  }, [])

  const fetchMemberFees = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/user/fees")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
        setSummary(data.summary || null)
      } else {
        throw new Error("Failed to fetch member fees")
      }
    } catch (error) {
      console.error("Error fetching member fees:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your fee information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "outline",
      PAID: "default",
      WAIVED: "secondary",
      OVERDUE: "destructive"
    }
    return (
      <Badge variant={variants[status] || "outline"}>
        {status}
      </Badge>
    )
  }

  const getFeeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      LATE_RETURN: "Late Return",
      DAMAGE: "Damage",
      LOST_BOOK: "Lost Book",
      MEMBERSHIP: "Membership",
      PROCESSING: "Processing"
    }
    return labels[type] || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "OVERDUE":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "WAIVED":
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const handlePaymentRequest = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/user/fees/${transactionId}/payment-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: paymentMessage })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payment request submitted successfully",
        })
        setIsPaymentRequestDialogOpen(false)
        setPaymentMessage("")
      } else {
        throw new Error("Failed to submit payment request")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit payment request",
        variant: "destructive",
      })
    }
  }

  const openPaymentRequestDialog = (transaction: FeeTransaction) => {
    setSelectedTransaction(transaction)
    setIsPaymentRequestDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your fees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Fee Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-lg font-bold">R {summary.totalFees.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Total Fees</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-lg font-bold">R {summary.totalPaid.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Paid</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <div className="text-lg font-bold">R {summary.totalPending.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <div className="text-lg font-bold">R {summary.totalOverdue.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Overdue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fee Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Your Fee History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No fees found. You&apos;re all caught up!</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(transaction.status)}
                        <div>
                          <div className="font-medium">{getFeeTypeLabel(transaction.feeType)}</div>
                          <div className="text-sm text-gray-600">{transaction.reason}</div>
                          {transaction.bookTitle && (
                            <div className="text-xs text-gray-500">Book: {transaction.bookTitle}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-bold">R {transaction.amount.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(transaction.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTransaction(transaction)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(transaction.status === "PENDING" || transaction.status === "OVERDUE") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPaymentRequestDialog(transaction)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fee Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fee Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Fee Information</h4>
                  <div className="text-sm text-gray-600">
                    <div>Type: {getFeeTypeLabel(selectedTransaction.feeType)}</div>
                    <div>Amount: R {selectedTransaction.amount.toFixed(2)}</div>
                    <div>Status: {getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Dates</h4>
                  <div className="text-sm text-gray-600">
                    <div>Created: {formatDate(selectedTransaction.createdAt)}</div>
                    <div>Due: {formatDate(selectedTransaction.dueDate)}</div>
                    {selectedTransaction.paidDate && (
                      <div>Paid: {formatDate(selectedTransaction.paidDate)}</div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Reason</h4>
                <p className="text-sm text-gray-600">{selectedTransaction.reason}</p>
              </div>
              {selectedTransaction.bookTitle && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Book Information</h4>
                  <div className="text-sm text-gray-600">
                    <div>Title: {selectedTransaction.bookTitle}</div>
                    {selectedTransaction.reservationId && (
                      <div>Reservation ID: {selectedTransaction.reservationId}</div>
                    )}
                  </div>
                </div>
              )}
              {selectedTransaction.status === "PENDING" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Payment Pending</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    This fee is due on {formatDate(selectedTransaction.dueDate)}. Please contact the library to arrange payment.
                  </p>
                </div>
              )}
              {selectedTransaction.status === "OVERDUE" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Payment Overdue</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    This fee was due on {formatDate(selectedTransaction.dueDate)} and is now overdue. Please contact the library immediately.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Request Dialog */}
      <Dialog open={isPaymentRequestDialogOpen} onOpenChange={setIsPaymentRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Payment Request</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Payment Information</span>
                </div>
                <div className="text-sm text-blue-700 mt-2">
                  <div>Fee: {getFeeTypeLabel(selectedTransaction.feeType)}</div>
                  <div>Amount: R {selectedTransaction.amount.toFixed(2)}</div>
                  <div>Due Date: {formatDate(selectedTransaction.dueDate)}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Message (Optional)
                </label>
                <textarea
                  value={paymentMessage}
                  onChange={(e) => setPaymentMessage(e.target.value)}
                  placeholder="Add any additional information about your payment..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPaymentRequestDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handlePaymentRequest(selectedTransaction.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
