'use client'

import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart,
  Eye,
  Download,
  Filter,
  MoreHorizontal,
  Calendar,
  Star,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Factory,
  Truck,
  Timer,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Zap
} from 'lucide-react'

const salesData = [
  { month: 'Jan', revenue: 4000, orders: 240, profit: 1200 },
  { month: 'Feb', revenue: 3000, orders: 198, profit: 900 },
  { month: 'Mar', revenue: 5000, orders: 320, profit: 1500 },
  { month: 'Apr', revenue: 4500, orders: 290, profit: 1350 },
  { month: 'May', revenue: 6000, orders: 380, profit: 1800 },
  { month: 'Jun', revenue: 5500, orders: 350, profit: 1650 }
]

const storePerformance = [
  { name: 'Etsy Store', value: 35, color: '#8884d8' },
  { name: 'Amazon', value: 30, color: '#82ca9d' },
  { name: 'Shopify', value: 20, color: '#ffc658' },
  { name: 'Direct Sales', value: 15, color: '#ff7300' }
]

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'John Smith',
    product: 'Summer Vibes T-Shirt',
    amount: 29.99,
    status: 'Processing',
    date: '2024-01-15'
  },
  {
    id: 'ORD-002', 
    customer: 'Sarah Johnson',
    product: 'Ocean Wave Design',
    amount: 34.99,
    status: 'Shipped',
    date: '2024-01-14'
  },
  {
    id: 'ORD-003',
    customer: 'Mike Davis',
    product: 'Mountain Peak Art',
    amount: 39.99,
    status: 'Delivered',
    date: '2024-01-13'
  },
  {
    id: 'ORD-004',
    customer: 'Emily Wilson',
    product: 'Abstract Colors',
    amount: 24.99,
    status: 'Processing',
    date: '2024-01-12'
  }
]

const topProducts = [
  { name: 'Summer Vibes T-Shirt', sales: 156, revenue: 4680, trend: 'up' },
  { name: 'Ocean Wave Design', sales: 132, revenue: 4620, trend: 'up' },
  { name: 'Mountain Peak Art', sales: 98, revenue: 3920, trend: 'down' },
  { name: 'Abstract Colors', sales: 87, revenue: 2175, trend: 'up' },
  { name: 'Sunset Paradise', sales: 64, revenue: 1920, trend: 'down' }
]

const bestSellerData = [
  { day: 'Mon', 'Summer Vibes': 23, 'Ocean Wave': 18, 'Mountain Peak': 12 },
  { day: 'Tue', 'Summer Vibes': 28, 'Ocean Wave': 22, 'Mountain Peak': 15 },
  { day: 'Wed', 'Summer Vibes': 31, 'Ocean Wave': 25, 'Mountain Peak': 14 },
  { day: 'Thu', 'Summer Vibes': 26, 'Ocean Wave': 20, 'Mountain Peak': 16 },
  { day: 'Fri', 'Summer Vibes': 35, 'Ocean Wave': 28, 'Mountain Peak': 18 },
  { day: 'Sat', 'Summer Vibes': 42, 'Ocean Wave': 32, 'Mountain Peak': 22 },
  { day: 'Sun', 'Summer Vibes': 38, 'Ocean Wave': 30, 'Mountain Peak': 20 }
]

const factorySLA = [
  { 
    name: 'PrintHub USA', 
    location: 'California',
    avgProcessing: 1.2,
    slaTarget: 2,
    performance: 98,
    orders: 456,
    status: 'operational'
  },
  { 
    name: 'FastPrint EU', 
    location: 'Germany',
    avgProcessing: 1.8,
    slaTarget: 2,
    performance: 94,
    orders: 312,
    status: 'operational'
  },
  { 
    name: 'QuickMerch Asia', 
    location: 'Singapore',
    avgProcessing: 2.4,
    slaTarget: 2,
    performance: 76,
    orders: 189,
    status: 'warning'
  },
  { 
    name: 'ExpressPOD UK', 
    location: 'London',
    avgProcessing: 1.5,
    slaTarget: 2,
    performance: 92,
    orders: 267,
    status: 'operational'
  }
]

