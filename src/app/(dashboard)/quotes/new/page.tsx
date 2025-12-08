'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Customer, Job } from '@/types/crm'
import { Product, QuoteItem } from '@/types/products'
import { ProductSearch } from '@/components/product-search'

interface QuoteFormData {
  customerId: string
  jobId: string
  quoteNumber: string
  validUntil: string
  notes: string
  terms: string
}

export default function NewQuotePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])

  const [formData, setFormData] = useState<QuoteFormData>({
    customerId: '',
    jobId: '',
    quoteNumber: '',
    validUntil: '',
    notes: '',
    terms: 'Payment due within 30 days of acceptance. All prices include materials and labour. VAT will be added at current rate.'
  })

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])

  useEffect(() => {
    fetchData()
    generateQuoteNumber()
  }, [])

  useEffect(() => {
    if (formData.customerId) {
      const customerJobs = jobs.filter(job => job.customerId === formData.customerId)
      setFilteredJobs(customerJobs)
    } else {
      setFilteredJobs([])
    }
  }, [formData.customerId, jobs])

  const fetchData = async () => {
    try {
      // Fetch customers
      const customersResponse = await fetch('/api/customers')
      if (customersResponse.ok) {
        const customersData = await customersResponse.json()
        setCustomers(customersData)
      } else {
        console.error('Failed to fetch customers')
        // Fallback to mock data
        setCustomers([
          {
            id: '1',
            userId: '',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '+44 123 456 7890',
            address: '123 Garden Lane',
            city: 'London',
            postcode: 'SW1A 1AA',
            createdAt: '2024-11-20T10:00:00Z',
            updatedAt: '2024-11-20T10:00:00Z',
          }
        ])
      }

      // For now, use mock jobs since we don't have a jobs API yet
      const mockJobs: Job[] = [
        {
          id: '1',
          userId: '',
          customerId: '1',
          title: 'Garden Design & Installation',
          description: 'Complete garden makeover with modern landscape design',
          status: 'in_progress',
          priority: 'high',
          type: 'design',
          estimatedValue: 15000,
          createdAt: '2024-11-28T10:00:00Z',
          updatedAt: '2024-11-28T10:00:00Z',
        }
      ]

      setJobs(mockJobs)
    } catch (error) {
      console.error('Error fetching data:', error)
      // Fallback to empty arrays
      setCustomers([])
      setJobs([])
    }
  }

  const generateQuoteNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')

    setFormData(prev => ({
      ...prev,
      quoteNumber: `QUO-${year}${month}${day}-${random}`,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const quoteData = {
        ...formData,
        items: quoteItems,
        subtotal,
        markup: totalMarkup,
        tax,
        total,
        status: 'draft'
      }

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create quote')
      }

      const newQuote = await response.json()
      console.log('Quote created successfully:', newQuote)
      router.push('/app/quotes')
    } catch (error) {
      console.error('Error creating quote:', error)
      alert('Failed to create quote. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof QuoteFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProductSelect = (product: Product, quantity: number, markup: number = 0) => {
    const unitPriceWithMarkup = product.price + (product.price * (markup / 100))
    const total = quantity * unitPriceWithMarkup

    const newItem: QuoteItem = {
      id: Date.now().toString(),
      quoteId: formData.quoteNumber,
      productId: product.id,
      product,
      quantity,
      unitPrice: unitPriceWithMarkup,
      totalPrice: total,
      markup: product.price * (markup / 100) * quantity,
      markupPercent: markup,
      category: 'product',
      createdAt: new Date().toISOString()
    }

    setQuoteItems(prev => [...prev, newItem])
  }

  const addCustomItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      quoteId: formData.quoteNumber,
      customDescription: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      category: 'service',
      createdAt: new Date().toISOString()
    }
    setQuoteItems([...quoteItems, newItem])
  }

  const removeItem = (id: string) => {
    setQuoteItems(items => items.filter(item => item.id !== id))
  }

  const updateCustomItem = (id: string, field: string, value: string | number) => {
    setQuoteItems(items => items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
        }
        return updatedItem
      }
      return item
    }))
  }

  const subtotal = quoteItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const totalMarkup = quoteItems.reduce((sum, item) => sum + (item.markup || 0), 0)
  const tax = subtotal * 0.2 // 20% VAT
  const total = subtotal + tax

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const selectedCustomer = customers.find(c => c.id === formData.customerId)
  const selectedJob = jobs.find(j => j.id === formData.jobId)

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Quote</h1>
          <p className="text-gray-600 mt-1">Generate a professional quote with product pricing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
              <CardDescription>
                Basic information about the quote
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quoteNumber">Quote Number</Label>
                  <Input
                    id="quoteNumber"
                    value={formData.quoteNumber}
                    onChange={(e) => handleInputChange('quoteNumber', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={formData.customerId} onValueChange={(value) => handleInputChange('customerId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="job">Related Job (Optional)</Label>
                  <Select value={formData.jobId} onValueChange={(value) => handleInputChange('jobId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a job" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredJobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes for this quote"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomer && (
                <div>
                  <h4 className="font-medium mb-2">Quote For:</h4>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{selectedCustomer.name}</p>
                    <p>{selectedCustomer.email}</p>
                    {selectedCustomer.address && <p>{selectedCustomer.address}</p>}
                    <p>{selectedCustomer.city} {selectedCustomer.postcode}</p>
                  </div>
                </div>
              )}

              {selectedJob && (
                <div>
                  <h4 className="font-medium mb-2">Related Job:</h4>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{selectedJob.title}</p>
                    <p>{selectedJob.description}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-primary">
                  <span>Total Markup:</span>
                  <span>{formatCurrency(totalMarkup)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT (20%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Search */}
        <div className="mb-6">
          <ProductSearch
            onProductSelect={handleProductSelect}
            selectedProducts={quoteItems.map(item => ({
              product: item.product!,
              quantity: item.quantity,
              markup: item.markupPercent
            })).filter(item => item.product)}
          />
        </div>

        {/* Quote Items */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Quote Items</CardTitle>
                <CardDescription>
                  Materials and services in this quote
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addCustomItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Custom Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {quoteItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-24">Qty</TableHead>
                    <TableHead className="w-32">Unit Price</TableHead>
                    <TableHead className="w-32">Markup</TableHead>
                    <TableHead className="w-32">Total</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.product ? (
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                            <div className="text-sm text-gray-600">{item.product.description}</div>
                          </div>
                        ) : (
                          <Input
                            value={item.customDescription || ''}
                            onChange={(e) => updateCustomItem(item.id, 'customDescription', e.target.value)}
                            placeholder="Enter description"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {item.product ? (
                          <span>{item.quantity}</span>
                        ) : (
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateCustomItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {item.product ? (
                          <span>{formatCurrency(item.unitPrice)}</span>
                        ) : (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateCustomItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {item.markup ? formatCurrency(item.markup) : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(item.totalPrice)}</div>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p>No items added yet</p>
                <p className="text-sm">Search for products above or add custom items</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.customerId || quoteItems.length === 0}>
            {loading ? 'Creating...' : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Quote
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}