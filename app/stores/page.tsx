'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Store, ExternalLink, Settings } from 'lucide-react'

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

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case 'TIKTOK_SHOP': return 'bg-pink-500'
      case 'SHOPIFY': return 'bg-green-500'
      case 'ETSY': return 'bg-orange-500'
      case 'AMAZON': return 'bg-yellow-600'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return <div className="p-6">Loading stores...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stores</h1>
          <p className="text-muted-foreground">Manage your sales channels and integrations</p>
        </div>
        
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
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <Card key={store.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Store className="w-5 h-5" />
                  <CardTitle className="text-lg">{store.name}</CardTitle>
                </div>
                <Badge 
                  className={`${getPlatformBadgeColor(store.platform)} text-white`}
                >
                  {store.platform.replace('_', ' ')}
                </Badge>
              </div>
              <CardDescription>Team: {store.team.name}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Products</p>
                  <p className="font-medium">{store._count.products}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Orders</p>
                  <p className="font-medium">{store._count.orders}</p>
                </div>
              </div>
              
              {store.storeUrl && (
                <div className="flex items-center space-x-2 text-sm">
                  <ExternalLink className="w-4 h-4" />
                  <a 
                    href={store.storeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Visit Store
                  </a>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2">
                <Badge variant={store.isActive ? 'default' : 'secondary'}>
                  {store.isActive ? 'Active' : 'Inactive'}
                </Badge>
                
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {stores.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No stores yet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your first sales channel to start processing orders
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Store
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}