'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users, Search, Eye, Clock, Shield, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const impersonateSchema = z.object({
  targetUserId: z.string().cuid(),
  reason: z.string().min(5, 'Please provide a detailed reason (min 5 characters)'),
  duration: z.number().min(1).max(480).default(60)
})

type ImpersonateData = z.infer<typeof impersonateSchema>

interface User {
  id: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
  userRoles: Array<{
    role: {
      name: string
      code: string
    }
  }>
  teamMember?: {
    team: {
      name: string
    }
  }
}

interface ImpersonationSession {
  id: string
  reason: string
  startedAt: string
  expiresAt: string
  isActive: boolean
  adminUser: {
    name: string
    email: string
  }
  targetUser: {
    name: string
    email: string
  }
}

export default function ImpersonatePage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [sessions, setSessions] = useState<ImpersonationSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isImpersonateDialogOpen, setIsImpersonateDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ImpersonateData>({
    resolver: zodResolver(impersonateSchema),
    defaultValues: {
      duration: 60
    }
  })

  useEffect(() => {
    fetchUsers()
    fetchActiveSessions()
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [searchTerm])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      
      const response = await fetch(`/api/users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveSessions = async () => {
    try {
      const response = await fetch('/api/admin/impersonate/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const onSubmit = async (data: ImpersonateData) => {
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        
        localStorage.setItem('impersonationToken', result.impersonationToken)
        localStorage.setItem('originalToken', localStorage.getItem('token') || '')
        localStorage.setItem('token', result.impersonationToken)
        
        setIsImpersonateDialogOpen(false)
        reset()
        setSelectedUser(null)
        
        router.push('/dashboard')
      } else {
        const error = await response.json()
        console.error('Error starting impersonation:', error)
        alert(error.error || 'Failed to start impersonation')
      }
    } catch (error) {
      console.error('Error starting impersonation:', error)
      alert('Failed to start impersonation')
    }
  }

  const endSession = async (sessionToken: string) => {
    try {
      const response = await fetch(`/api/admin/impersonate?sessionToken=${sessionToken}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        fetchActiveSessions()
      }
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const openImpersonateDialog = (user: User) => {
    setSelectedUser(user)
    setValue('targetUserId', user.id)
    setIsImpersonateDialogOpen(true)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-500'
      case 'ADMIN': return 'bg-purple-500'
      case 'SELLER': return 'bg-blue-500'
      case 'DESIGNER': return 'bg-pink-500'
      case 'FULFILLER': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const canImpersonate = (user: User) => {
    const hasRestrictedRole = user.userRoles.some(ur => 
      ['SUPER_ADMIN'].includes(ur.role.code)
    )
    return !hasRestrictedRole
  }

  if (loading) {
    return <div className="p-6">Loading users...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Impersonation</h1>
          <p className="text-muted-foreground">View the system as another user for support and debugging</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Admin Only
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    Select a user to impersonate
                  </CardDescription>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {user.teamMember?.team.name || 'No team'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {user.userRoles.map((ur) => (
                            <Badge
                              key={ur.role.code}
                              className={`${getRoleBadgeColor(ur.role.code)} text-white text-xs`}
                            >
                              {ur.role.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {user.lastLoginAt 
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openImpersonateDialog(user)}
                          disabled={!user.isActive || !canImpersonate(user)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Impersonate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Currently active impersonation sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No active sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{session.targetUser.name}</p>
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>Admin: {session.adminUser.name}</p>
                        <p>Reason: {session.reason}</p>
                        <p>Expires: {new Date(session.expiresAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isImpersonateDialogOpen} onOpenChange={setIsImpersonateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Impersonation</DialogTitle>
            <DialogDescription>
              You are about to impersonate {selectedUser?.name}. This action is logged and monitored.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-yellow-800 font-medium">Security Notice</p>
              </div>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• All actions will be logged and audited</li>
                <li>• Session will automatically expire</li>
                <li>• You can end the session at any time</li>
                <li>• Only use for legitimate support purposes</li>
              </ul>
            </div>
            
            <div>
              <Label htmlFor="reason">Reason for Impersonation</Label>
              <Input
                id="reason"
                {...register('reason')}
                placeholder="e.g., Debugging user's order issue, providing customer support..."
              />
              {errors.reason && (
                <p className="text-sm text-red-500">{errors.reason.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="duration">Session Duration (minutes)</Label>
              <Select onValueChange={(value) => setValue('duration', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="text-sm text-red-500">{errors.duration.message}</p>
              )}
            </div>
            
            {selectedUser && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Target User:</p>
                <p className="text-sm">{selectedUser.name} ({selectedUser.email})</p>
                <div className="flex space-x-1 mt-1">
                  {selectedUser.userRoles.map((ur) => (
                    <Badge
                      key={ur.role.code}
                      className={`${getRoleBadgeColor(ur.role.code)} text-white text-xs`}
                    >
                      {ur.role.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsImpersonateDialogOpen(false)
                  setSelectedUser(null)
                  reset()
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? 'Starting...' : 'Start Impersonation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}