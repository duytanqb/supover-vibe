"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  AlertCircle
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
}

const roleConfigs = {
  ADMIN: {
    title: "Admin Dashboard",
    description: "Full system access and management",
    icon: Crown,
    color: "text-purple-600",
    cards: [
      { title: "User Management", description: "Manage users and permissions", icon: Users, href: "/users" },
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
    router.push("/login")
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
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <IconComponent className={`h-8 w-8 ${config.color}`} />
              <div>
                <h1 className="text-2xl font-bold">{config.title}</h1>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.team && (
                  <p className="text-xs text-muted-foreground">Team: {user.team.name}</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your {primaryRole.toLowerCase()} operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {config.cards.map((card, index) => {
            const CardIcon = card.icon
            return (
              <Link key={index} href={card.href}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    <CardIcon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                    <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                      Access →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Overview of your key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active since</span>
                  <span className="font-medium">
                    {new Date(user.id).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Role</span>
                  <span className="font-medium">{user.roles.join(", ")}</span>
                </div>
                {user.team && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Team</span>
                    <span className="font-medium">{user.team.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Logged in successfully</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Account created</p>
                    <p className="text-xs text-muted-foreground">Today</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}