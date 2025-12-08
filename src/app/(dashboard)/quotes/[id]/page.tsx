'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Send, Download, Printer, Save, X, Plus, Trash2, ExternalLink, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { PriceQuote, QuoteStatus } from '@/types/products'

export default function QuoteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [quote, setQuote] = useState<PriceQuote | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedQuote, setEditedQuote] = useState<PriceQuote | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchQuote(params.id as string)
    }
  }, [params.id])

  const fetchQuote = async (id: string) => {
    try {
      setLoading(true)

      const response = await fetch(`/api/quotes`)
      if (!response.ok) {
        throw new Error('Failed to fetch quotes')
      }

      const quotes = await response.json()
      const quote = quotes.find((q: PriceQuote) => q.id === id)

      if (!quote) {
        throw new Error('Quote not found')
      }

      setQuote(quote)
      setEditedQuote(quote)
    } catch (error) {
      console.error('Error fetching quote:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = () => {
    setIsEditing(true)
    setEditedQuote({ ...quote! })
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditedQuote({ ...quote! })
  }

  const saveChanges = async () => {
    // In a real app, you'd save to the backend here
    try {
      // For now, just update the local state
      setQuote(editedQuote!)
      setIsEditing(false)
      alert('Quote updated successfully!')
    } catch (error) {
      console.error('Error saving quote:', error)
      alert('Failed to save changes.')
    }
  }

  const updateEditedQuote = (field: keyof PriceQuote, value: any) => {
    if (editedQuote) {
      setEditedQuote({ ...editedQuote, [field]: value })
    }
  }

  const addNewItem = () => {
    if (editedQuote) {
      const newItem = {
        id: `item-${Date.now()}`,
        quoteId: editedQuote.id,
        customDescription: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        category: 'product' as const,
        createdAt: new Date().toISOString()
      }
      setEditedQuote({
        ...editedQuote,
        items: [...editedQuote.items, newItem]
      })
    }
  }

  const updateItem = (itemId: string, field: string, value: any) => {
    if (editedQuote) {
      const updatedItems = editedQuote.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value }
          if (field === 'quantity' || field === 'unitPrice') {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
          }
          return updatedItem
        }
        return item
      })

      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
      const newTotal = newSubtotal + (editedQuote.tax || 0)

      setEditedQuote({
        ...editedQuote,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newTotal
      })
    }
  }

  const removeItem = (itemId: string) => {
    if (editedQuote) {
      const updatedItems = editedQuote.items.filter(item => item.id !== itemId)
      const newSubtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0)
      const newTotal = newSubtotal + (editedQuote.tax || 0)

      setEditedQuote({
        ...editedQuote,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newTotal
      })
    }
  }

  const getStatusBadgeVariant = (status: QuoteStatus) => {
    switch (status) {
      case 'draft':
        return 'secondary'
      case 'pending':
      case 'sent':
        return 'default'
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      case 'expired':
        return 'destructive'
      case 'converted':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Quote Not Found</h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quotes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{quote.quoteNumber}</h1>
            <p className="text-gray-600 mt-1">Quote Details</p>
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={saveChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button size="sm">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </>
          )}
        </div>
      </div>

      {/* AI Design Image */}
      {quote.designImageUrl && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>AI Generated Design</CardTitle>
                <CardDescription>
                  {quote.designImageNumber && (
                    <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded mr-2">
                      Design #{quote.designImageNumber}
                    </span>
                  )}
                  {quote.designStyle || 'Garden Design'}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => router.push('/app/quotes')}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View All Quotes
                </Button>
                {(quote.projectId || quote.jobId) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/app/projects/${quote.projectId || quote.jobId}`)}
                    className="hover:bg-primary hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Project
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <img
                src={quote.designImageUrl}
                alt={quote.designStyle || 'Garden Design'}
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: '400px' }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Quote Information</CardTitle>
                <CardDescription>
                  Created on {formatDate(quote.createdAt)}
                </CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(quote.status)}>
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-500 mb-1">Valid Until</h4>
                <p>{formatDate(quote.validUntil)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-500 mb-1">Created By</h4>
                <p>{quote.createdBy}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-500 mb-1">Notes</h4>
              {isEditing ? (
                <textarea
                  value={editedQuote?.notes || ''}
                  onChange={(e) => updateEditedQuote('notes', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  rows={3}
                  placeholder="Quote notes..."
                />
              ) : (
                <p className="text-gray-700">{quote.notes || 'No notes'}</p>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-500 mb-1">Terms & Conditions</h4>
              {isEditing ? (
                <textarea
                  value={editedQuote?.terms || ''}
                  onChange={(e) => updateEditedQuote('terms', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  rows={3}
                  placeholder="Terms and conditions..."
                />
              ) : (
                <p className="text-gray-700 text-sm">{quote.terms}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(isEditing ? editedQuote!.subtotal : quote.subtotal)}</span>
              </div>

              {(isEditing ? editedQuote! : quote).markup > 0 && (
                <div className="flex justify-between text-sm text-primary">
                  <span>Markup:</span>
                  <span>{formatCurrency(isEditing ? editedQuote!.markup : quote.markup)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>VAT (20%):</span>
                <span>{formatCurrency(isEditing ? editedQuote!.tax : quote.tax)}</span>
              </div>

              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(isEditing ? editedQuote!.total : quote.total)}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Quote Statistics</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{quote.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Materials:</span>
                  <span>{quote.items.filter(item => item.category === 'product').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Services:</span>
                  <span>{quote.items.filter(item => item.category === 'service').length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Quote Items</CardTitle>
              <CardDescription>
                Detailed breakdown of all items in this quote
              </CardDescription>
            </div>
            {isEditing && (
              <Button size="sm" onClick={addNewItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
              <TableRow>
                <TableHead className="min-w-[300px]">Description</TableHead>
                <TableHead className="w-20">Qty</TableHead>
                <TableHead className="w-28">Unit Price</TableHead>
                <TableHead className="w-28">Total</TableHead>
                {isEditing && <TableHead className="w-20">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isEditing ? editedQuote! : quote).items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="min-w-[300px]">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={item.customDescription || ''}
                          onChange={(e) => updateItem(item.id, 'customDescription', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Item description"
                        />
                        <select
                          value={item.category}
                          onChange={(e) => updateItem(item.id, 'category', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="product">Product</option>
                          <option value="service">Service</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{item.customDescription}</div>
                        <Badge variant={item.category === 'product' ? 'default' : 'secondary'} className="mt-1">
                          {item.category}
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="w-20">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                      />
                    ) : (
                      <span className="block text-center">{item.quantity}</span>
                    )}
                  </TableCell>
                  <TableCell className="w-28">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-right"
                      />
                    ) : (
                      <span className="block text-right">{formatCurrency(item.unitPrice)}</span>
                    )}
                  </TableCell>
                  <TableCell className="w-28 font-medium text-right">
                    {formatCurrency(item.totalPrice)}
                  </TableCell>
                  {isEditing && (
                    <TableCell className="w-20 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
// Force dynamic rendering
export const dynamic = 'force-dynamic'
