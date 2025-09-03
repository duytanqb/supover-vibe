'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, 
  Store, Users, Activity, RefreshCw, Download, Calendar,
  AlertCircle, CheckCircle, Clock, Factory
} from 'lucide-react'

interface KPIData {
  totalRevenue: number
  avgOrderValue: number
  totalOrders: number
  todayOrders: number
  pendingOrders: number
  activeStores: number
  activeProducts: number
  revenueGrowth: string
}

interface TopPerformer {
  id: string
  name: string
  revenue?: number
  orderCount?: number
  soldQuantity?: number
  sku?: string
  platform?: string
  team?: string
}

interface TrendData {
  date: string
  value: number
}

interface PlatformData {
  platform: string
  count: number
}

interface DashboardData {
  kpis: KPIData
  topPerformers: {
    stores: TopPerformer[]
    products: TopPerformer[]
    sellers: TopPerformer[]
  }
  trends: {
    revenue: TrendData[]
    orders: TrendData[]
  }
  platformBreakdown: PlatformData[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [aggregating, setAggregating] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [period])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/executive?period=${period}`)
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerAggregation = async () => {
    try {
      setAggregating(true)
      const response = await fetch('/api/analytics/aggregate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 })
      })
      
      if (response.ok) {
        await fetchDashboardData()
      }
    } catch (error) {
      console.error('Error triggering aggregation:', error)
    } finally {
      setAggregating(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  const KPICard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue',
    prefix = '',
    suffix = ''
  }: any) => {
    const isPositive = change && parseFloat(change) > 0
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {prefix}{value}{suffix}
          </div>
          {change && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="ml-1">from last month</span>
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading analytics...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p>Failed to load analytics data</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="Analytics Dashboard" 
        description="Real-time business intelligence and analytics"
        action={
          <div className="flex items-center space-x-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={triggerAggregation}
              disabled={aggregating}
            >
              {aggregating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh Data</span>
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(data.kpis.totalRevenue)}
          change={data.kpis.revenueGrowth}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Total Orders"
          value={formatNumber(data.kpis.totalOrders)}
          icon={ShoppingCart}
          color="blue"
        />
        <KPICard
          title="Average Order Value"
          value={formatCurrency(data.kpis.avgOrderValue)}
          icon={Activity}
          color="purple"
        />
        <KPICard
          title="Pending Orders"
          value={formatNumber(data.kpis.pendingOrders)}
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.trends.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Volume</CardTitle>
            <CardDescription>Daily orders over selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends.orders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => formatNumber(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>Store distribution by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.platformBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.platform}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.platformBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>System overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Stores</span>
                  <Badge variant="outline">{data.kpis.activeStores}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Products</span>
                  <Badge variant="outline">{data.kpis.activeProducts}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Today's Orders</span>
                  <Badge className="bg-green-500 text-white">{data.kpis.todayOrders}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Orders</span>
                  <Badge className="bg-yellow-500 text-white">{data.kpis.pendingOrders}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Revenue Growth</span>
                  <Badge className={parseFloat(data.kpis.revenueGrowth) > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                    {data.kpis.revenueGrowth}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Order Value</span>
                  <Badge variant="outline">{formatCurrency(data.kpis.avgOrderValue)}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Tabs defaultValue="stores" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stores">Top Stores</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="sellers">Top Sellers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stores">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Stores</CardTitle>
              <CardDescription>Stores ranked by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPerformers.stores.map((store, index) => (
                  <div key={store.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{store.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {store.platform} • {store.orderCount} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(store.revenue || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Products ranked by sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPerformers.products.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku} • {product.soldQuantity} sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(product.revenue || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Sellers</CardTitle>
              <CardDescription>Team leaders ranked by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topPerformers.sellers.map((seller, index) => (
                  <div key={seller.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{seller.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {seller.team} • {seller.orderCount} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(seller.revenue || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  )
}