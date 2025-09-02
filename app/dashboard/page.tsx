"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { StatsCard } from '@/components/layout/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ImpersonationBanner } from "@/components/ui/impersonation-banner"
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Factory,
  Palette,
  HeadphonesIcon,
  Crown,
  LogOut,
  AlertCircle,
  Shield,
  Key,
  Lock,
  TrendingUp,
  Zap,
  CheckCircle,
  Clock,
  Plus
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  roles: string[]
  team?: {
    id: string
    name: string
  }
  isImpersonating?: boolean
  adminUser?: {
    id: string
    name: string
    email: string
  }
  impersonationSession?: {
    id: string
    reason: string
    expiresAt: Date
    startedAt: Date
  }
}

const roleConfigs = {
  ADMIN: {
    title: "Admin Dashboard",
    description: "Full system access and management",
    icon: Crown,
    color: "text-purple-600",
    cards: [
      { title: "User Management", description: "Manage users and permissions", icon: Users, href: "/users" },
      { title: "User Impersonation", description: "Impersonate users for support", icon: Shield, href: "/admin/impersonate" },
      { title: "Team Management", description: "Manage teams and members", icon: Users, href: "/teams" },
      { title: "Role Management", description: "Manage roles and permissions", icon: Settings, href: "/roles" },
      { title: "Permission Management", description: "Manage system permissions", icon: Settings, href: "/permissions" },
      { title: "Analytics", description: "View system analytics", icon: BarChart3, href: "/analytics" },
      { title: "Financial Overview", description: "View financial reports", icon: DollarSign, href: "/finance" },
    ]
  },
  SELLER: {
    title: "Seller Dashboard",
    description: "Manage your stores and orders",
    icon: ShoppingCart,
    color: "text-blue-600",
    cards: [
      { title: "My Stores", description: "Manage your stores", icon: ShoppingCart, href: "/stores" },
      { title: "Orders", description: "Track and manage orders", icon: Package, href: "/orders" },
      { title: "Products", description: "Manage your products", icon: Package, href: "/products" },
      { title: "Analytics", description: "View sales analytics", icon: BarChart3, href: "/analytics" },
    ]
  },
  DESIGNER: {
    title: "Designer Dashboard",
    description: "Manage design assets and projects",
    icon: Palette,
    color: "text-pink-600",
    cards: [
      { title: "Design Library", description: "Manage design assets", icon: Palette, href: "/designs" },
      { title: "Projects", description: "Track design projects", icon: Package, href: "/projects" },
      { title: "Templates", description: "Create and manage templates", icon: Settings, href: "/templates" },
    ]
  },
  FULFILLER: {
    title: "Fulfillment Dashboard",
    description: "Manage factory operations",
    icon: Factory,
    color: "text-orange-600",
    cards: [
      { title: "Production Queue", description: "Manage production orders", icon: Factory, href: "/production" },
      { title: "Factories", description: "Manage factory operations", icon: Settings, href: "/factories" },
      { title: "Quality Control", description: "Quality assurance tracking", icon: Package, href: "/quality" },
    ]
  },
  FINANCE: {
    title: "Finance Dashboard",
    description: "Financial operations and reporting",
    icon: DollarSign,
    color: "text-green-600",
    cards: [
      { title: "P&L Reports", description: "Profit and loss analysis", icon: BarChart3, href: "/finance/reports" },
      { title: "Transactions", description: "View all transactions", icon: DollarSign, href: "/finance/transactions" },
      { title: "Billing", description: "Manage billing and invoices", icon: Package, href: "/finance/billing" },
    ]
  },
  SUPPORT: {
    title: "Support Dashboard",
    description: "Customer support operations",
    icon: HeadphonesIcon,
    color: "text-indigo-600",
    cards: [
      { title: "Tickets", description: "Manage support tickets", icon: HeadphonesIcon, href: "/support/tickets" },
      { title: "Knowledge Base", description: "Manage help articles", icon: Package, href: "/support/kb" },
      { title: "Live Chat", description: "Handle live support", icon: Users, href: "/support/chat" },
    ]
  },
  LEADER: {
    title: "Team Leader Dashboard",
    description: "Team management and oversight",
    icon: Users,
    color: "text-blue-700",
    cards: [
      { title: "Team Overview", description: "Monitor team performance", icon: Users, href: "/team" },
      { title: "Team Analytics", description: "View team metrics", icon: BarChart3, href: "/team/analytics" },
      { title: "Member Management", description: "Manage team members", icon: Settings, href: "/team/members" },
    ]
  },
  SUPER_ADMIN: {
    title: "System Administrator",
    description: "Full system control and management",
    icon: Shield,
    color: "text-red-600",
    cards: [
      { title: "System Settings", description: "Configure system settings", icon: Settings, href: "/settings" },
      { title: "User Management", description: "Manage all users", icon: Users, href: "/users" },
      { title: "User Impersonation", description: "Impersonate users for support", icon: Shield, href: "/admin/impersonate" },
      { title: "Team Management", description: "Manage all teams", icon: Shield, href: "/teams" },
      { title: "Role Management", description: "Configure roles", icon: Key, href: "/roles" },
      { title: "Permission Management", description: "Configure permissions", icon: Lock, href: "/permissions" },
      { title: "Analytics Dashboard", description: "System-wide analytics", icon: BarChart3, href: "/analytics" },
    ]
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Authentication failed")
        }
        return res.json()
      })
      .then((data) => {
        setUser(data.user)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setIsLoading(false)
        localStorage.removeItem("token")
        router.push("/login")
      })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("impersonationToken")
    localStorage.removeItem("originalToken")
    router.push("/login")
  }

  const handleEndImpersonation = async () => {
    if (!user?.impersonationSession) return
    
    try {
      const response = await fetch(`/api/admin/impersonate?sessionToken=${user.impersonationSession.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const originalToken = localStorage.getItem('originalToken')
        if (originalToken) {
          localStorage.setItem('token', originalToken)
          localStorage.removeItem('originalToken')
          localStorage.removeItem('impersonationToken')
          window.location.reload()
        }
      }
    } catch (error) {
      console.error('Error ending impersonation:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || "Failed to load user data"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const primaryRole = user.roles[0] || "SELLER"
  const config = roleConfigs[primaryRole as keyof typeof roleConfigs] || roleConfigs.SELLER
  const IconComponent = config.icon

  return (
    <AdminLayout>
      {user.isImpersonating && user.adminUser && user.impersonationSession && (
        <ImpersonationBanner
          adminUser={user.adminUser}
          targetUser={user}
          impersonationSession={user.impersonationSession}
          onEndImpersonation={handleEndImpersonation}
        />
      )}
      
      <PageHeader 
        title={`Welcome back, ${user.name}!`}
        description={`Here's what's happening with your ${primaryRole.toLowerCase()} operations`}
        badge={primaryRole}
        badgeVariant="outline"
      />

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Orders"
          value="1,247"
          description="This month"
          icon={<ShoppingCart className="h-6 w-6" />}
          trend={{ value: 12.5, label: "vs last month", positive: true }}
        />
        <StatsCard
          title="Products"
          value="156"
          description="Active catalog"
          icon={<Package className="h-6 w-6" />}
          trend={{ value: 8.2, label: "vs last month", positive: true }}
        />
        <StatsCard
          title="Designs"
          value="89"
          description="Ready for auto-fulfillment"
          icon={<Palette className="h-6 w-6" />}
          trend={{ value: 15.3, label: "vs last month", positive: true }}
        />
        <StatsCard
          title="Revenue"
          value="$24,580"
          description="This month"
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 18.7, label: "vs last month", positive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Access Cards */}
        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
          {config.cards.map((card, index) => {
            const CardIcon = card.icon
            return (
              <Link key={index} href={card.href}>
                <Card className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <CardIcon className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 mb-3">{card.description}</p>
                    <Button variant="ghost" size="sm" className="p-0 h-auto text-blue-600 hover:text-blue-700">
                      Access →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Auto-fulfillment health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Order Processing</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Factory Integration</span>
              </div>
              <Badge className="bg-green-100 text-green-700">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Design Matching</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-700">Processing</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Info Section */}
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <Badge variant="outline">{user.roles.join(", ")}</Badge>
              </div>
              {user.team && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Team</span>
                  <span className="font-medium">{user.team.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Logged in successfully</p>
                  <p className="text-xs text-gray-500">Just now</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Dashboard accessed</p>
                  <p className="text-xs text-gray-500">Today</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}