const warnings = [
  {
    id: 1,
    type: 'critical',
    title: 'Low inventory alert',
    description: 'White T-Shirt XL running low (12 units left)',
    action: 'Reorder Stock',
    time: '10 minutes ago'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Factory SLA breach',
    description: 'QuickMerch Asia exceeding 2-day processing time',
    action: 'Contact Factory',
    time: '1 hour ago'
  },
  {
    id: 3,
    type: 'info',
    title: 'New design pending review',
    description: '5 designs awaiting approval',
    action: 'Review Designs',
    time: '2 hours ago'
  },
  {
    id: 4,
    type: 'warning',
    title: 'Payment verification needed',
    description: 'Order #ORD-892 requires manual verification',
    action: 'Verify Payment',
    time: '3 hours ago'
  }
]

const actionItems = [
  { task: 'Review Q1 financial report', priority: 'high', dueIn: '2 days' },
  { task: 'Approve new supplier contract', priority: 'medium', dueIn: '5 days' },
  { task: 'Update product pricing for summer sale', priority: 'high', dueIn: '1 day' },
  { task: 'Schedule team meeting for expansion plans', priority: 'low', dueIn: '1 week' },
  { task: 'Resolve customer complaint #CS-456', priority: 'high', dueIn: 'Today' }
]

