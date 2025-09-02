'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Palette,
  Store,
  Users,
  Settings,
  Factory,
  TrendingUp,
  Bell,
  Search,
  Menu,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  Zap,
  Building2,
  Boxes,
  Layers
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  description: string
  badge?: string
  subItems?: NavigationItem[]
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & analytics'
  },
  {
    name: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    description: 'Order management',
    badge: 'Auto'
  },
  {
    name: 'Products',
    href: '/products',
    icon: Package,
    description: 'Product catalog'
  },
  {
    name: 'Designs',
    href: '/designs',
    icon: Palette,
    description: 'Design library'
  },
  {
    name: 'Stores',
    href: '/stores',
    icon: Store,
    description: 'Channel management'
  },
  {
    name: 'Factories',
    href: '/factories',
    icon: Factory,
    description: 'Production partners',
    subItems: [
      {
        name: 'Factory Names',
        href: '/factories/names',
        icon: Building2,
        description: 'Manage factory profiles'
      },
      {
        name: 'Supplier Variants',
        href: '/factories/supplier-variants',
        icon: Boxes,
        description: 'Supplier product variants'
      },
      {
        name: 'System Variants',
        href: '/factories/system-variants',
        icon: Layers,
        description: 'System variant mapping'
      }
    ]
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    description: 'Reports & insights'
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: Users,
    description: 'Team management'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System configuration'
  }
]

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Factories'])

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-100">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Fulfillment Hub</h1>
                <p className="text-xs text-gray-500">POD Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col px-3">
            <ul role="list" className="flex flex-1 flex-col gap-y-4">
              <li>
                <ul role="list" className="space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      {item.subItems ? (
                        <div>
                          <button
                            onClick={() => toggleExpanded(item.name)}
                            className={cn(
                              'group flex gap-x-3 rounded-lg px-3 py-2 text-sm leading-6 font-medium transition-all duration-150 w-full',
                              isActive(item.href)
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            )}
                          >
                            <item.icon
                              className={cn(
                                'h-5 w-5 shrink-0 transition-colors',
                                isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                              )}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span>{item.name}</span>
                                <ChevronRight
                                  className={cn(
                                    'h-4 w-4 transition-transform duration-200',
                                    expandedItems.includes(item.name) && 'rotate-90'
                                  )}
                                />
                              </div>
                              {isActive(item.href) && expandedItems.includes(item.name) && (
                                <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                              )}
                            </div>
                          </button>
                          {expandedItems.includes(item.name) && (
                            <ul className="mt-1 ml-8 space-y-1">
                              {item.subItems.map((subItem) => (
                                <li key={subItem.name}>
                                  <Link
                                    href={subItem.href}
                                    className={cn(
                                      'group flex gap-x-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150',
                                      isActive(subItem.href)
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    )}
                                  >
                                    <subItem.icon
                                      className={cn(
                                        'h-4 w-4 shrink-0 transition-colors',
                                        isActive(subItem.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                                      )}
                                    />
                                    <span>{subItem.name}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            'group flex gap-x-3 rounded-lg px-3 py-2 text-sm leading-6 font-medium transition-all duration-150',
                            isActive(item.href)
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          )}
                        >
                          <item.icon
                            className={cn(
                              'h-5 w-5 shrink-0 transition-colors',
                              isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                            )}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span>{item.name}</span>
                              {item.badge && (
                                <Badge variant="secondary" className={cn(
                                  "ml-2 text-xs",
                                  isActive(item.href) ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                                )}>
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            {isActive(item.href) && (
                              <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="lg:hidden fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
            {/* Mobile Logo */}
            <div className="flex h-16 shrink-0 items-center">
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Fulfillment Hub</h1>
                  <p className="text-xs text-gray-500">POD Management</p>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        {item.subItems ? (
                          <div>
                            <button
                              onClick={() => toggleExpanded(item.name)}
                              className={cn(
                                'group flex gap-x-3 rounded-lg px-3 py-2 text-sm leading-6 font-medium transition-all duration-150 w-full',
                                isActive(item.href)
                                  ? 'bg-gray-900 text-white'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              )}
                            >
                              <item.icon
                                className={cn(
                                  'h-5 w-5 shrink-0 transition-colors',
                                  isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                                )}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span>{item.name}</span>
                                  <ChevronRight
                                    className={cn(
                                      'h-4 w-4 transition-transform duration-200',
                                      expandedItems.includes(item.name) && 'rotate-90'
                                    )}
                                  />
                                </div>
                              </div>
                            </button>
                            {expandedItems.includes(item.name) && (
                              <ul className="mt-1 ml-8 space-y-1">
                                {item.subItems.map((subItem) => (
                                  <li key={subItem.name}>
                                    <Link
                                      href={subItem.href}
                                      onClick={() => setSidebarOpen(false)}
                                      className={cn(
                                        'group flex gap-x-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150',
                                        isActive(subItem.href)
                                          ? 'bg-gray-800 text-white'
                                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                      )}
                                    >
                                      <subItem.icon
                                        className={cn(
                                          'h-4 w-4 shrink-0 transition-colors',
                                          isActive(subItem.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                                        )}
                                      />
                                      <span>{subItem.name}</span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              'group flex gap-x-3 rounded-lg px-3 py-2 text-sm leading-6 font-medium transition-all duration-150',
                              isActive(item.href)
                                ? 'bg-gray-900 text-white'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            )}
                          >
                            <item.icon
                              className={cn(
                                'h-5 w-5 shrink-0 transition-colors',
                                isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                              )}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span>{item.name}</span>
                                {item.badge && (
                                  <Badge variant="secondary" className={cn(
                                    "ml-2 text-xs",
                                    isActive(item.href) ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                                  )}>
                                    {item.badge}
                                  </Badge>
                                )}
                              </div>
                              {isActive(item.href) && (
                                <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                              )}
                            </div>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm px-4 sm:gap-x-6 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="font-medium text-gray-900">
                  {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                </span>
                <span className="text-gray-400">
                  {navigation.find(item => isActive(item.href))?.description}
                </span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Search */}
            <div className="hidden sm:flex items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  className="block h-9 w-64 rounded-lg border-0 bg-gray-50 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-900 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">admin@company.com</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}