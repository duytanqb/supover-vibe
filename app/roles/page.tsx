"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  AlertCircle,
  Calendar,
  Users,
  Key
} from "lucide-react"
import Link from "next/link"

interface Role {
  id: string
  name: string
  code: string
  description?: string
  createdAt: string
  _count: {
    userRoles: number
    permissions: number
  }
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token")
      }

      const response = await fetch("/api/roles", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch roles")
      }

      const data = await response.json()
      setRoles(data.roles)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roles")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getRoleBadgeColor = (roleCode: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: "bg-red-100 text-red-800",
      ADMIN: "bg-purple-100 text-purple-800",
      SELLER: "bg-blue-100 text-blue-800",
      DESIGNER: "bg-pink-100 text-pink-800",
      FULFILLER: "bg-orange-100 text-orange-800",
      FINANCE: "bg-green-100 text-green-800",
      SUPPORT: "bg-indigo-100 text-indigo-800",
      LEADER: "bg-blue-100 text-blue-900",
    }
    return colors[roleCode] || "bg-gray-100 text-gray-800"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="Role Management" 
        description="Manage user roles and their permissions"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        }
      />

      <div className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Roles ({filteredRoles.length})</CardTitle>
                <CardDescription>
                  Manage system roles and their permissions
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
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
                  <TableHead>Role</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{role.name}</div>
                        {role.description && (
                          <div className="text-sm text-muted-foreground">
                            {role.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getRoleBadgeColor(role.code)}
                      >
                        {role.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{role._count.userRoles} users</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Key className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{role._count.permissions} permissions</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(role.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}