export default function DemoPage() {
  return (
    <AdminLayout>
      <PageHeader 
        title="Admin Dashboard Demo" 
        description="UI components and theme preview for the fulfillment hub"
        action={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">$28,500</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                <span className="text-green-600 font-medium">+12.5%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">1,234</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                <span className="text-green-600 font-medium">+8.2%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">567</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                <span className="text-red-600 font-medium">-2.1%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">24</div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                <span className="text-green-600 font-medium">+2 new</span>
                <span className="ml-1">this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Revenue</CardTitle>
                  <CardDescription>Revenue trends over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Store Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Store Performance</CardTitle>
                  <CardDescription>Revenue distribution by platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={storePerformance}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {storePerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {storePerformance.map((store) => (
                      <div key={store.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: store.color }}
                          />
                          <span className="text-sm">{store.name}</span>
                        </div>
                        <span className="text-sm font-medium">{store.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders vs Profit Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Orders & Profit Trends</CardTitle>
                <CardDescription>Monthly order volume and profit margins</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="orders" fill="#8884d8" name="Orders" />
                    <Bar yAxisId="right" dataKey="profit" fill="#82ca9d" name="Profit ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest orders from all stores</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {order.id}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">{order.customer}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>${order.amount}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              order.status === 'Delivered' ? 'default' :
                              order.status === 'Shipped' ? 'secondary' :
                              'outline'
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top Performing Products</CardTitle>
                    <CardDescription>Best selling products this month</CardDescription>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                          <span className="text-sm font-medium">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">${product.revenue.toLocaleString()}</p>
                          <div className="flex items-center space-x-1">
                            {product.trend === 'up' ? (
                              <TrendingUp className="w-3 h-3 text-green-600" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-600" />
                            )}
                            <span className={`text-xs ${product.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {product.trend === 'up' ? '+' : '-'}5.2%
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Warnings and Action Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Warnings Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Alerts</CardTitle>
                <Badge variant="destructive" className="animate-pulse">
                  {warnings.filter(w => w.type === 'critical' || w.type === 'warning').length} Active
                </Badge>
              </div>
              <CardDescription>Requires immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {warnings.map((warning) => (
                  <div 
                    key={warning.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      warning.type === 'critical' && "border-red-200 bg-red-50",
                      warning.type === 'warning' && "border-yellow-200 bg-yellow-50",
                      warning.type === 'info' && "border-blue-200 bg-blue-50"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {warning.type === 'critical' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                        {warning.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                        {warning.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{warning.title}</h4>
                          <span className="text-xs text-muted-foreground">{warning.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{warning.description}</p>
                        <Button 
                          size="sm" 
                          className="mt-2"
                          variant={warning.type === 'critical' ? 'destructive' : 'outline'}
                        >
                          {warning.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Action Items</CardTitle>
              <CardDescription>Tasks requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {actionItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.priority === 'high' && "bg-red-500",
                        item.priority === 'medium' && "bg-yellow-500",
                        item.priority === 'low' && "bg-green-500"
                      )} />
                      <div>
                        <p className="text-sm font-medium">{item.task}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Due: {item.dueIn}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Best Seller Analytics */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Best Seller Analytics</CardTitle>
                <CardDescription>Weekly sales performance of top products</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  23% increase
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bestSellerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="Summer Vibes" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Ocean Wave" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ fill: '#82ca9d' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Mountain Peak" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  dot={{ fill: '#ffc658' }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-[#8884d8] rounded-full"></div>
                  <span className="text-sm font-medium">Summer Vibes</span>
                </div>
                <p className="text-2xl font-bold mt-1">223</p>
                <p className="text-xs text-muted-foreground">units this week</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-[#82ca9d] rounded-full"></div>
                  <span className="text-sm font-medium">Ocean Wave</span>
                </div>
                <p className="text-2xl font-bold mt-1">175</p>
                <p className="text-xs text-muted-foreground">units this week</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-[#ffc658] rounded-full"></div>
                  <span className="text-sm font-medium">Mountain Peak</span>
                </div>
                <p className="text-2xl font-bold mt-1">117</p>
                <p className="text-xs text-muted-foreground">units this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Factory SLA Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Factory SLA Performance</CardTitle>
                <CardDescription>Production partner metrics and compliance</CardDescription>
              </div>
              <Badge variant="outline">
                <Factory className="w-3 h-3 mr-1" />
                4 Active Factories
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {factorySLA.map((factory) => (
                <div key={factory.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{factory.name}</h4>
                        {factory.status === 'warning' ? (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            SLA Breach
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Operational
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{factory.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{factory.performance}%</p>
                      <p className="text-xs text-muted-foreground">SLA Performance</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="flex items-center space-x-1">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Avg Processing</span>
                      </div>
                      <p className="text-lg font-medium">{factory.avgProcessing} days</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <Zap className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">SLA Target</span>
                      </div>
                      <p className="text-lg font-medium">{factory.slaTarget} days</p>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Orders</span>
                      </div>
                      <p className="text-lg font-medium">{factory.orders}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all",
                        factory.performance >= 90 && "bg-green-500",
                        factory.performance >= 80 && factory.performance < 90 && "bg-yellow-500",
                        factory.performance < 80 && "bg-red-500"
                      )}
                      style={{ width: `${factory.performance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Component Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates across your stores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New order #ORD-001 received</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Design "Ocean Wave" approved</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Product "Summer Tee" updated</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">New team member added</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-16 flex-col">
                  <Package className="w-5 h-5 mb-1" />
                  <span className="text-xs">Add Product</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Star className="w-5 h-5 mb-1" />
                  <span className="text-xs">Upload Design</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Users className="w-5 h-5 mb-1" />
                  <span className="text-xs">Invite Team</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col">
                  <Activity className="w-5 h-5 mb-1" />
                  <span className="text-xs">View Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter Demo</CardTitle>
            <CardDescription>Interactive components for data filtering</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative flex-1">
                <Input 
                  placeholder="Search anything..." 
                  className="pl-10"
                />
                <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="home">Home & Living</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Badge Variants</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Button Variants</h4>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button size="sm">Primary</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="outline" size="sm">Outline</Button>
                  <Button variant="ghost" size="sm">Ghost</Button>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Status Indicators</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Error</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm">Inactive</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}