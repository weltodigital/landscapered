'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
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
import { Customer, Job, InvoiceStatus } from '@/types/crm'
import { Product } from '@/types/products'
import { ProductSearch } from '@/components/product-search'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  product?: Product
  markup?: number
  markupPercent?: number
}

export default function NewInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])

  const [formData, setFormData] = useState({
    customerId: '',
    jobId: '',
    invoiceNumber: '',
    status: 'draft' as InvoiceStatus,
    dueDate: '',
    notes: '',
  })

  const [items, setItems] = useState<InvoiceItem[]>([])

  useEffect(() => {
    fetchData()
    generateInvoiceNumber()
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
    // Mock data for now
    const mockCustomers: Customer[] = [
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
      },
      {
        id: '2',
        userId: '',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+44 098 765 4321',
        address: '456 Rose Street',
        city: 'Manchester',
        postcode: 'M1 1AA',
        createdAt: '2024-11-22T14:00:00Z',
        updatedAt: '2024-11-22T14:00:00Z',
      },
    ]

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
      },
      {
        id: '2',
        userId: '',
        customerId: '2',
        title: 'Monthly Lawn Maintenance',
        description: 'Regular lawn care and maintenance service',
        status: 'completed',
        priority: 'medium',
        type: 'maintenance',
        estimatedValue: 500,
        createdAt: '2024-11-25T14:00:00Z',
        updatedAt: '2024-11-25T14:00:00Z',
      },
    ]

    setCustomers(mockCustomers)
    setJobs(mockJobs)
  }

  const generateInvoiceNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')

    setFormData(prev => ({
      ...prev,
      invoiceNumber: `INV-${year}${month}${day}-${random}`
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In a real app, this would make an API call
      console.log('Creating invoice:', { ...formData, items })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      router.push('/invoices')
    } catch (error) {
      console.error('Error creating invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProductSelect = (product: Product, quantity: number, markup: number = 0) => {
    const unitPriceWithMarkup = product.price + (product.price * (markup / 100))
    const total = quantity * unitPriceWithMarkup

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: product.name,
      quantity,
      unitPrice: unitPriceWithMarkup,
      total,
      product,
      markup: product.price * (markup / 100) * quantity,
      markupPercent: markup
    }

    setItems(prev => [...prev, newItem])
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice
        }
        return updatedItem
      }
      return item
    }))
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const totalMarkup = items.reduce((sum, item) => sum + (item.markup || 0), 0)
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
          <h1 className="text-3xl font-bold">Create New Invoice</h1>
          <p className="text-gray-600 mt-1">Generate a professional invoice for your services</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>
                Basic information about the invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
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
                  placeholder="Payment terms, special instructions, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCustomer && (
                <div>
                  <h4 className="font-medium mb-2">Bill To:</h4>
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
                {totalMarkup > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Total Markup:</span>
                    <span>{formatCurrency(totalMarkup)}</span>
                  </div>
                )}
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
            selectedProducts={items.map(item => ({
              product: item.product!,
              quantity: item.quantity,
              markup: item.markupPercent
            })).filter(item => item.product)}
          />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Invoice Items</CardTitle>
                <CardDescription>
                  Add line items for services or products
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-32">Unit Price</TableHead>
                  <TableHead className="w-32">Markup</TableHead>
                  <TableHead className="w-32">Total</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.product ? (
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-gray-600">{item.product.description}</div>
                          {item.product.brand && (
                            <div className="text-xs text-gray-500 mt-1">{item.product.brand}</div>
                          )}
                        </div>
                      ) : (
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
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
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
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
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {item.markup ? (
                        <div className="text-primary font-medium">
                          {formatCurrency(item.markup)}
                          <div className="text-xs text-gray-500">
                            {item.markupPercent}%
                          </div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(item.total)}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={false}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.customerId || items.length === 0 || items.some(item => !item.description && !item.product)}>
            {loading ? 'Creating...' : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Invoice
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
// Force dynamic rendering
export const dynamic = 'force-dynamic'
