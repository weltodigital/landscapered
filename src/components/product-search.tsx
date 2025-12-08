'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, ShoppingCart, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Product, ProductCategory } from '@/types/products'
import { LANDSCAPING_CATALOG, searchCatalog, getProductsByCategory } from '@/lib/catalog/landscaping-products'
import { productScraper } from '@/lib/scrapers'
import { merchantAPI, formatPrice } from '@/lib/merchants'

interface ProductSearchProps {
  onProductSelect: (product: Product, quantity: number, markup?: number) => void
  selectedProducts?: Array<{ product: Product; quantity: number; markup?: number }>
}

export function ProductSearch({ onProductSelect, selectedProducts = [] }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | ''>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'catalog' | 'merchants'>('catalog')

  // New product creation state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    price: '',
    unit: 'UNIT',
    category: '',
    sku: '',
    supplierName: '',
    supplierUrl: ''
  })
  const [customSupplier, setCustomSupplier] = useState('')

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
    performSearch()
  }, [searchQuery, selectedCategory, maxPrice, activeTab])

  const performSearch = async () => {
    setLoading(true)

    try {
      if (activeTab === 'catalog') {
        // Search local catalog
        const results = searchCatalog(
          searchQuery || undefined,
          selectedCategory || undefined,
          maxPrice ? parseFloat(maxPrice) : undefined
        )
        setSearchResults(results)
      } else {
        // Search merchant data (mock for now)
        const merchantResults = await productScraper.scrapeProducts('wickes', searchQuery || 'building materials', 20)
        setSearchResults(merchantResults)
      }
    } catch (error) {
      console.error('Search failed:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const isProductSelected = (productId: string) => {
    return selectedProducts.some(item => item.product.id === productId)
  }

  const handleNewProductInputChange = (field: string, value: string) => {
    if (field === 'supplierName') {
      if (value === 'Custom') {
        setNewProductForm({ ...newProductForm, [field]: 'Custom' })
      } else {
        setNewProductForm({ ...newProductForm, [field]: value })
        setCustomSupplier('')
      }
    } else {
      setNewProductForm({ ...newProductForm, [field]: value })
    }
  }

  const handleCustomSupplierChange = (value: string) => {
    setCustomSupplier(value)
    setNewProductForm({ ...newProductForm, supplierName: value })
  }

  const createNewProduct = async () => {
    if (!newProductForm.name || !newProductForm.price) {
      alert('Name and price are required')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProductForm)
      })

      if (response.ok) {
        const newProduct = await response.json()

        // Reset form
        setNewProductForm({
          name: '',
          price: '',
          unit: 'UNIT',
          category: '',
          sku: '',
          supplierName: '',
          supplierUrl: ''
        })
        setCustomSupplier('')
        setIsCreateDialogOpen(false)

        // Refresh search results
        performSearch()

        alert('Product created successfully!')
      } else {
        alert('Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Failed to create product')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Product Search & Selection
            </CardTitle>
            <CardDescription>
              Search and add products to your quote or invoice
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Create New Product
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Controls */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === 'catalog' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('catalog')}
          >
            Local Catalog
          </Button>
          <Button
            variant={activeTab === 'merchants' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('merchants')}
          >
            Live Prices
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Search Materials</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Enter product name or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={selectedCategory || 'all'} onValueChange={(value) => setSelectedCategory(value === 'all' ? '' : value as ProductCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="paving">Paving</SelectItem>
                <SelectItem value="aggregates">Aggregates</SelectItem>
                <SelectItem value="landscaping">Landscaping</SelectItem>
                <SelectItem value="plants_seeds">Plants & Seeds</SelectItem>
                <SelectItem value="blocks_bricks">Blocks & Bricks</SelectItem>
                <SelectItem value="cement_concrete">Cement & Concrete</SelectItem>
                <SelectItem value="fencing">Fencing</SelectItem>
                <SelectItem value="drainage">Drainage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="maxPrice">Max Price (£)</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="No limit"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Searching products...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">{product.description}</div>
                        {product.brand && (
                          <Badge variant="outline" className="mt-1">
                            {product.brand}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {product.category.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(product.price)}
                    </TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>
                      <Badge variant={product.availability.inStock ? 'default' : 'destructive'}>
                        {product.availability.inStock ? 'In Stock' : 'Out of Stock'}
                        {product.availability.quantity && ` (${product.availability.quantity})`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ProductAddDialog
                        product={product}
                        onAdd={onProductSelect}
                        disabled={isProductSelected(product.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No products found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Create New Product Dialog */}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="new-name">Product Name *</Label>
            <Input
              id="new-name"
              value={newProductForm.name}
              onChange={(e) => handleNewProductInputChange('name', e.target.value)}
              placeholder="e.g., Premium Lawn Turf"
            />
          </div>

          <div>
            <Label htmlFor="new-price">Price *</Label>
            <Input
              id="new-price"
              type="number"
              step="0.01"
              value={newProductForm.price}
              onChange={(e) => handleNewProductInputChange('price', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="new-unit">Unit</Label>
            <Select value={newProductForm.unit} onValueChange={(value) => handleNewProductInputChange('unit', value)}>
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
            <Label htmlFor="new-category">Category</Label>
            <Select value={newProductForm.category} onValueChange={(value) => handleNewProductInputChange('category', value)}>
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
            <Label htmlFor="new-sku">SKU</Label>
            <Input
              id="new-sku"
              value={newProductForm.sku}
              onChange={(e) => handleNewProductInputChange('sku', e.target.value)}
              placeholder="Product SKU"
            />
          </div>

          <div>
            <Label htmlFor="new-supplierName">Supplier</Label>
            <Select
              value={customSupplier ? 'Custom' : newProductForm.supplierName}
              onValueChange={(value) => handleNewProductInputChange('supplierName', value)}
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

            {(newProductForm.supplierName === 'Custom' || customSupplier) && (
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
            <Label htmlFor="new-supplierUrl">Supplier URL</Label>
            <Input
              id="new-supplierUrl"
              type="url"
              value={newProductForm.supplierUrl}
              onChange={(e) => handleNewProductInputChange('supplierUrl', e.target.value)}
              placeholder="https://supplier-website.com/product"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={createNewProduct} disabled={isCreating} className="flex-1">
              {isCreating ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Card>
  )
}

interface ProductAddDialogProps {
  product: Product
  onAdd: (product: Product, quantity: number, markup?: number) => void
  disabled?: boolean
}

function ProductAddDialog({ product, onAdd, disabled }: ProductAddDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [markup, setMarkup] = useState<number>(25) // Default 25% markup

  const handleAdd = () => {
    onAdd(product, quantity, markup)
    setQuantity(1)
    setMarkup(25)
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
        className="w-20"
        placeholder="Qty"
      />
      <Input
        type="number"
        min="0"
        value={markup}
        onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
        className="w-20"
        placeholder="Markup %"
      />
      <Button
        size="sm"
        onClick={handleAdd}
        disabled={disabled || !product.availability.inStock}
      >
        <Plus className="h-4 w-4" />
        {disabled ? 'Added' : 'Add'}
      </Button>
    </div>
  )
}