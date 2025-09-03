'use client'

import { useState, useEffect } from 'react'
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
  Link2
} from 'lucide-react'

interface SystemVariant {
  id: string
  code: string
  name: string
  size?: string
  color?: string
  material?: string
  style?: string
  price: number
  costPrice: number
  stock: number
  isActive: boolean
  product: {
    id: string
    name: string
    sku: string
  }
  supplierVariants: SupplierVariant[]
}

interface SupplierVariant {
  id: string
  factoryId: string
  systemVariantCode: string
  supplierSku: string
  supplierName: string
  supplierPrice: number
  minimumQuantity: number
  leadTime?: number
  isAvailable: boolean
  factory: {
    id: string
    name: string
    code: string
    isActive: boolean
  }
}

export default function SystemVariantsPage() {
  const [systemVariants, setSystemVariants] = useState<SystemVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<SystemVariant | null>(null)
  const [products, setProducts] = useState<any[]>([])

  // Form state for new system variant
  const [variantForm, setVariantForm] = useState({
    productId: '',
    name: '',
    size: '',
    color: '',
    material: '',
    style: '',
    price: '',
    costPrice: '',
    stock: '0'
  })

  useEffect(() => {
    fetchSystemVariants()
    fetchProducts()
  }, [])

  const fetchSystemVariants = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/variants?includeSupplierVariants=true')
      if (response.ok) {
        const data = await response.json()
        setSystemVariants(data.systemVariants)
      }
    } catch (error) {
      console.error('Error fetching system variants:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const generateVariantCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleViewVariant = (variant: SystemVariant) => {
    setSelectedVariant(variant)
    setViewModalOpen(true)
  }

  const handleAddVariant = () => {
    setVariantForm({
      productId: '',
      name: '',
      size: '',
      color: '',
      material: '',
      style: '',
      price: '',
      costPrice: '',
      stock: '0'
    })
    setAddModalOpen(true)
  }

  const handleSaveVariant = async () => {
    try {
      const response = await fetch('/api/system-variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: generateVariantCode(),
          ...variantForm,
          price: parseFloat(variantForm.price),
          costPrice: parseFloat(variantForm.costPrice),
          stock: parseInt(variantForm.stock)
        })
      })

      if (response.ok) {
        await fetchSystemVariants()
        setAddModalOpen(false)
      }
    } catch (error) {
      console.error('Error creating system variant:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading system variants...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <PageHeader 
        title="System Variants" 
        description="Master variant definitions with unique 5-character codes"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = '/factories'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Factories
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/factories/supplier-variants'}>
              <Factory className="h-4 w-4 mr-2" />
              Supplier Variants
            </Button>
            <Button onClick={handleAddVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Add System Variant
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>System Variants</CardTitle>
          <CardDescription>
            Master variant definitions that map to supplier-specific variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant Code</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Variant Name</TableHead>
                <TableHead>Attributes</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Suppliers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systemVariants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-500" />
                      <span className="font-mono font-bold text-blue-600 text-lg">{variant.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{variant.product.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{variant.product.sku}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{variant.name}</p>
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
                    <div className="text-right">
                      <p className="font-medium">${variant.price}</p>
                      <p className="text-xs text-muted-foreground">Cost: ${variant.costPrice}</p>
                      <p className="text-xs text-green-600">
                        Margin: {((variant.price - variant.costPrice) / variant.price * 100).toFixed(1)}%
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <span className={`font-medium ${variant.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>
                        {variant.stock}
                      </span>
                      <p className="text-xs text-muted-foreground">units</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {variant.supplierVariants.length > 0 ? (
                        <>
                          {variant.supplierVariants.slice(0, 2).map((supplierVar) => (
                            <div key={supplierVar.id} className="flex items-center gap-1">
                              <Factory className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs">{supplierVar.factory.name}</span>
                              <Badge 
                                variant={supplierVar.isAvailable ? 'default' : 'secondary'} 
                                className="text-xs"
                              >
                                ${supplierVar.supplierPrice}
                              </Badge>
                            </div>
                          ))}
                          {variant.supplierVariants.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{variant.supplierVariants.length - 2} more
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">No suppliers</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={variant.isActive ? 'default' : 'secondary'}>
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
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
                        onClick={() => window.location.href = `/factories/supplier-variants?system=${variant.code}`}
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {systemVariants.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No system variants found</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleAddVariant}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add System Variant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Variant Detail Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-500" />
              System Variant: {selectedVariant?.code}
              <Badge variant={selectedVariant?.isActive ? 'default' : 'secondary'}>
                {selectedVariant?.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedVariant?.name} • {selectedVariant?.product.name}
            </DialogDescription>
          </DialogHeader>

          {selectedVariant && (
            <div className="grid gap-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">System Variant Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Variant Code</Label>
                        <p className="text-lg font-mono font-bold text-blue-600">{selectedVariant.code}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Product SKU</Label>
                        <p className="text-sm font-mono">{selectedVariant.product.sku}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Size</Label>
                        <p className="text-sm">{selectedVariant.size || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Color</Label>
                        <p className="text-sm">{selectedVariant.color || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Material</Label>
                        <p className="text-sm">{selectedVariant.material || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Style</Label>
                        <p className="text-sm">{selectedVariant.style || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Pricing & Stock</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Sell Price</Label>
                        <p className="text-sm font-medium">${selectedVariant.price}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Cost Price</Label>
                        <p className="text-sm">${selectedVariant.costPrice}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Stock Level</Label>
                        <p className={`text-sm font-medium ${selectedVariant.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>
                          {selectedVariant.stock} units
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs">Profit Margin</Label>
                        <p className="text-sm font-medium text-green-600">
                          {((selectedVariant.price - selectedVariant.costPrice) / selectedVariant.price * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Supplier Mappings ({selectedVariant.supplierVariants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedVariant.supplierVariants.length > 0 ? (
                    <div className="space-y-3">
                      {selectedVariant.supplierVariants.map((supplierVar) => (
                        <div key={supplierVar.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Factory className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{supplierVar.factory.name}</span>
                              <Badge variant="outline" className="text-xs">{supplierVar.factory.code}</Badge>
                            </div>
                            <Badge 
                              variant={supplierVar.isAvailable ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {supplierVar.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <Label className="text-xs">Supplier SKU</Label>
                              <p className="font-mono">{supplierVar.supplierSku}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Supplier Price</Label>
                              <p className="font-medium">${supplierVar.supplierPrice}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Min Quantity</Label>
                              <p>{supplierVar.minimumQuantity}</p>
                            </div>
                            <div>
                              <Label className="text-xs">Lead Time</Label>
                              <p>{supplierVar.leadTime ? `${supplierVar.leadTime} days` : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Factory className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No supplier variants mapped to this system variant</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => window.location.href = `/factories/supplier-variants?add=${selectedVariant.code}`}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Supplier Variant
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add System Variant Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add System Variant</DialogTitle>
            <DialogDescription>
              Create a new master variant definition
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Product</Label>
              <Select 
                value={variantForm.productId} 
                onValueChange={(value) => setVariantForm({...variantForm, productId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Variant Name</Label>
              <Input
                value={variantForm.name}
                onChange={(e) => setVariantForm({...variantForm, name: e.target.value})}
                placeholder="e.g., Large / Blue"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Size</Label>
                <Input
                  value={variantForm.size}
                  onChange={(e) => setVariantForm({...variantForm, size: e.target.value})}
                  placeholder="L"
                />
              </div>
              <div>
                <Label>Color</Label>
                <Input
                  value={variantForm.color}
                  onChange={(e) => setVariantForm({...variantForm, color: e.target.value})}
                  placeholder="Blue"
                />
              </div>
              <div>
                <Label>Material</Label>
                <Input
                  value={variantForm.material}
                  onChange={(e) => setVariantForm({...variantForm, material: e.target.value})}
                  placeholder="Cotton"
                />
              </div>
              <div>
                <Label>Style</Label>
                <Input
                  value={variantForm.style}
                  onChange={(e) => setVariantForm({...variantForm, style: e.target.value})}
                  placeholder="Crew Neck"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Sell Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={variantForm.price}
                  onChange={(e) => setVariantForm({...variantForm, price: e.target.value})}
                  placeholder="19.99"
                />
              </div>
              <div>
                <Label>Cost Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={variantForm.costPrice}
                  onChange={(e) => setVariantForm({...variantForm, costPrice: e.target.value})}
                  placeholder="8.50"
                />
              </div>
              <div>
                <Label>Initial Stock</Label>
                <Input
                  type="number"
                  value={variantForm.stock}
                  onChange={(e) => setVariantForm({...variantForm, stock: e.target.value})}
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveVariant}
              disabled={!variantForm.productId || !variantForm.name || !variantForm.price}
            >
              Create System Variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}