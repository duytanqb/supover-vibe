'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Wallet, 
  Plus, 
  Eye, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react'

interface Advance {
  id: string
  advanceNumber: string
  type: string
  amount: number
  status: string
  reason: string
  notes?: string
  requestedAt: string
  approvedAt?: string
  disbursedAt?: string
  outstandingAmount: number
  repaidAmount: number
  user: {
    id: string
    name: string
    email: string
  }
  team: {
    id: string
    name: string
    code: string
  }
  approver?: {
    id: string
    name: string
    email: string
  }
  repayments: any[]
}

interface WalletData {
  balance: number
  availableBalance: number
  holdAmount: number
  totalAdvances: number
  totalRepayments: number
  totalProfitShare: number
  advanceLimit: number
  outstandingAdvances: number
  availableCredit: number
  recentAdvances: any[]
}

export default function AdvancesPage() {
  const [advances, setAdvances] = useState<Advance[]>([])
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Form state for new advance request
  const [requestForm, setRequestForm] = useState({
    type: 'FULFILLMENT',
    amount: '',
    reason: '',
    notes: '',
    dueDate: ''
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUserId(payload.userId)
      fetchAdvances(payload.userId)
      fetchWallet(payload.userId)
    }
  }, [])

  const fetchAdvances = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/advances?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAdvances(data.advances)
      }
    } catch (error) {
      console.error('Error fetching advances:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWallet = async (userId: string) => {
    try {
      const response = await fetch(`/api/wallets/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setWallet(data.wallet)
      }
    } catch (error) {
      console.error('Error fetching wallet:', error)
    }
  }

  const handleRequestAdvance = async () => {
    try {
      const response = await fetch('/api/advances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...requestForm,
          amount: parseFloat(requestForm.amount)
        })
      })

      if (response.ok) {
        setRequestModalOpen(false)
        setRequestForm({
          type: 'FULFILLMENT',
          amount: '',
          reason: '',
          notes: '',
          dueDate: ''
        })
        if (userId) {
          fetchAdvances(userId)
          fetchWallet(userId)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to request advance')
      }
    } catch (error) {
      console.error('Error requesting advance:', error)
      alert('Failed to request advance')
    }
  }

  const handleViewAdvance = (advance: Advance) => {
    setSelectedAdvance(advance)
    setViewModalOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'APPROVED':
      case 'DISBURSED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      case 'REPAID':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'PENDING':
        return 'default'
      case 'APPROVED':
        return 'secondary'
      case 'DISBURSED':
        return 'default'
      case 'REJECTED':
        return 'destructive'
      case 'REPAID':
        return 'secondary'
      case 'PARTIALLY_REPAID':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading advances...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="Cash Advances" 
        description="Manage your cash advances and repayments"
        action={
          <Button onClick={() => setRequestModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Advance
          </Button>
        }
      />

      {/* Wallet Summary */}
      {wallet && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Credit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${wallet.availableCredit.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                of ${wallet.advanceLimit.toFixed(2)} limit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${wallet.outstandingAdvances.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                To be repaid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Repaid</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${wallet.totalRepayments.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime repayments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Share</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${wallet.totalProfitShare.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total earnings
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Advance History</CardTitle>
          <CardDescription>
            View and manage your cash advance requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advance #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advances.map((advance) => (
                <TableRow key={advance.id}>
                  <TableCell className="font-medium">
                    {advance.advanceNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {advance.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    ${advance.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${advance.outstandingAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(advance.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(advance.status)}
                        {advance.status}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(advance.requestedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewAdvance(advance)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {advances.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No advances found. Request your first advance to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Advance Modal */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Cash Advance</DialogTitle>
            <DialogDescription>
              Submit a request for cash advance. Maximum available: ${wallet?.availableCredit.toFixed(2) || '0.00'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Advance Type</Label>
              <Select 
                value={requestForm.type} 
                onValueChange={(value) => setRequestForm({...requestForm, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULFILLMENT">Fulfillment Costs</SelectItem>
                  <SelectItem value="RESOURCE">Resource/Tools</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={requestForm.amount}
                onChange={(e) => setRequestForm({...requestForm, amount: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Reason</Label>
              <Input
                value={requestForm.reason}
                onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                placeholder="Brief description of why you need this advance"
              />
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={requestForm.notes}
                onChange={(e) => setRequestForm({...requestForm, notes: e.target.value})}
                placeholder="Additional details or notes"
                rows={3}
              />
            </div>

            <div>
              <Label>Due Date (Optional)</Label>
              <Input
                type="date"
                value={requestForm.dueDate}
                onChange={(e) => setRequestForm({...requestForm, dueDate: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestAdvance}
              disabled={!requestForm.amount || !requestForm.reason}
            >
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Advance Details Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Advance Details</DialogTitle>
            <DialogDescription>
              {selectedAdvance?.advanceNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedAdvance && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Type</Label>
                  <p className="font-medium">{selectedAdvance.type}</p>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Badge variant={getStatusColor(selectedAdvance.status)}>
                    {selectedAdvance.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs">Amount</Label>
                  <p className="font-medium">${selectedAdvance.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-xs">Outstanding</Label>
                  <p className="font-medium">${selectedAdvance.outstandingAmount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-xs">Repaid</Label>
                  <p className="font-medium">${selectedAdvance.repaidAmount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-xs">Requested</Label>
                  <p className="font-medium">
                    {new Date(selectedAdvance.requestedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-xs">Reason</Label>
                <p className="font-medium">{selectedAdvance.reason}</p>
              </div>

              {selectedAdvance.notes && (
                <div>
                  <Label className="text-xs">Notes</Label>
                  <p className="text-sm">{selectedAdvance.notes}</p>
                </div>
              )}

              {selectedAdvance.approver && (
                <div>
                  <Label className="text-xs">Approved By</Label>
                  <p className="font-medium">{selectedAdvance.approver.name}</p>
                  {selectedAdvance.approvedAt && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(selectedAdvance.approvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {selectedAdvance.repayments.length > 0 && (
                <div>
                  <Label className="text-xs">Repayment History</Label>
                  <div className="mt-2 space-y-2">
                    {selectedAdvance.repayments.map((repayment: any) => (
                      <div key={repayment.id} className="border rounded p-2">
                        <div className="flex justify-between">
                          <span className="text-sm">${repayment.amount.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(repayment.repaymentDate).toLocaleDateString()}
                          </span>
                        </div>
                        {repayment.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{repayment.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}