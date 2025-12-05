'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, ShoppingCart } from 'lucide-react'
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Product Search & Selection
        </CardTitle>
        <CardDescription>
          Search and add products to your quote or invoice
        </CardDescription>
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