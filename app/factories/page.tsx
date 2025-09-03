'use client'

import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Factory, 
  Package, 
  MapPin, 
  Cpu, 
  CheckCircle, 
  XCircle,
  Plus,
  Eye,
  Edit,
  Settings,
  RefreshCw,
  Star,
  Phone,
  Mail,
  Globe,
  Building,
  Clock,
  DollarSign,
  Code
} from 'lucide-react'

interface FactoryData {
  id: string
  name: string
  code: string
  supplierType: string
  companyName?: string
  website?: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  currency: string
  paymentTerms?: string
  minimumOrder?: number
  leadTime?: number
  capacity: number
  isActive: boolean
  isPrimary: boolean
  capabilities: string[]
  printMethods: string[]
  apiEndpoint?: string
  qualityRating?: number
  certifications: string[]
  createdAt: string
  _count: {
    fulfillments: number
    supplierVariants: number
    factoryProducts: number
    locations: number
  }
  locations?: Array<{
    id: string
    locationName: string
    locationType: string
    locationCode: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
    country: string
    contactName?: string
    contactEmail?: string
    contactPhone?: string
    capabilities: string[]
    capacity?: number
    shippingZones: string[]
    isDefault: boolean
    isActive: boolean
  }>
}

export default function FactoriesPage() {
  const [factories, setFactories] = useState<FactoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedFactory, setSelectedFactory] = useState<FactoryData | null>(null)
  const [editingFactory, setEditingFactory] = useState<FactoryData | null>(null)

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    supplierType: '',
    companyName: '',
    website: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    paymentTerms: '',
    minimumOrder: '',
    leadTime: '',
    capacity: '',
    qualityRating: '',
    isActive: true,
    isPrimary: false
  })

  useEffect(() => {
    fetchFactories()
  }, [])

  const fetchFactories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/factories?includeLocations=true')
      if (response.ok) {
        const data = await response.json()
        setFactories(data.factories)
      }
    } catch (error) {
      console.error('Error fetching factories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewFactory = (factory: FactoryData) => {
    setSelectedFactory(factory)
    setViewModalOpen(true)
  }

  const handleEditFactory = (factory: FactoryData) => {
    setEditingFactory(factory)
    setFormData({
      name: factory.name,
      code: factory.code,
      supplierType: factory.supplierType,
      companyName: factory.companyName || '',
      website: factory.website || '',
      contactName: factory.contactName || '',
      contactEmail: factory.contactEmail || '',
      contactPhone: factory.contactPhone || '',
      paymentTerms: factory.paymentTerms || '',
      minimumOrder: factory.minimumOrder?.toString() || '',
      leadTime: factory.leadTime?.toString() || '',
      capacity: factory.capacity.toString(),
      qualityRating: factory.qualityRating?.toString() || '',
      isActive: factory.isActive,
      isPrimary: factory.isPrimary
    })
    setEditModalOpen(true)
  }

  const handleSaveFactory = async () => {
    if (!editingFactory) return

    try {
      const response = await fetch(`/api/factories/${editingFactory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          minimumOrder: formData.minimumOrder ? parseFloat(formData.minimumOrder) : null,
          leadTime: formData.leadTime ? parseInt(formData.leadTime) : null,
          capacity: parseInt(formData.capacity),
          qualityRating: formData.qualityRating ? parseFloat(formData.qualityRating) : null
        })
      })

      if (response.ok) {
        await fetchFactories()
        setEditModalOpen(false)
        setEditingFactory(null)
      }
    } catch (error) {
      console.error('Error updating factory:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading factories...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="Factory Management" 
        description="Manage suppliers and their fulfillment capabilities"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/factories/system-variants'}>
              <Code className="h-4 w-4 mr-2" />
              System Variants
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/factories/supplier-variants'}>
              <Factory className="h-4 w-4 mr-2" />
              Supplier Variants
            </Button>
            <Button onClick={() => setEditModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Factory
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Suppliers & Factories</CardTitle>
          <CardDescription>
            Manage your fulfillment partners and their capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Capabilities</TableHead>
                <TableHead>Mappings</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {factories.map((factory) => (
                <TableRow key={factory.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{factory.name}</p>
                          {factory.isPrimary && (
                            <Badge className="bg-yellow-500 text-white text-xs">Primary</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {factory.companyName || factory.code}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{factory.supplierType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {factory.contactName && (
                        <p className="text-sm font-medium">{factory.contactName}</p>
                      )}
                      {factory.contactEmail && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{factory.contactEmail}</p>
                        </div>
                      )}
                      {factory.contactPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{factory.contactPhone}</p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{factory._count.locations}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {factory.capabilities.slice(0, 3).map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                        ))}
                        {factory.capabilities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{factory.capabilities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <span className="font-medium">{factory._count.supplierVariants}</span>
                      <p className="text-xs text-muted-foreground">variants</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {factory.qualityRating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm">{factory.qualityRating}/5</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={factory.isActive ? 'default' : 'secondary'}>
                      {factory.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewFactory(factory)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditFactory(factory)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {factories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No factories configured yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Factory Detail Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              {selectedFactory?.name}
              {selectedFactory?.isPrimary && (
                <Badge className="bg-yellow-500 text-white">Primary</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedFactory?.supplierType} • {selectedFactory?.companyName}
            </DialogDescription>
          </DialogHeader>

          {selectedFactory && (
            <div className="grid gap-6">
              {/* Supplier Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Company Name</Label>
                      <p className="text-sm">{selectedFactory.companyName || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Supplier Code</Label>
                      <p className="text-sm font-mono">{selectedFactory.code}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Badge variant="outline">{selectedFactory.supplierType}</Badge>
                    </div>
                    {selectedFactory.website && (
                      <div>
                        <Label className="text-xs">Website</Label>
                        <div className="flex items-center gap-2">
                          <Globe className="h-3 w-3" />
                          <a href={selectedFactory.website} target="_blank" rel="noopener" 
                             className="text-sm text-blue-600 hover:underline">
                            {selectedFactory.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contact & Terms</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedFactory.contactName && (
                      <div>
                        <Label className="text-xs">Primary Contact</Label>
                        <p className="text-sm font-medium">{selectedFactory.contactName}</p>
                      </div>
                    )}
                    {selectedFactory.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm">{selectedFactory.contactEmail}</p>
                      </div>
                    )}
                    {selectedFactory.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm">{selectedFactory.contactPhone}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs">Payment Terms</Label>
                      <p className="text-sm">{selectedFactory.paymentTerms || 'Not specified'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Lead Time</Label>
                        <p className="text-sm">{selectedFactory.leadTime ? `${selectedFactory.leadTime} days` : 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Min Order</Label>
                        <p className="text-sm">{selectedFactory.minimumOrder ? `$${selectedFactory.minimumOrder}` : 'No minimum'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Capabilities and Quality */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Product Types</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedFactory.capabilities.map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs">{cap}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Print Methods</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedFactory.printMethods.map((method) => (
                          <Badge key={method} variant="secondary" className="text-xs">{method}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Daily Capacity</Label>
                      <p className="text-sm">{selectedFactory.capacity.toLocaleString()} units</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quality & Certifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedFactory.qualityRating && (
                      <div>
                        <Label className="text-xs">Quality Rating</Label>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{selectedFactory.qualityRating}/5.0</span>
                        </div>
                      </div>
                    )}
                    {selectedFactory.certifications.length > 0 && (
                      <div>
                        <Label className="text-xs">Certifications</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedFactory.certifications.map((cert) => (
                            <Badge key={cert} variant="outline" className="text-xs">{cert}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs">Statistics</Label>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Locations: {selectedFactory._count.locations}</div>
                        <div>Products: {selectedFactory._count.factoryProducts}</div>
                        <div>Mappings: {selectedFactory._count.supplierVariants}</div>
                        <div>Fulfillments: {selectedFactory._count.fulfillments}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Locations */}
              {selectedFactory.locations && selectedFactory.locations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Locations ({selectedFactory.locations.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedFactory.locations.map((location) => (
                        <div key={location.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{location.locationName}</span>
                              {location.isDefault && (
                                <Badge className="bg-green-500 text-white text-xs">Default</Badge>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">{location.locationType}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <p>{location.addressLine1}</p>
                            <p>{location.city}, {location.state} {location.country}</p>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Capacity: {location.capacity?.toLocaleString() || 'N/A'}/day</span>
                            <Badge variant={location.isActive ? 'default' : 'secondary'} className="text-xs">
                              {location.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Factory Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFactory ? 'Edit Factory' : 'Add New Factory'}
            </DialogTitle>
            <DialogDescription>
              Configure supplier information and capabilities
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Gearment"
                />
              </div>
              <div>
                <Label>Supplier Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="e.g., GEAR"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier Type</Label>
                <Select value={formData.supplierType} onValueChange={(value) => setFormData({...formData, supplierType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUFACTURER">Manufacturer</SelectItem>
                    <SelectItem value="PRINTER">Printer</SelectItem>
                    <SelectItem value="DISTRIBUTOR">Distributor</SelectItem>
                    <SelectItem value="FULFILLMENT_CENTER">Fulfillment Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Company Name</Label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  placeholder="Legal company name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Website</Label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={formData.contactName}
                  onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                  placeholder="Primary contact person"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  placeholder="orders@supplier.com"
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                  placeholder="+1-555-000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Payment Terms</Label>
                <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({...formData, paymentTerms: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREPAID">Prepaid</SelectItem>
                    <SelectItem value="NET_15">Net 15</SelectItem>
                    <SelectItem value="NET_30">Net 30</SelectItem>
                    <SelectItem value="NET_60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lead Time (days)</Label>
                <Input
                  type="number"
                  value={formData.leadTime}
                  onChange={(e) => setFormData({...formData, leadTime: e.target.value})}
                  placeholder="3"
                />
              </div>
              <div>
                <Label>Min Order ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.minimumOrder}
                  onChange={(e) => setFormData({...formData, minimumOrder: e.target.value})}
                  placeholder="50.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Daily Capacity</Label>
                <Input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder="10000"
                />
              </div>
              <div>
                <Label>Quality Rating</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.qualityRating}
                  onChange={(e) => setFormData({...formData, qualityRating: e.target.value})}
                  placeholder="4.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <Label htmlFor="isActive">Active Supplier</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({...formData, isPrimary: e.target.checked})}
                />
                <Label htmlFor="isPrimary">Primary Supplier</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            {editingFactory && (
              <Button onClick={handleSaveFactory}>
                Save Changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}