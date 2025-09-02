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
  Key, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  AlertCircle,
  Calendar,
  Shield,
  Database
} from "lucide-react"
import Link from "next/link"

interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description?: string
  createdAt: string
  _count: {
    roles: number
  }
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No authentication token")
      }

      const response = await fetch("/api/permissions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch permissions")
      }

      const data = await response.json()
      setPermissions(data.permissions)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load permissions")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (permission.description && permission.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      read: "bg-blue-100 text-blue-800",
      write: "bg-green-100 text-green-800",
      delete: "bg-red-100 text-red-800",
    }
    return colors[action] || "bg-gray-100 text-gray-800"
  }

  const getResourceBadgeColor = (resource: string) => {
    const colors: Record<string, string> = {
      users: "bg-purple-100 text-purple-800",
      stores: "bg-blue-100 text-blue-800",
      orders: "bg-orange-100 text-orange-800",
      finance: "bg-green-100 text-green-800",
      reports: "bg-indigo-100 text-indigo-800",
    }
    return colors[resource] || "bg-gray-100 text-gray-800"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="Permission Management" 
        description="Manage system permissions and access controls"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Permission
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
                <CardTitle>Permissions ({filteredPermissions.length})</CardTitle>
                <CardDescription>
                  Manage system permissions and access controls
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
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
                  <TableHead>Permission</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Assigned Roles</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        {permission.description && (
                          <div className="text-sm text-muted-foreground">
                            {permission.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getResourceBadgeColor(permission.resource)}
                      >
                        <Database className="h-3 w-3 mr-1" />
                        {permission.resource}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getActionBadgeColor(permission.action)}
                      >
                        {permission.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Shield className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{permission._count.roles} roles</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(permission.createdAt).toLocaleDateString()}
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