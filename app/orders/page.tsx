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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  Search,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  DollarSign,
  MapPin,
  Mail,
  User,
  Store,
  Palette,
  Hash,
  Eye,
  Copy,
  Calendar,
  Factory,
  FileText
} from 'lucide-react'

interface OrderItem {
  id: string
  productId: string
  quantity: number
  unitPrice: string | number
  totalPrice: string | number
  printSpecs?: any
  artworkData?: any
  metadata?: any
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
}

interface Fulfillment {
  id: string
  status: string
  factory?: {
    name: string
    code: string
  }
  createdAt: string
}

interface TeamMember {
  user: {
    id: string
    username: string
    name: string
  }
}

interface Order {
  id: string
  storeId: string
  orderNumber: string
  orderCode: string
  customerName: string
  customerEmail?: string
  status: string
  paymentStatus: string
  shippingAddress: any
  billingAddress?: any
  subtotal: string | number
  shippingCost: string | number
  tax: string | number
  discount: string | number
  total: string | number
  currency: string
  notes?: string
  metadata?: any
  createdAt: string
  store: {
    name: string
    platform: string
    team?: {
      id: string
      name: string
      members?: TeamMember[]
    }
  }
  items: OrderItem[]
  fulfillments?: Fulfillment[]
  _count: {
    items: number
    fulfillments: number
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [stores, setStores] = useState<any[]>([])

  useEffect(() => {
    fetchStores()
    fetchOrders()
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [searchTerm, selectedStatus, selectedStore])

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

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.set('orderNumber', searchTerm)
      if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus)
      if (selectedStore && selectedStore !== 'all') params.set('storeId', selectedStore)
      
      const response = await fetch(`/api/orders?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        setError(`Failed to fetch orders: ${response.status}`)
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numPrice)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />
      case 'PROCESSING': return <Package className="w-4 h-4" />
      case 'IN_PRODUCTION': return <Factory className="w-4 h-4" />
      case 'SHIPPED': return <Truck className="w-4 h-4" />
      case 'DELIVERED': return <CheckCircle className="w-4 h-4" />
      case 'CANCELLED': return <XCircle className="w-4 h-4" />
      case 'REFUNDED': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'CONFIRMED': return 'bg-blue-500'
      case 'PROCESSING': return 'bg-purple-500'
      case 'IN_PRODUCTION': return 'bg-orange-500'
      case 'SHIPPED': return 'bg-indigo-500'
      case 'DELIVERED': return 'bg-green-500'
      case 'CANCELLED': return 'bg-red-500'
      case 'REFUNDED': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'PAID': return 'bg-green-500'
      case 'FAILED': return 'bg-red-500'
      case 'REFUNDED': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getDesignStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500'
      case 'IN_REVIEW': return 'bg-blue-500'
      case 'APPROVED': return 'bg-green-500'
      case 'ARCHIVED': return 'bg-purple-500'
      case 'REJECTED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
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

  const getFulfillmentStatus = (order: Order) => {
    if (!order.fulfillments || order.fulfillments.length === 0) {
      return { status: 'NOT_STARTED', color: 'bg-gray-500' }
    }
    const latest = order.fulfillments[0]
    const statusColors: Record<string, string> = {
      'PENDING': 'bg-yellow-500',
      'IN_PRODUCTION': 'bg-blue-500',
      'QUALITY_CHECK': 'bg-purple-500',
      'READY': 'bg-indigo-500',
      'SHIPPED': 'bg-green-500',
      'FAILED': 'bg-red-500'
    }
    return { 
      status: latest.status, 
      color: statusColors[latest.status] || 'bg-gray-500',
      factory: latest.factory
    }
  }

  const hasDesigns = (order: Order) => {
    return order.items.some(item => item.design)
  }

  const getSellerName = (order: Order) => {
    const leader = order.store.team?.members?.[0]
    return leader?.user?.name || leader?.user?.username || 'N/A'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading orders...</div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-500">Error: {error}</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="Orders" 
        description="Manage and track all orders across your stores"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>
                {orders.length} orders found
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search order number..."
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
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
              
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
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Code</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Design</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const fulfillment = getFulfillmentStatus(order)
                const hasDesign = hasDesigns(order)
                
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {order.orderCode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(order.orderCode)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{order.orderNumber}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{order.store.name}</p>
                        <Badge variant="outline" className={`${getPlatformColor(order.store.platform)} text-white text-xs`}>
                          {order.store.platform}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{getSellerName(order)}</p>
                        <p className="text-xs text-muted-foreground">{order.store.team?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{order.customerName}</p>
                        {order.customerEmail && (
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={`${getStatusColor(order.status)} text-white`}>
                          <span className="flex items-center">
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </span>
                        </Badge>
                        <Badge className={`${getPaymentStatusColor(order.paymentStatus)} text-white text-xs`}>
                          <DollarSign className="w-3 h-3 mr-1" />
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge className={`${fulfillment.color} text-white text-xs`}>
                          {fulfillment.status}
                        </Badge>
                        {fulfillment.factory && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {fulfillment.factory.code}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {hasDesign ? (
                        <Badge className="bg-green-500 text-white">
                          <Palette className="w-3 h-3 mr-1" />
                          Has Design
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          No Design
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{formatPrice(order.total)}</p>
                        <p className="text-xs text-muted-foreground">
                          {order._count.items} items
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
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
              <p className="text-muted-foreground">
                {searchTerm || selectedStatus !== 'all' || selectedStore !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Orders will appear here when they are created'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Order Details - {selectedOrder?.orderCode}</span>
              <Badge className={`${getStatusColor(selectedOrder?.status || '')} text-white`}>
                {selectedOrder?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Order Number: {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <Tabs defaultValue="items" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>
              
              <TabsContent value="items" className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Order Items ({selectedOrder.items.length})
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Design</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.design ? (
                              <div className="flex items-center space-x-2">
                                {item.design.thumbnailUrl ? (
                                  <img
                                    src={item.design.thumbnailUrl}
                                    alt={item.design.name}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                                    <Palette className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-medium">{item.design.name}</p>
                                  <Badge className={`${getDesignStatusColor(item.design.status)} text-white text-xs`}>
                                    {item.design.status}
                                  </Badge>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">No design</span>
                            )}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatPrice(item.unitPrice)}</TableCell>
                          <TableCell className="font-medium">{formatPrice(item.totalPrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Item Metadata */}
                  {selectedOrder.items.some(item => item.metadata && Object.keys(item.metadata).length > 0) && (
                    <div className="mt-4">
                      <h5 className="text-sm font-semibold mb-2">Item Metadata</h5>
                      {selectedOrder.items.map((item, index) => (
                        item.metadata && Object.keys(item.metadata).length > 0 && (
                          <div key={item.id} className="mb-2">
                            <p className="text-xs text-muted-foreground mb-1">
                              {item.product.name} - Item {index + 1}
                            </p>
                            <div className="bg-muted p-2 rounded text-xs">
                              <pre className="overflow-x-auto">
                                {JSON.stringify(item.metadata, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Pricing Summary */}
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Pricing Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping:</span>
                      <span>{formatPrice(selectedOrder.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax:</span>
                      <span>{formatPrice(selectedOrder.tax)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount:</span>
                        <span className="text-red-500">-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="customer" className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{selectedOrder.customerName}</p>
                    </div>
                    {selectedOrder.customerEmail && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{selectedOrder.customerEmail}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Shipping Address
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>{selectedOrder.shippingAddress.name || selectedOrder.customerName}</p>
                    <p className="text-muted-foreground">{selectedOrder.shippingAddress.address1 || selectedOrder.shippingAddress.line1}</p>
                    {(selectedOrder.shippingAddress.address2 || selectedOrder.shippingAddress.line2) && (
                      <p className="text-muted-foreground">{selectedOrder.shippingAddress.address2 || selectedOrder.shippingAddress.line2}</p>
                    )}
                    <p className="text-muted-foreground">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip || selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p className="text-muted-foreground">{selectedOrder.shippingAddress.country}</p>
                    {selectedOrder.shippingAddress.phone && (
                      <p className="text-muted-foreground">Phone: {selectedOrder.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="fulfillment" className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Factory className="w-4 h-4 mr-2" />
                    Fulfillment Information
                  </h4>
                  {selectedOrder.fulfillments && selectedOrder.fulfillments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOrder.fulfillments.map((fulfillment) => (
                        <div key={fulfillment.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={`${getFulfillmentStatus(selectedOrder).color} text-white`}>
                              {fulfillment.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(fulfillment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {fulfillment.factory && (
                            <div className="text-sm">
                              <p>Factory: {fulfillment.factory.name}</p>
                              <p className="text-muted-foreground">Code: {fulfillment.factory.code}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No fulfillment information available</p>
                  )}
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Store className="w-4 h-4 mr-2" />
                    Store & Seller Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Store:</span>
                      <p className="font-medium">{selectedOrder.store.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Platform:</span>
                      <Badge variant="outline" className={`${getPlatformColor(selectedOrder.store.platform)} text-white`}>
                        {selectedOrder.store.platform}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Team:</span>
                      <p className="font-medium">{selectedOrder.store.team?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Seller:</span>
                      <p className="font-medium">{getSellerName(selectedOrder)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="metadata" className="space-y-4">
                {selectedOrder.metadata && Object.keys(selectedOrder.metadata).length > 0 ? (
                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      Order Metadata
                    </h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(selectedOrder.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No metadata available for this order
                  </div>
                )}
                
                {selectedOrder.notes && (
                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Order Notes
                    </h4>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}