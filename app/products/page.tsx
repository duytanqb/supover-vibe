'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Package, 
  Search, 
  Plus,
  Edit,
  ShoppingBag,
  Star,
  MessageSquare,
  DollarSign
} from 'lucide-react'

interface Product {
  id: string
  storeId: string
  sku: string
  name: string
  description?: string
  basePrice: string | number
  costPrice: string | number
  weight?: string | number
  category?: string
  tags: string[]
  isActive: boolean
  createdAt: string
  store: {
    id: string
    name: string
    platform: string
  }
  _count: {
    orderItems: number
    designs: number
  }
}

interface Store {
  id: string
  name: string
  platform: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    fetchStores()
    fetchProducts()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedStore, selectedStatus])

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('name', searchTerm)
      if (selectedStore && selectedStore !== 'all') params.set('storeId', selectedStore)
      if (selectedStatus && selectedStatus !== 'all') params.set('isActive', selectedStatus)
      
      const response = await fetch(`/api/products?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        console.error('Failed to fetch products:', response.status)
        setProducts([])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numPrice)
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'TIKTOK_SHOP': return 'bg-pink-500'
      case 'SHOPIFY': return 'bg-green-500'
      case 'ETSY': return 'bg-orange-500'
      case 'AMAZON': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const calculateMargin = (basePrice: string | number, costPrice: string | number) => {
    const base = typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice
    const cost = typeof costPrice === 'string' ? parseFloat(costPrice) : costPrice
    if (cost === 0) return 100
    return ((base - cost) / base * 100).toFixed(1)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading products...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="Products" 
        description="Manage your product catalog across all stores"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Catalog</CardTitle>
              <CardDescription>
                {products.length} products across {stores.length} stores
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.category && (
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.store.name}</p>
                      <Badge variant="outline" className={`${getPlatformColor(product.store.platform)} text-white text-xs`}>
                        {product.store.platform}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm">{product.sku}</code>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatPrice(product.basePrice)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(product.costPrice)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {calculateMargin(product.basePrice, product.costPrice)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="flex items-center" title="Orders">
                        <ShoppingBag className="w-3 h-3 mr-1" />
                        {product._count.orderItems}
                      </div>
                      <div className="flex items-center" title="Designs">
                        <Package className="w-3 h-3 mr-1" />
                        {product._count.designs}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedStore || selectedStatus ? 'Try adjusting your filters' : 'Start by adding your first product'}
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}