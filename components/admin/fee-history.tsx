"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  Search, Filter, Download, Eye, CheckCircle, XCircle, 
  Clock, AlertTriangle, DollarSign, TrendingUp, TrendingDown 
} from "lucide-react"

interface FeeTransaction {
  id: string
  userId: string
  userName: string
  userEmail: string
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
  totalCollected: number
  totalPending: number
  totalOverdue: number
  totalWaived: number
  averageFee: number
  collectionRate: number
}

export function FeeHistory() {
  const [transactions, setTransactions] = useState<FeeTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<FeeTransaction[]>([])
  const [summary, setSummary] = useState<FeeSummary | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<FeeTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  useEffect(() => {
    fetchFeeHistory()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, searchTerm, statusFilter, typeFilter, dateFilter])

  const fetchFeeHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/fees/transactions")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
        calculateSummary(data)
      } else {
        throw new Error("Failed to fetch fee history")
      }
    } catch (error) {
      console.error("Error fetching fee history:", error)
      toast({
        title: "Error",
        description: "Failed to fetch fee history",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateSummary = (data: FeeTransaction[]) => {
    const totalFees = data.reduce((sum, t) => sum + t.amount, 0)
    const totalCollected = data.filter(t => t.status === "PAID").reduce((sum, t) => sum + t.amount, 0)
    const totalPending = data.filter(t => t.status === "PENDING").reduce((sum, t) => sum + t.amount, 0)
    const totalOverdue = data.filter(t => t.status === "OVERDUE").reduce((sum, t) => sum + t.amount, 0)
    const totalWaived = data.filter(t => t.status === "WAIVED").reduce((sum, t) => sum + t.amount, 0)
    
    setSummary({
      totalFees,
      totalCollected,
      totalPending,
      totalOverdue,
      totalWaived,
      averageFee: data.length > 0 ? totalFees / data.length : 0,
      collectionRate: totalFees > 0 ? (totalCollected / totalFees) * 100 : 0
    })
  }

  const applyFilters = () => {
    let filtered = transactions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.feeType === typeFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const filterDate = new Date()
      
      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter(t => new Date(t.createdAt) >= filterDate)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          filtered = filtered.filter(t => new Date(t.createdAt) >= filterDate)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          filtered = filtered.filter(t => new Date(t.createdAt) >= filterDate)
          break
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1)
          filtered = filtered.filter(t => new Date(t.createdAt) >= filterDate)
          break
      }
    }

    setFilteredTransactions(filtered)
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

  const exportToCSV = () => {
    const csvContent = [
      ["Date", "User", "Email", "Fee Type", "Amount", "Status", "Reason", "Due Date", "Paid Date"].join(","),
      ...filteredTransactions.map(t => [
        formatDate(t.createdAt),
        t.userName,
        t.userEmail,
        getFeeTypeLabel(t.feeType),
        t.amount.toFixed(2),
        t.status,
        `"${t.reason}"`,
        formatDate(t.dueDate),
        t.paidDate ? formatDate(t.paidDate) : ""
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fee-history-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fee history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-lg font-bold">R {summary.totalCollected.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Collected</div>
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-lg font-bold">{summary.collectionRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Collection Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="WAIVED">Waived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="LATE_RETURN">Late Return</SelectItem>
            <SelectItem value="DAMAGE">Damage</SelectItem>
            <SelectItem value="LOST_BOOK">Lost Book</SelectItem>
            <SelectItem value="MEMBERSHIP">Membership</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Transactions List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No fee transactions found matching your criteria.
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium">{transaction.userName}</div>
                        <div className="text-sm text-gray-600">{transaction.userEmail}</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{getFeeTypeLabel(transaction.feeType)}</div>
                        <div className="text-gray-600">{transaction.reason}</div>
                      </div>
                      {transaction.bookTitle && (
                        <div className="text-sm">
                          <div className="font-medium">Book:</div>
                          <div className="text-gray-600">{transaction.bookTitle}</div>
                        </div>
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fee Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">User Information</h4>
                  <div className="text-sm text-gray-600">
                    <div>{selectedTransaction.userName}</div>
                    <div>{selectedTransaction.userEmail}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Fee Information</h4>
                  <div className="text-sm text-gray-600">
                    <div>Type: {getFeeTypeLabel(selectedTransaction.feeType)}</div>
                    <div>Amount: R {selectedTransaction.amount.toFixed(2)}</div>
                    <div>Status: {getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Reason</h4>
                <p className="text-sm text-gray-600">{selectedTransaction.reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
