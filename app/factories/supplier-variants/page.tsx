'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { AdminLayout } from '@/components/layout/admin-layout'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Package, 
  Factory,
  Plus,
  Eye,
  Edit,
  RefreshCw,
  ArrowLeft,
  Code,
  Link2,
  Download
} from 'lucide-react'

interface SupplierVariant {
  id: string
  factoryId: string
  systemVariantCode: string
  supplierProductCode: string
  supplierVariantCode: string
  supplierSku: string
  supplierName: string
  size?: string
  color?: string
  material?: string
  style?: string
  supplierPrice: number
  minimumQuantity: number
  leadTime?: number
  isAvailable: boolean
  lastSyncedAt?: string
  factory: {
    id: string
    name: string
    code: string
    isActive: boolean
  }
  systemVariant?: {
    id: string
    code: string
    name: string
    product: {
      id: string
      name: string
      sku: string
    }
  }
}

export default function SupplierVariantsPage() {
  const searchParams = useSearchParams()
  const [supplierVariants, setSupplierVariants] = useState<SupplierVariant[]>([])
  const [systemVariants, setSystemVariants] = useState<any[]>([])
  const [factories, setFactories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<SupplierVariant | null>(null)

  // Form state for new supplier variant
  const [supplierForm, setSupplierForm] = useState({
    factoryId: '',
    systemVariantCode: searchParams?.get('system') || '',
    supplierProductCode: '',
    supplierVariantCode: '',
    supplierSku: '',
    supplierName: '',
    size: '',
    color: '',
    material: '',
    style: '',
    supplierPrice: '',
    minimumQuantity: '1',
    leadTime: ''
  })

  useEffect(() => {
    fetchSupplierVariants()
    fetchSystemVariants()
    fetchFactories()
    
    // Pre-fill form if adding from system variant
    const addCode = searchParams?.get('add')
    if (addCode) {
      setSupplierForm(prev => ({ ...prev, systemVariantCode: addCode }))
      setAddModalOpen(true)
    }
  }, [searchParams])

  const fetchSupplierVariants = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/variants/mappings')
      if (response.ok) {
        const data = await response.json()
        setSupplierVariants(data.supplierVariants)
      }
    } catch (error) {
      console.error('Error fetching supplier variants:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemVariants = async () => {
    try {
      const response = await fetch('/api/variants')
      if (response.ok) {
        const data = await response.json()
        setSystemVariants(data.systemVariants)
      }
    } catch (error) {
      console.error('Error fetching system variants:', error)
    }
  }

  const fetchFactories = async () => {
    try {
      const response = await fetch('/api/factories')
      if (response.ok) {
        const data = await response.json()
        setFactories(data.factories)
      }
    } catch (error) {
      console.error('Error fetching factories:', error)
    }
  }

  const handleViewVariant = (variant: SupplierVariant) => {
    setSelectedVariant(variant)
    setViewModalOpen(true)
  }

  const handleAddVariant = () => {
    setAddModalOpen(true)
  }

  const handleSaveSupplierVariant = async () => {
    try {
      const response = await fetch('/api/variants/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...supplierForm,
          supplierPrice: parseFloat(supplierForm.supplierPrice),
          minimumQuantity: parseInt(supplierForm.minimumQuantity),
          leadTime: supplierForm.leadTime ? parseInt(supplierForm.leadTime) : null
        })
      })

      if (response.ok) {
        await fetchSupplierVariants()
        setAddModalOpen(false)
      }
    } catch (error) {
      console.error('Error creating supplier variant:', error)
    }
  }

  const filteredVariants = searchParams?.get('system') 
    ? supplierVariants.filter(v => v.systemVariantCode === searchParams.get('system'))
    : supplierVariants

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading supplier variants...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="Supplier Variants" 
        description="Supplier-specific variant definitions mapped to system variants"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/factories'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Factories
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/factories/system-variants'}>
              <Code className="h-4 w-4 mr-2" />
              System Variants
            </Button>
            <Button onClick={handleAddVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier Variant
            </Button>
          </div>
        }
      />

      {searchParams?.get('system') && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Filtered by System Variant:</span>
                <Badge variant="outline" className="font-mono font-bold text-blue-600">
                  {searchParams.get('system')}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/factories/supplier-variants'}
              >
                Clear Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Supplier Variants</CardTitle>
          <CardDescription>
            Factory-specific variants imported from suppliers, mapped to system variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>System Code</TableHead>
                <TableHead>Supplier Details</TableHead>
                <TableHead>Supplier SKU</TableHead>
                <TableHead>Attributes</TableHead>
                <TableHead>Pricing & Terms</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVariants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{variant.factory.name}</p>
                        <p className="text-xs text-muted-foreground">{variant.factory.code}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Code className="h-3 w-3 text-blue-500" />
                      <span className="font-mono font-bold text-blue-600">{variant.systemVariantCode}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{variant.supplierName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{variant.supplierProductCode}</p>
                      <p className="text-xs text-muted-foreground font-mono">{variant.supplierVariantCode}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm font-medium">{variant.supplierSku}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {variant.size && (
                        <Badge variant="outline" className="text-xs">Size: {variant.size}</Badge>
                      )}
                      {variant.color && (
                        <Badge variant="outline" className="text-xs">Color: {variant.color}</Badge>
                      )}
                      {variant.material && (
                        <Badge variant="outline" className="text-xs">Material: {variant.material}</Badge>
                      )}
                      {variant.style && (
                        <Badge variant="outline" className="text-xs">Style: {variant.style}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">${variant.supplierPrice}</p>
                      <p className="text-xs text-muted-foreground">Min: {variant.minimumQuantity}</p>
                      <p className="text-xs text-muted-foreground">
                        Lead: {variant.leadTime ? `${variant.leadTime}d` : 'N/A'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={variant.isAvailable ? 'default' : 'secondary'} className="text-xs">
                        {variant.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                      {variant.lastSyncedAt && (
                        <p className="text-xs text-muted-foreground">
                          Synced: {new Date(variant.lastSyncedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewVariant(variant)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.location.href = `/factories/system-variants`}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredVariants.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Factory className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No supplier variants found</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleAddVariant}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier Variant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplier Variant Detail Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Supplier Variant: {selectedVariant?.supplierSku}
            </DialogTitle>
            <DialogDescription>
              {selectedVariant?.factory.name} • Maps to System Code: {selectedVariant?.systemVariantCode}
            </DialogDescription>
          </DialogHeader>

          {selectedVariant && (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Supplier Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Supplier</Label>
                        <p className="text-sm font-medium">{selectedVariant.factory.name}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Supplier Code</Label>
                        <p className="text-sm font-mono">{selectedVariant.factory.code}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Supplier SKU</Label>
                        <p className="text-sm font-mono font-bold">{selectedVariant.supplierSku}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Supplier Name</Label>
                        <p className="text-sm">{selectedVariant.supplierName}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Product Code</Label>
                        <p className="text-sm font-mono">{selectedVariant.supplierProductCode}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Variant Code</Label>
                        <p className="text-sm font-mono">{selectedVariant.supplierVariantCode}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">System Mapping</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-xs">System Variant Code</Label>
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-blue-500" />
                          <span className="font-mono font-bold text-blue-600 text-lg">{selectedVariant.systemVariantCode}</span>
                        </div>
                      </div>
                      {selectedVariant.systemVariant && (
                        <>
                          <div>
                            <Label className="text-xs">System Variant Name</Label>
                            <p className="text-sm">{selectedVariant.systemVariant.name}</p>
                          </div>
                          <div>
                            <Label className="text-xs">Product</Label>
                            <p className="text-sm">{selectedVariant.systemVariant.product.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedVariant.systemVariant.product.sku}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Attributes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {selectedVariant.size && (
                        <Badge variant="outline" className="text-xs">Size: {selectedVariant.size}</Badge>
                      )}
                      {selectedVariant.color && (
                        <Badge variant="outline" className="text-xs">Color: {selectedVariant.color}</Badge>
                      )}
                      {selectedVariant.material && (
                        <Badge variant="outline" className="text-xs">Material: {selectedVariant.material}</Badge>
                      )}
                      {selectedVariant.style && (
                        <Badge variant="outline" className="text-xs">Style: {selectedVariant.style}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs">Supplier Price</Label>
                      <p className="text-lg font-bold text-green-600">${selectedVariant.supplierPrice}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Minimum Order</Label>
                      <p className="text-sm">{selectedVariant.minimumQuantity} units</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Terms</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs">Lead Time</Label>
                      <p className="text-sm">{selectedVariant.leadTime ? `${selectedVariant.leadTime} days` : 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-xs">Availability</Label>
                      <Badge variant={selectedVariant.isAvailable ? 'default' : 'secondary'}>
                        {selectedVariant.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                    {selectedVariant.lastSyncedAt && (
                      <div>
                        <Label className="text-xs">Last Synced</Label>
                        <p className="text-xs text-muted-foreground">
                          {new Date(selectedVariant.lastSyncedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Supplier Variant Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Supplier Variant</DialogTitle>
            <DialogDescription>
              Import a variant from a supplier and map it to a system variant
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Factory/Supplier</Label>
                <Select 
                  value={supplierForm.factoryId} 
                  onValueChange={(value) => setSupplierForm({...supplierForm, factoryId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select factory" />
                  </SelectTrigger>
                  <SelectContent>
                    {factories.map((factory) => (
                      <SelectItem key={factory.id} value={factory.id}>
                        {factory.name} ({factory.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>System Variant Code</Label>
                <Select 
                  value={supplierForm.systemVariantCode} 
                  onValueChange={(value) => setSupplierForm({...supplierForm, systemVariantCode: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select system variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemVariants.map((variant) => (
                      <SelectItem key={variant.id} value={variant.code}>
                        {variant.code} - {variant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Supplier Product Information</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier Product Code</Label>
                  <Input
                    value={supplierForm.supplierProductCode}
                    onChange={(e) => setSupplierForm({...supplierForm, supplierProductCode: e.target.value})}
                    placeholder="e.g., GEAR-TSHIRT-001"
                  />
                </div>
                <div>
                  <Label>Supplier Variant Code</Label>
                  <Input
                    value={supplierForm.supplierVariantCode}
                    onChange={(e) => setSupplierForm({...supplierForm, supplierVariantCode: e.target.value})}
                    placeholder="e.g., SIZE-L-COLOR-BLUE"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Supplier SKU</Label>
                  <Input
                    value={supplierForm.supplierSku}
                    onChange={(e) => setSupplierForm({...supplierForm, supplierSku: e.target.value})}
                    placeholder="e.g., GEAR-TS-001-L-BLUE"
                  />
                </div>
                <div>
                  <Label>Supplier Product Name</Label>
                  <Input
                    value={supplierForm.supplierName}
                    onChange={(e) => setSupplierForm({...supplierForm, supplierName: e.target.value})}
                    placeholder="e.g., Classic Tee Large Blue"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Variant Attributes</Label>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Size</Label>
                  <Input
                    value={supplierForm.size}
                    onChange={(e) => setSupplierForm({...supplierForm, size: e.target.value})}
                    placeholder="L"
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input
                    value={supplierForm.color}
                    onChange={(e) => setSupplierForm({...supplierForm, color: e.target.value})}
                    placeholder="Blue"
                  />
                </div>
                <div>
                  <Label>Material</Label>
                  <Input
                    value={supplierForm.material}
                    onChange={(e) => setSupplierForm({...supplierForm, material: e.target.value})}
                    placeholder="Cotton"
                  />
                </div>
                <div>
                  <Label>Style</Label>
                  <Input
                    value={supplierForm.style}
                    onChange={(e) => setSupplierForm({...supplierForm, style: e.target.value})}
                    placeholder="Crew Neck"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Terms & Pricing</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Supplier Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={supplierForm.supplierPrice}
                    onChange={(e) => setSupplierForm({...supplierForm, supplierPrice: e.target.value})}
                    placeholder="8.50"
                  />
                </div>
                <div>
                  <Label>Minimum Quantity</Label>
                  <Input
                    type="number"
                    value={supplierForm.minimumQuantity}
                    onChange={(e) => setSupplierForm({...supplierForm, minimumQuantity: e.target.value})}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label>Lead Time (days)</Label>
                  <Input
                    type="number"
                    value={supplierForm.leadTime}
                    onChange={(e) => setSupplierForm({...supplierForm, leadTime: e.target.value})}
                    placeholder="3"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSupplierVariant}
              disabled={!supplierForm.factoryId || !supplierForm.systemVariantCode || !supplierForm.supplierSku}
            >
              <Download className="h-4 w-4 mr-2" />
              Import Supplier Variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}