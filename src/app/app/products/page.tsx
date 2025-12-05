'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Package, Search, Loader2, Edit, Trash2, MoreVertical } from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  unit: string
  category?: string
  sku?: string
  supplierName?: string
  supplierUrl?: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: 'UNIT',
    category: '',
    sku: '',
    supplierName: '',
    supplierUrl: ''
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    unit: 'UNIT',
    category: '',
    sku: '',
    supplierName: '',
    supplierUrl: ''
  })
  const [customSupplier, setCustomSupplier] = useState('')
  const [editCustomSupplier, setEditCustomSupplier] = useState('')

  const ukSuppliers = [
    'B&Q',
    'Wickes',
    'Homebase',
    'Screwfix',
    'Travis Perkins',
    'Jewson',
    'Buildbase',
    'Selco',
    'Toolstation',
    'Magnet Trade',
    'Covers Timber & Builders Merchants',
    'Huws Gray',
    'Custom'
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const addProduct = async () => {
    if (!formData.name || !formData.price) {
      alert('Name and price are required')
      return
    }

    setIsAdding(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const productData = await response.json()
        setProducts([...products, productData])
        alert('Product added successfully!')

        setFormData({
          name: '',
          price: '',
          unit: 'UNIT',
          category: '',
          sku: '',
          supplierName: '',
          supplierUrl: ''
        })
      } else {
        alert('Failed to add product')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Failed to add product')
    } finally {
      setIsAdding(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'supplierName') {
      if (value === 'Custom') {
        setFormData({ ...formData, [field]: 'Custom' })
      } else {
        setFormData({ ...formData, [field]: value })
        setCustomSupplier('')
      }
    } else {
      setFormData({ ...formData, [field]: value })
    }
  }

  const handleCustomSupplierChange = (value: string) => {
    setCustomSupplier(value)
    setFormData({ ...formData, supplierName: value })
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
        alert('Product deleted successfully!')
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const editProduct = (product: Product) => {
    setEditingProduct(product)

    // Check if supplier is in the predefined list
    const supplierName = product.supplierName || ''
    const isCustomSupplier = supplierName && !ukSuppliers.slice(0, -1).includes(supplierName) // Exclude "Custom" from check

    setEditFormData({
      name: product.name,
      price: product.price.toString(),
      unit: product.unit,
      category: product.category || '',
      sku: product.sku || '',
      supplierName: isCustomSupplier ? 'Custom' : supplierName,
      supplierUrl: product.supplierUrl || ''
    })

    setEditCustomSupplier(isCustomSupplier ? supplierName : '')
    setIsEditDialogOpen(true)
  }

  const updateProduct = async () => {
    if (!editFormData.name || !editFormData.price || !editingProduct) {
      alert('Name and price are required')
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData)
      })

      if (response.ok) {
        const productData = await response.json()
        setProducts(products.map(p => p.id === editingProduct.id ? productData : p))
        alert('Product updated successfully!')
        setIsEditDialogOpen(false)
        setEditingProduct(null)
      } else {
        alert('Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditInputChange = (field: string, value: string) => {
    if (field === 'supplierName') {
      if (value === 'Custom') {
        setEditFormData({ ...editFormData, [field]: 'Custom' })
      } else {
        setEditFormData({ ...editFormData, [field]: value })
        setEditCustomSupplier('')
      }
    } else {
      setEditFormData({ ...editFormData, [field]: value })
    }
  }

  const handleEditCustomSupplierChange = (value: string) => {
    setEditCustomSupplier(value)
    setEditFormData({ ...editFormData, supplierName: value })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-6">
        <div className="text-center">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Materials & Pricing</h1>
        <p className="text-gray-600">
          Manage your product catalog for quoting and project planning.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Add Product Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Product
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Premium Lawn Turf"
                />
              </div>

              <div>
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNIT">Each (UNIT)</SelectItem>
                    <SelectItem value="SQM">Square Metres (SQM)</SelectItem>
                    <SelectItem value="METRE">Linear Metres</SelectItem>
                    <SelectItem value="KG">Kilograms (KG)</SelectItem>
                    <SelectItem value="BAG">Bag/Sack</SelectItem>
                    <SelectItem value="PALLET">Pallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plants">Plants</SelectItem>
                    <SelectItem value="Paving">Paving</SelectItem>
                    <SelectItem value="Turf">Turf</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                    <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                    <SelectItem value="Mulch">Mulch</SelectItem>
                    <SelectItem value="Soil">Soil</SelectItem>
                    <SelectItem value="Fencing">Fencing</SelectItem>
                    <SelectItem value="Lighting">Lighting</SelectItem>
                    <SelectItem value="Irrigation">Irrigation</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Product SKU"
                />
              </div>

              <div>
                <Label htmlFor="supplierName">Supplier</Label>
                <Select
                  value={customSupplier ? 'Custom' : formData.supplierName}
                  onValueChange={(value) => handleInputChange('supplierName', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {ukSuppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(formData.supplierName === 'Custom' || customSupplier) && (
                  <div className="mt-2">
                    <Input
                      placeholder="Enter custom supplier name"
                      value={customSupplier}
                      onChange={(e) => handleCustomSupplierChange(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="supplierUrl">Supplier URL</Label>
                <Input
                  id="supplierUrl"
                  type="url"
                  value={formData.supplierUrl}
                  onChange={(e) => handleInputChange('supplierUrl', e.target.value)}
                  placeholder="https://supplier-website.com/product"
                />
              </div>

              <Button onClick={addProduct} disabled={isAdding} className="w-full">
                {isAdding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Materials List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Catalog
                <Badge variant="secondary">{products.length} products</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                            {product.category && (
                              <Badge variant="outline">{product.category}</Badge>
                            )}
                          </div>
                          {product.description && (
                            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-medium text-green-600">
                              £{product.price.toFixed(2)} per {product.unit}
                            </span>
                            {product.supplierName && (
                              <span>Supplier: {product.supplierName}</span>
                            )}
                            {product.sku && (
                              <span>SKU: {product.sku}</span>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => editProduct(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteProduct(product.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                  <p className="text-gray-500 mb-4">Add your first product to start building your catalog</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => handleEditInputChange('name', e.target.value)}
                placeholder="e.g., Premium Lawn Turf"
              />
            </div>

            <div>
              <Label htmlFor="edit-price">Price *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={editFormData.price}
                onChange={(e) => handleEditInputChange('price', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="edit-unit">Unit</Label>
              <Select value={editFormData.unit} onValueChange={(value) => handleEditInputChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNIT">Each (UNIT)</SelectItem>
                  <SelectItem value="SQM">Square Metres (SQM)</SelectItem>
                  <SelectItem value="METRE">Linear Metres</SelectItem>
                  <SelectItem value="KG">Kilograms (KG)</SelectItem>
                  <SelectItem value="BAG">Bag/Sack</SelectItem>
                  <SelectItem value="PALLET">Pallet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editFormData.category} onValueChange={(value) => handleEditInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Plants">Plants</SelectItem>
                  <SelectItem value="Paving">Paving</SelectItem>
                  <SelectItem value="Turf">Turf</SelectItem>
                  <SelectItem value="Tools">Tools</SelectItem>
                  <SelectItem value="Fertilizers">Fertilizers</SelectItem>
                  <SelectItem value="Mulch">Mulch</SelectItem>
                  <SelectItem value="Soil">Soil</SelectItem>
                  <SelectItem value="Fencing">Fencing</SelectItem>
                  <SelectItem value="Lighting">Lighting</SelectItem>
                  <SelectItem value="Irrigation">Irrigation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-sku">SKU</Label>
              <Input
                id="edit-sku"
                value={editFormData.sku}
                onChange={(e) => handleEditInputChange('sku', e.target.value)}
                placeholder="Product SKU"
              />
            </div>

            <div>
              <Label htmlFor="edit-supplierName">Supplier</Label>
              <Select
                value={editCustomSupplier ? 'Custom' : editFormData.supplierName}
                onValueChange={(value) => handleEditInputChange('supplierName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {ukSuppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(editFormData.supplierName === 'Custom' || editCustomSupplier) && (
                <div className="mt-2">
                  <Input
                    placeholder="Enter custom supplier name"
                    value={editCustomSupplier}
                    onChange={(e) => handleEditCustomSupplierChange(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="edit-supplierUrl">Supplier URL</Label>
              <Input
                id="edit-supplierUrl"
                type="url"
                value={editFormData.supplierUrl}
                onChange={(e) => handleEditInputChange('supplierUrl', e.target.value)}
                placeholder="https://supplier-website.com/product"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={updateProduct} disabled={isUpdating} className="flex-1">
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}