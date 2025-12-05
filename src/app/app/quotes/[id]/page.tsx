'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Send, Download, Printer } from 'lucide-react'
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

  useEffect(() => {
    if (params.id) {
      fetchQuote(params.id as string)
    }
  }, [params.id])

  const fetchQuote = async (id: string) => {
    try {
      // Mock data for now
      const mockQuote: PriceQuote = {
        id: id,
        customerId: '1',
        quoteNumber: 'QUO-20241128-001',
        status: 'sent',
        validUntil: '2024-12-28',
        items: [
          {
            id: '1',
            quoteId: id,
            customDescription: 'Indian Sandstone Paving 600x600mm',
            quantity: 50,
            unitPrice: 24.99,
            totalPrice: 1249.50,
            markup: 312.50,
            markupPercent: 25,
            category: 'product',
            createdAt: '2024-11-28T10:00:00Z'
          },
          {
            id: '2',
            quoteId: id,
            customDescription: 'Garden Design Service',
            quantity: 1,
            unitPrice: 500.00,
            totalPrice: 500.00,
            category: 'service',
            createdAt: '2024-11-28T10:00:00Z'
          }
        ],
        subtotal: 1749.50,
        markup: 312.50,
        tax: 349.90,
        total: 2099.40,
        notes: 'Complete garden transformation with modern landscaping',
        terms: 'Payment due within 30 days of acceptance. All prices include materials and labour. VAT will be added at current rate.',
        createdBy: 'user@example.com',
        createdAt: '2024-11-28T10:00:00Z',
        updatedAt: '2024-11-28T10:00:00Z'
      }

      setQuote(mockQuote)
    } catch (error) {
      console.error('Error fetching quote:', error)
    } finally {
      setLoading(false)
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
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button size="sm">
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>

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

            {quote.notes && (
              <div>
                <h4 className="font-medium text-gray-500 mb-1">Notes</h4>
                <p className="text-gray-700">{quote.notes}</p>
              </div>
            )}

            {quote.terms && (
              <div>
                <h4 className="font-medium text-gray-500 mb-1">Terms & Conditions</h4>
                <p className="text-gray-700 text-sm">{quote.terms}</p>
              </div>
            )}
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
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>

              {quote.markup > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Markup:</span>
                  <span>{formatCurrency(quote.markup)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>VAT (20%):</span>
                <span>{formatCurrency(quote.tax)}</span>
              </div>

              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(quote.total)}</span>
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
          <CardTitle>Quote Items</CardTitle>
          <CardDescription>
            Detailed breakdown of all items in this quote
          </CardDescription>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {quote.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.customDescription}</div>
                      <Badge variant={item.category === 'product' ? 'default' : 'secondary'} className="mt-1">
                        {item.category}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell>
                    {item.markup ? (
                      <div className="text-green-600">
                        {formatCurrency(item.markup)}
                        {item.markupPercent && (
                          <div className="text-xs text-gray-500">
                            {item.markupPercent}%
                          </div>
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}