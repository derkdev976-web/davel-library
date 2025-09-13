"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  DollarSign, Plus, Search, Filter, Download, Eye, 
  CheckCircle, Clock, AlertTriangle, FileText, Users,
  TrendingUp, TrendingDown, Calendar, CreditCard
} from "lucide-react"

interface Fee {
  id: string
  userId: string
  userName: string
  userEmail: string
  type: string
  description: string
  amount: number
  status: string
  dueDate?: string
  paidAt?: string
  createdAt: string
  payments: Payment[]
}

interface Payment {
  id: string
  amount: number
  method: string
  status: string
  transactionId?: string
  createdAt: string
}

interface FeeStatistics {
  totalFees: number
  totalCount: number
  paidFees: number
  paidCount: number
  pendingFees: number
  pendingCount: number
  overdueFees: number
  overdueCount: number
  collectionRate: number
}

export function FeeManager() {
  const [fees, setFees] = useState<Fee[]>([])
  const [statistics, setStatistics] = useState<FeeStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showAddFeeDialog, setShowAddFeeDialog] = useState(false)
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null)
  const { toast } = useToast()

  // Add fee form state
  const [newFee, setNewFee] = useState({
    userId: "",
    type: "",
    description: "",
    amount: "",
    dueDate: ""
  })

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/fees")
      if (response.ok) {
        const data = await response.json()
        setFees(data.fees)
        setStatistics(data.statistics)
      }
    } catch (error) {
      console.error("Error fetching fees:", error)
      toast({ title: "Error loading fees", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const handleAddFee = async () => {
    try {
      const response = await fetch("/api/admin/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFee)
      })

      if (response.ok) {
        toast({ title: "Fee added successfully" })
        setShowAddFeeDialog(false)
        setNewFee({ userId: "", type: "", description: "", amount: "", dueDate: "" })
        fetchFees()
      } else {
        const error = await response.json()
        toast({ title: "Error adding fee", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error adding fee", variant: "destructive" })
    }
  }

  const generateFeeSlip = async (feeId: string) => {
    try {
      const response = await fetch(`/api/admin/fees/${feeId}/slip`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fee-slip-${feeId}.html`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast({ title: "Fee slip generated successfully" })
      }
    } catch (error) {
      toast({ title: "Error generating fee slip", variant: "destructive" })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-800"
      case "PENDING": return "bg-yellow-100 text-yellow-800"
      case "OVERDUE": return "bg-red-100 text-red-800"
      case "WAIVED": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "PENDING": return <Clock className="h-4 w-4 text-yellow-600" />
      case "OVERDUE": return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "WAIVED": return <FileText className="h-4 w-4 text-blue-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter
    const matchesType = typeFilter === "all" || fee.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  useEffect(() => {
    fetchFees()
  }, [fetchFees])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage library fees and payments</p>
        </div>
        <Button onClick={() => setShowAddFeeDialog(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Fee</span>
        </Button>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Collected</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">R {statistics.paidFees.toFixed(2)}</div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {statistics.paidCount} fees paid
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending</CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">R {statistics.pendingFees.toFixed(2)}</div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {statistics.pendingCount} fees pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Overdue</CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800 dark:text-red-200">R {statistics.overdueFees.toFixed(2)}</div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {statistics.overdueCount} fees overdue
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Collection Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{statistics.collectionRate}%</div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Success rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fee Structures */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Late Return Fee</h3>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Type: Late Return</p>
              <p className="text-lg font-bold text-red-600">R 5.00</p>
              <p className="text-xs text-gray-500">Fee charged for books returned after the due date</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Book Damage Fee</h3>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Type: Damage</p>
              <p className="text-lg font-bold text-red-600">R 25.00</p>
              <p className="text-xs text-gray-500">Fee charged for damaged books</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Lost Book Fee</h3>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Type: Lost Book</p>
              <p className="text-lg font-bold text-red-600">R 50.00</p>
              <p className="text-xs text-gray-500">Fee charged for lost books</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Annual Membership Fee</h3>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Type: Membership</p>
              <p className="text-lg font-bold text-red-600">R 100.00</p>
              <p className="text-xs text-gray-500">Annual membership fee for library access</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Fee History & Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="WAIVED">Waived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="LATE_RETURN">Late Return</SelectItem>
                <SelectItem value="DAMAGE">Damage</SelectItem>
                <SelectItem value="LOST_BOOK">Lost Book</SelectItem>
                <SelectItem value="MEMBERSHIP">Membership</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>

          {/* Fee Transactions Table */}
          <div className="space-y-4">
            {filteredFees.map((fee) => (
              <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(fee.status)}
                    <Badge className={getStatusColor(fee.status)}>
                      {fee.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{fee.userName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{fee.userEmail}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">{fee.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(fee.createdAt).toLocaleDateString('en-ZA')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">R {fee.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{fee.type}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateFeeSlip(fee.id)}
                      className="flex items-center space-x-1"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Slip</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedFee(fee)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Fee Dialog */}
      <Dialog open={showAddFeeDialog} onOpenChange={setShowAddFeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Fee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={newFee.userId}
                onChange={(e) => setNewFee({ ...newFee, userId: e.target.value })}
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <Label htmlFor="type">Fee Type</Label>
              <Select value={newFee.type} onValueChange={(value) => setNewFee({ ...newFee, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LATE_RETURN">Late Return</SelectItem>
                  <SelectItem value="DAMAGE">Damage</SelectItem>
                  <SelectItem value="LOST_BOOK">Lost Book</SelectItem>
                  <SelectItem value="MEMBERSHIP">Membership</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newFee.description}
                onChange={(e) => setNewFee({ ...newFee, description: e.target.value })}
                placeholder="Enter fee description"
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (R)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={newFee.amount}
                onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                value={newFee.dueDate}
                onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFeeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFee}>
              Add Fee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
