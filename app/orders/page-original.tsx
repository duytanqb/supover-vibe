'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Play, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  Package,
  Zap
} from 'lucide-react'


interface Order {
  id: string
  orderNumber: string
  customerId?: string
  customerName: string
  customerEmail?: string
  status: string
  paymentStatus: string
  total: string | number  // Prisma Decimal type comes as string
  currency: string
  createdAt: string
  store: {
    name: string
    platform: string
    team: {
      name: string
    }
  }
  items: Array<{
    id: string
    quantity: number
    unitPrice: string | number  // Prisma Decimal type comes as string
    product: {
      name: string
      sku: string
    }
    design?: {
      id: string
      name: string
      status: string
      thumbnailUrl?: string
    }
  }>
  fulfillments: Array<{
    id: string
    status: string
    factory: {
      name: string
      code: string
    }
  }>
  _count: {
    items: number
    fulfillments: number
  }
}

interface Store {
  id: string
  name: string
  platform: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedStore, setSelectedStore] = useState<string>('')
  const [processingOrder, setProcessingOrder] = useState<string | null>(null)

  useEffect(() => {
    fetchStores()
    fetchOrders()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [searchTerm, selectedStatus, selectedStore])

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const response = await fetch('/api/stores', {
        headers
      })
      if (response.ok) {
        const data = await response.json()
        setStores(data)
      } else {
        console.error('Failed to fetch stores:', response.status)
        setStores([])
      }
    } catch (error) {
      console.error('Error fetching stores:', error)
      setStores([])
    }
  }

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('orderNumber', searchTerm)
      if (selectedStatus) params.set('status', selectedStatus)
      if (selectedStore) params.set('storeId', selectedStore)
      
      const token = localStorage.getItem('token')
      const headers: HeadersInit = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/orders?${params.toString()}`, {
        headers
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Orders API response:', data)
        setOrders(data.orders || [])
      } else {
        console.error('Failed to fetch orders:', response.status)
        setOrders([])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const processOrder = async (orderId: string) => {
    setProcessingOrder(orderId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/orders/process', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, autoFulfill: true })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Order processed:', result)
        fetchOrders()
      } else {
        const error = await response.json()
        console.error('Error processing order:', error)
      }
    } catch (error) {
      console.error('Error processing order:', error)
    } finally {
      setProcessingOrder(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'PROCESSING': return <Play className="w-4 h-4" />
      case 'IN_PRODUCTION': return <Package className="w-4 h-4" />
      case 'SHIPPED': return <Truck className="w-4 h-4" />
      case 'DELIVERED': return <CheckCircle className="w-4 h-4" />
      case 'CANCELLED': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'PROCESSING': return 'bg-blue-500'
      case 'IN_PRODUCTION': return 'bg-purple-500'
      case 'SHIPPED': return 'bg-green-500'
      case 'DELIVERED': return 'bg-green-600'
      case 'CANCELLED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const formatPrice = (price: number | string, currency: string = 'USD') => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(numPrice)
  }

  const canAutoProcess = (order: Order) => {
    const items = Array.isArray(order.items) ? order.items : []
    return order.status === 'PENDING' && items.every(item => !item.design)
  }

  if (loading) {
    return <div className="p-6">Loading orders...</div>
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="Orders" 
        description="Monitor and process orders with auto-fulfillment"
        badge="Auto-Processing"
        badgeVariant="secondary"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                {orders.length} orders across all channels
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search orders..."
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
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
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
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Auto-Fulfillment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const items = Array.isArray(order.items) ? order.items : []
                const hasDesigns = items.some(item => item.design) || false
                const allDesignsArchived = items.every(item => 
                  item.design?.status === 'ARCHIVED'
                ) || false
                
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        {order.customerEmail && (
                          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.store?.name || 'Unknown Store'}</p>
                        <Badge variant="outline" className="text-xs">
                          {order.store?.platform || 'Unknown'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          {order.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{order._count?.items || 0} items</p>
                        {hasDesigns && (
                          <p className="text-muted-foreground">
                            {items.filter(item => item.design).length || 0} with designs
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatPrice(order.total || 0, order.currency || 'USD')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {allDesignsArchived ? (
                          <Badge className="bg-green-500 text-white">
                            <Zap className="w-3 h-3 mr-1" />
                            Ready
                          </Badge>
                        ) : hasDesigns ? (
                          <Badge variant="secondary">
                            Partial
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            None
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {canAutoProcess(order) && (
                          <Button
                            size="sm"
                            onClick={() => processOrder(order.id)}
                            disabled={processingOrder === order.id}
                          >
                            {processingOrder === order.id ? (
                              'Processing...'
                            ) : (
                              <>
                                <Zap className="w-4 h-4 mr-1" />
                                Process
                              </>
                            )}
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {orders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedStatus || selectedStore ? 'Try adjusting your filters' : 'Orders will appear here once customers start purchasing'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  )
}