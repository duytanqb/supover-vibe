'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
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
import { Plus, Palette, Search, Eye, Archive, CheckCircle, Clock, XCircle } from 'lucide-react'

const createDesignSchema = z.object({
  teamId: z.string().cuid(),
  name: z.string().min(1, 'Design name is required'),
  fileUrl: z.string().url('Valid file URL is required'),
  printReadyFile: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  designerId: z.string().optional(),
  sellerId: z.string().optional(),
  tags: z.string().optional()
})

type CreateDesignData = z.infer<typeof createDesignSchema>

interface Design {
  id: string
  name: string
  fingerprint: string
  fileUrl: string
  printReadyFile?: string
  thumbnailUrl?: string
  status: string
  designerId?: string
  sellerId?: string
  tags: string[]
  createdAt: string
  archivedAt?: string
  team: {
    name: string
  }
  _count: {
    orderItems: number
    fulfillments: number
  }
}

interface Team {
  id: string
  name: string
}

export default function DesignsPage() {
  const [designs, setDesigns] = useState<Design[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateDesignData>({
    resolver: zodResolver(createDesignSchema)
  })

  useEffect(() => {
    fetchTeams()
    fetchDesigns()
  }, [])

  useEffect(() => {
    fetchDesigns()
  }, [searchTerm, selectedStatus, selectedTeam])

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/teams', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // Handle both array and object responses
        setTeams(Array.isArray(data) ? data : data.teams || [])
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const fetchDesigns = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus)
      if (selectedTeam && selectedTeam !== 'all') params.set('teamId', selectedTeam)
      
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/designs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // API returns array directly, not wrapped in object
        setDesigns(Array.isArray(data) ? data : data.designs || [])
      }
    } catch (error) {
      console.error('Error fetching designs:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CreateDesignData) => {
    try {
      const formData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
      }
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newDesign = await response.json()
        setDesigns(prev => [newDesign, ...prev])
        setIsCreateDialogOpen(false)
        reset()
      } else {
        const error = await response.json()
        console.error('Error creating design:', error)
      }
    } catch (error) {
      console.error('Error creating design:', error)
    }
  }

  const updateDesignStatus = async (designId: string, status: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/designs/${designId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        fetchDesigns()
      }
    } catch (error) {
      console.error('Error updating design status:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Clock className="w-4 h-4" />
      case 'IN_REVIEW': return <Eye className="w-4 h-4" />
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />
      case 'ARCHIVED': return <Archive className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500'
      case 'IN_REVIEW': return 'bg-blue-500'
      case 'APPROVED': return 'bg-green-500'
      case 'ARCHIVED': return 'bg-purple-500'
      case 'REJECTED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return <div className="p-6">Loading designs...</div>
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="Design Library" 
        description="Manage designs and enable auto-fulfillment"
        action={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Design
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Design</DialogTitle>
                <DialogDescription>
                  Upload a new design to your library
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teamId">Team</Label>
                    <Select onValueChange={(value) => setValue('teamId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.teamId && (
                      <p className="text-sm text-red-500">{errors.teamId.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="name">Design Name</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Summer Collection Design"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="fileUrl">Design File URL</Label>
                  <Input
                    id="fileUrl"
                    {...register('fileUrl')}
                    placeholder="https://cdn.example.com/design.ai"
                  />
                  {errors.fileUrl && (
                    <p className="text-sm text-red-500">{errors.fileUrl.message}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="printReadyFile">Print-Ready File (Optional)</Label>
                    <Input
                      id="printReadyFile"
                      {...register('printReadyFile')}
                      placeholder="https://cdn.example.com/print-ready.pdf"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
                    <Input
                      id="thumbnailUrl"
                      {...register('thumbnailUrl')}
                      placeholder="https://cdn.example.com/thumb.jpg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sellerId">Seller ID (Optional)</Label>
                    <Input
                      id="sellerId"
                      {...register('sellerId')}
                      placeholder="seller123"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      {...register('tags')}
                      placeholder="summer, tropical, t-shirt"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Design'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Design Library</CardTitle>
              <CardDescription>
                {designs.length} designs ready for auto-fulfillment
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search designs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All teams</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Design</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Fingerprint</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designs.map((design) => (
                <TableRow key={design.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {design.thumbnailUrl ? (
                        <img
                          src={design.thumbnailUrl}
                          alt={design.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <Palette className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{design.name}</p>
                        {design.tags?.length > 0 && (
                          <div className="flex space-x-1 mt-1">
                            {design.tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {design.tags?.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(design.tags?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{design.team?.name || 'No Team'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(design.status)}
                      <Badge className={`${getStatusColor(design.status)} text-white`}>
                        {design.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{design._count?.orderItems || 0} orders</p>
                      <p className="text-muted-foreground">{design._count?.fulfillments || 0} fulfillments</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {design.fingerprint}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {new Date(design.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {design.status === 'APPROVED' && (
                        <Button
                          size="sm"
                          onClick={() => updateDesignStatus(design.id, 'ARCHIVED')}
                        >
                          <Archive className="w-4 h-4 mr-1" />
                          Archive
                        </Button>
                      )}
                      {design.status === 'DRAFT' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateDesignStatus(design.id, 'IN_REVIEW')}
                        >
                          Review
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {designs.length === 0 && (
            <div className="text-center py-12">
              <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No designs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || (selectedStatus !== 'all') || (selectedTeam !== 'all') ? 'Try adjusting your filters' : 'Upload your first design to enable auto-fulfillment'}
              </p>
              {!searchTerm && selectedStatus === 'all' && selectedTeam === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Your First Design
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}