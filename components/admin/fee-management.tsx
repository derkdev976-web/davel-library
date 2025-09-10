"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  DollarSign, Plus, Edit, Trash, Clock, AlertTriangle, 
  CheckCircle, XCircle, Save, X, CreditCard, Receipt, Eye 
} from "lucide-react"

interface FeeStructure {
  id: string
  type: "LATE_RETURN" | "DAMAGE" | "LOST_BOOK" | "MEMBERSHIP" | "PROCESSING"
  name: string
  description: string
  amount: number
  currency: "ZAR"
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface FeeTransaction {
  id: string
  userId: string
  userName: string
  feeType: string
  amount: number
  currency: string
  reason: string
  status: "PENDING" | "PAID" | "WAIVED" | "OVERDUE"
  dueDate: string
  paidDate?: string
  createdAt: string
}

export function FeeManagement() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([])
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<FeeTransaction | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    description: "",
    amount: "",
    isActive: true
  })

  useEffect(() => {
    fetchFeeData()
  }, [])

  const fetchFeeData = async () => {
    try {
      setLoading(true)
      // Fetch fee structures and transactions
      const [structuresResponse, transactionsResponse] = await Promise.all([
        fetch("/api/admin/fees/structures"),
        fetch("/api/admin/fees/transactions")
      ])

      if (structuresResponse.ok) {
        const structures = await structuresResponse.json()
        setFeeStructures(structures)
      }

      if (transactionsResponse.ok) {
        const transactions = await transactionsResponse.json()
        setFeeTransactions(transactions)
      }
    } catch (error) {
      console.error("Error fetching fee data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch fee data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddFee = async () => {
    try {
      const response = await fetch("/api/admin/fees/structures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          currency: "ZAR"
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Fee structure added successfully",
        })
        setIsAddDialogOpen(false)
        resetForm()
        fetchFeeData()
      } else {
        throw new Error("Failed to add fee structure")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add fee structure",
        variant: "destructive",
      })
    }
  }

  const handleEditFee = async () => {
    if (!editingFee) return

    try {
      const response = await fetch(`/api/admin/fees/structures/${editingFee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Fee structure updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingFee(null)
        resetForm()
        fetchFeeData()
      } else {
        throw new Error("Failed to update fee structure")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update fee structure",
        variant: "destructive",
      })
    }
  }

  const handleDeleteFee = async (feeId: string) => {
    if (!confirm("Are you sure you want to delete this fee structure?")) return

    try {
      const response = await fetch(`/api/admin/fees/structures/${feeId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Fee structure deleted successfully",
        })
        fetchFeeData()
      } else {
        throw new Error("Failed to delete fee structure")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete fee structure",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      type: "",
      name: "",
      description: "",
      amount: "",
      isActive: true
    })
  }

  const openEditDialog = (fee: FeeStructure) => {
    setEditingFee(fee)
    setFormData({
      type: fee.type,
      name: fee.name,
      description: fee.description,
      amount: fee.amount.toString(),
      isActive: fee.isActive
    })
    setIsEditDialogOpen(true)
  }

  const handleApprovePayment = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/admin/fees/transactions/${transactionId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payment approved successfully",
        })
        fetchFeeData()
      } else {
        throw new Error("Failed to approve payment")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve payment",
        variant: "destructive",
      })
    }
  }

  const handleWaiveFee = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/admin/fees/transactions/${transactionId}/waive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Fee waived successfully",
        })
        fetchFeeData()
      } else {
        throw new Error("Failed to waive fee")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to waive fee",
        variant: "destructive",
      })
    }
  }

  const openPaymentDialog = (transaction: FeeTransaction) => {
    setSelectedTransaction(transaction)
    setIsPaymentDialogOpen(true)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fee management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Fee Structures */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Fee Structures</h3>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Fee
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feeStructures.map((fee) => (
            <Card key={fee.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{fee.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {fee.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(fee)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteFee(fee.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="text-sm font-medium">{getFeeTypeLabel(fee.type)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-sm font-medium">R {fee.amount.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-gray-600">{fee.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Fee Transactions</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {feeTransactions.slice(0, 10).map((transaction) => (
            <Card key={transaction.id} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{transaction.userName}</div>
                  <div className="text-sm text-gray-600">{transaction.reason}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-medium">R {transaction.amount.toFixed(2)}</div>
                    <div className="text-sm">{getStatusBadge(transaction.status)}</div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPaymentDialog(transaction)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {transaction.status === "PENDING" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprovePayment(transaction.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWaiveFee(transaction.id)}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Fee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Fee Structure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">Fee Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LATE_RETURN">Late Return</SelectItem>
                  <SelectItem value="DAMAGE">Damage</SelectItem>
                  <SelectItem value="LOST_BOOK">Lost Book</SelectItem>
                  <SelectItem value="MEMBERSHIP">Membership</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Fee Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Late Return Fee"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe when this fee applies..."
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (ZAR)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFee}>
              Add Fee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Fee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fee Structure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-type">Fee Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LATE_RETURN">Late Return</SelectItem>
                  <SelectItem value="DAMAGE">Damage</SelectItem>
                  <SelectItem value="LOST_BOOK">Lost Book</SelectItem>
                  <SelectItem value="MEMBERSHIP">Membership</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-name">Fee Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Late Return Fee"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe when this fee applies..."
              />
            </div>
            <div>
              <Label htmlFor="edit-amount">Amount (ZAR)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFee}>
              Update Fee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Approval Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Management</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">User Information</h4>
                  <div className="text-sm text-gray-600">
                    <div>{selectedTransaction.userName}</div>
                    <div>User ID: {selectedTransaction.userId}</div>
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
                    <div>Created: {new Date(selectedTransaction.createdAt).toLocaleDateString("en-ZA")}</div>
                    <div>Due: {new Date(selectedTransaction.dueDate).toLocaleDateString("en-ZA")}</div>
                    {selectedTransaction.paidDate && (
                      <div>Paid: {new Date(selectedTransaction.paidDate).toLocaleDateString("en-ZA")}</div>
                    )}
                  </div>
                </div>
              </div>
              {selectedTransaction.status === "PENDING" && (
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleApprovePayment(selectedTransaction.id)
                      setIsPaymentDialogOpen(false)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleWaiveFee(selectedTransaction.id)
                      setIsPaymentDialogOpen(false)
                    }}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Waive Fee
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
