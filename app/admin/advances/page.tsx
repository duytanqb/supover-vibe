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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Wallet, 
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  Clock,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Send,
  Users,
  FileText
} from 'lucide-react'

interface Advance {
  id: string
  advanceNumber: string
  type: string
  amount: number
  status: string
  reason: string
  notes?: string
  rejectionNote?: string
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
  rejector?: {
    id: string
    name: string
    email: string
  }
  repayments: any[]
}

export default function AdminAdvancesPage() {
  const [advances, setAdvances] = useState<Advance[]>([])
  const [loading, setLoading] = useState(true)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [disburseModalOpen, setDisburseModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedAdvance, setSelectedAdvance] = useState<Advance | null>(null)
  const [rejectionNote, setRejectionNote] = useState('')
  const [approvalNotes, setApprovalNotes] = useState('')
  const [disburseNotes, setDisburseNotes] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  // Stats
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalDisbursed: 0,
    totalOutstanding: 0
  })

  useEffect(() => {
    fetchAdvances()
  }, [])

  const fetchAdvances = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/advances', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAdvances(data.advances)
        calculateStats(data.advances)
      }
    } catch (error) {
      console.error('Error fetching advances:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (advances: Advance[]) => {
    const stats = {
      totalPending: advances.filter(a => a.status === 'PENDING').length,
      totalApproved: advances.filter(a => a.status === 'APPROVED').length,
      totalDisbursed: advances.filter(a => a.status === 'DISBURSED').length,
      totalOutstanding: advances
        .filter(a => ['DISBURSED', 'PARTIALLY_REPAID', 'OUTSTANDING'].includes(a.status))
        .reduce((sum, a) => sum + a.outstandingAmount, 0)
    }
    setStats(stats)
  }

  const handleApprove = async () => {
    if (!selectedAdvance) return

    try {
      const response = await fetch(`/api/advances/${selectedAdvance.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes: approvalNotes })
      })

      if (response.ok) {
        setApproveModalOpen(false)
        setApprovalNotes('')
        fetchAdvances()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to approve advance')
      }
    } catch (error) {
      console.error('Error approving advance:', error)
      alert('Failed to approve advance')
    }
  }

  const handleReject = async () => {
    if (!selectedAdvance || !rejectionNote) return

    try {
      const response = await fetch(`/api/advances/${selectedAdvance.id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rejectionNote })
      })

      if (response.ok) {
        setRejectModalOpen(false)
        setRejectionNote('')
        fetchAdvances()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to reject advance')
      }
    } catch (error) {
      console.error('Error rejecting advance:', error)
      alert('Failed to reject advance')
    }
  }

  const handleDisburse = async () => {
    if (!selectedAdvance) return

    try {
      const response = await fetch(`/api/advances/${selectedAdvance.id}/disburse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ notes: disburseNotes })
      })

      if (response.ok) {
        setDisburseModalOpen(false)
        setDisburseNotes('')
        fetchAdvances()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to disburse advance')
      }
    } catch (error) {
      console.error('Error disbursing advance:', error)
      alert('Failed to disburse advance')
    }
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

  const filteredAdvances = advances.filter(advance => {
    switch (activeTab) {
      case 'pending':
        return advance.status === 'PENDING'
      case 'approved':
        return advance.status === 'APPROVED'
      case 'disbursed':
        return ['DISBURSED', 'PARTIALLY_REPAID', 'OUTSTANDING'].includes(advance.status)
      case 'completed':
        return ['REPAID', 'REJECTED', 'CANCELLED'].includes(advance.status)
      default:
        return true
    }
  })

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
        title="Advance Management" 
        description="Review and approve cash advance requests"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApproved}</div>
            <p className="text-xs text-muted-foreground">
              Ready to disburse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDisbursed}</div>
            <p className="text-xs text-muted-foreground">
              Disbursed advances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total outstanding
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advances Table with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Advance Requests</CardTitle>
          <CardDescription>
            Review and process cash advance requests from sellers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending">Pending ({stats.totalPending})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({stats.totalApproved})</TabsTrigger>
              <TabsTrigger value="disbursed">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Advance #</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdvances.map((advance) => (
                    <TableRow key={advance.id}>
                      <TableCell className="font-medium">
                        {advance.advanceNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{advance.user.name}</p>
                          <p className="text-xs text-muted-foreground">{advance.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {advance.team.code}
                        </Badge>
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
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedAdvance(advance)
                              setViewModalOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {advance.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600"
                                onClick={() => {
                                  setSelectedAdvance(advance)
                                  setApproveModalOpen(true)
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedAdvance(advance)
                                  setRejectModalOpen(true)
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {advance.status === 'APPROVED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600"
                              onClick={() => {
                                setSelectedAdvance(advance)
                                setDisburseModalOpen(true)
                              }}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredAdvances.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No advances found in this category
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approve Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Advance</DialogTitle>
            <DialogDescription>
              Approve advance request {selectedAdvance?.advanceNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedAdvance && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Seller</Label>
                  <p className="font-medium">{selectedAdvance.user.name}</p>
                </div>
                <div>
                  <Label className="text-xs">Amount</Label>
                  <p className="font-medium">${selectedAdvance.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-xs">Type</Label>
                  <p className="font-medium">{selectedAdvance.type}</p>
                </div>
                <div>
                  <Label className="text-xs">Team</Label>
                  <p className="font-medium">{selectedAdvance.team.name}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs">Reason</Label>
                <p className="text-sm">{selectedAdvance.reason}</p>
              </div>

              <div>
                <Label>Approval Notes (Optional)</Label>
                <Textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add any notes about this approval"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              Approve Advance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Advance</DialogTitle>
            <DialogDescription>
              Reject advance request {selectedAdvance?.advanceNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedAdvance && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Seller</Label>
                  <p className="font-medium">{selectedAdvance.user.name}</p>
                </div>
                <div>
                  <Label className="text-xs">Amount</Label>
                  <p className="font-medium">${selectedAdvance.amount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <Label className="text-xs">Reason</Label>
                <p className="text-sm">{selectedAdvance.reason}</p>
              </div>

              <div>
                <Label>Rejection Reason (Required)</Label>
                <Textarea
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="Explain why this advance is being rejected"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReject} 
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectionNote}
            >
              Reject Advance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disburse Modal */}
      <Dialog open={disburseModalOpen} onOpenChange={setDisburseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disburse Advance</DialogTitle>
            <DialogDescription>
              Disburse funds for advance {selectedAdvance?.advanceNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedAdvance && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Seller</Label>
                  <p className="font-medium">{selectedAdvance.user.name}</p>
                </div>
                <div>
                  <Label className="text-xs">Amount</Label>
                  <p className="font-medium">${selectedAdvance.amount.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <Label>Disbursement Notes (Optional)</Label>
                <Textarea
                  value={disburseNotes}
                  onChange={(e) => setDisburseNotes(e.target.value)}
                  placeholder="Add any notes about this disbursement"
                  rows={3}
                />
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  By clicking disburse, you confirm that ${selectedAdvance.amount.toFixed(2)} 
                  will be made available to the seller.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDisburseModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDisburse} className="bg-blue-600 hover:bg-blue-700">
              Disburse Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
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
                  <Label className="text-xs">Seller</Label>
                  <p className="font-medium">{selectedAdvance.user.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedAdvance.user.email}</p>
                </div>
                <div>
                  <Label className="text-xs">Team</Label>
                  <p className="font-medium">{selectedAdvance.team.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedAdvance.team.code}</p>
                </div>
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

              {selectedAdvance.rejectionNote && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <Label className="text-xs text-red-800">Rejection Reason</Label>
                  <p className="text-sm text-red-800">{selectedAdvance.rejectionNote}</p>
                  {selectedAdvance.rejector && (
                    <p className="text-xs text-red-600 mt-1">
                      By {selectedAdvance.rejector.name}
                    </p>
                  )}
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

              {selectedAdvance.disbursedAt && (
                <div>
                  <Label className="text-xs">Disbursed At</Label>
                  <p className="text-sm">
                    {new Date(selectedAdvance.disbursedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}