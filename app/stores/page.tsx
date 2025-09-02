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
import { Plus, Store, ExternalLink, Settings, Search, Package, ShoppingCart, Edit, MoreHorizontal } from 'lucide-react'

const createStoreSchema = z.object({
  teamId: z.string().cuid(),
  name: z.string().min(1, 'Store name is required'),
  platform: z.enum(['TIKTOK_SHOP', 'SHOPIFY', 'ETSY', 'AMAZON', 'CUSTOM']),
  storeUrl: z.string().url().optional().or(z.literal('')),
  sellerId: z.string().optional(),
  region: z.string().optional(),
  currency: z.string().default('USD')
})

type CreateStoreData = z.infer<typeof createStoreSchema>

interface Store {
  id: string
  name: string
  platform: string
  storeUrl?: string
  sellerId?: string
  region?: string
  currency: string
  isActive: boolean
  createdAt: string
  team: {
    name: string
  }
  _count: {
    products: number
    orders: number
  }
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateStoreData>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      currency: 'USD'
    }
  })

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CreateStoreData) => {
    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const newStore = await response.json()
        setStores(prev => [newStore, ...prev])
        setIsCreateDialogOpen(false)
        reset()
      } else {
        const error = await response.json()
        console.error('Error creating store:', error)
      }
    } catch (error) {
      console.error('Error creating store:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading stores...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.platform.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      TIKTOK_SHOP: 'bg-pink-100 text-pink-800',
      SHOPIFY: 'bg-green-100 text-green-800',
      ETSY: 'bg-orange-100 text-orange-800',
      AMAZON: 'bg-yellow-100 text-yellow-800',
      CUSTOM: 'bg-gray-100 text-gray-800'
    }
    return colors[platform] || 'bg-gray-100 text-gray-800'
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="Stores" 
        description="Manage your sales channels and integrations"
        action={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Store
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
              <DialogDescription>
                Connect a new sales channel to your fulfillment hub
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="My Store"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select onValueChange={(value) => setValue('platform', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TIKTOK_SHOP">TikTok Shop</SelectItem>
                    <SelectItem value="SHOPIFY">Shopify</SelectItem>
                    <SelectItem value="ETSY">Etsy</SelectItem>
                    <SelectItem value="AMAZON">Amazon</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
                {errors.platform && (
                  <p className="text-sm text-red-500">{errors.platform.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="storeUrl">Store URL (Optional)</Label>
                <Input
                  id="storeUrl"
                  {...register('storeUrl')}
                  placeholder="https://mystore.shopify.com"
                />
                {errors.storeUrl && (
                  <p className="text-sm text-red-500">{errors.storeUrl.message}</p>
                )}
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
                  <Label htmlFor="region">Region (Optional)</Label>
                  <Input
                    id="region"
                    {...register('region')}
                    placeholder="US"
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
                  {isSubmitting ? 'Creating...' : 'Create Store'}
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
              <CardTitle>Store Channels ({filteredStores.length})</CardTitle>
              <CardDescription>
                Active sales channels connected to your fulfillment hub
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
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
                <TableHead>Store Name</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Store className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{store.name}</p>
                        {store.storeUrl && (
                          <a 
                            href={store.storeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Visit Store
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlatformColor(store.platform)}>
                      {store.platform.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{store.team.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span>{store._count.products}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                      <span>{store._count.orders}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={store.isActive ? 'default' : 'secondary'}>
                      {store.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(store.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredStores.length === 0 && (
            <div className="text-center py-12">
              <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No stores found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search' : 'Connect your first sales channel to start processing orders'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Store
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}