'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  MapPin,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Invoice, InvoiceStatus, InvoiceItem } from '@/types/crm'

const statusColors: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-primary/10 text-primary',
  paid: 'bg-primary/10 text-primary',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusIcons: Record<InvoiceStatus, any> = {
  draft: Clock,
  sent: Send,
  paid: CheckCircle,
  overdue: AlertCircle,
  cancelled: AlertCircle,
}

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      // Mock data for now - in production this would come from your API
      const mockInvoice: Invoice = {
        id: params.id as string,
        userId: '',
        jobId: '1',
        customerId: '1',
        invoiceNumber: 'INV-2024-001',
        status: 'sent',
        subtotal: 14500,
        tax: 2900,
        total: 17400,
        dueDate: '2024-12-20',
        sentAt: '2024-11-28T10:00:00Z',
        notes: 'Payment terms: Net 30 days. Late payment charges may apply.',
        createdAt: '2024-11-28T10:00:00Z',
        updatedAt: '2024-11-28T10:00:00Z',
        job: {
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
        customer: {
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
        items: [
          {
            id: '1',
            invoiceId: params.id as string,
            description: 'Garden Design & Planning',
            quantity: 1,
            unitPrice: 2500,
            total: 2500,
            createdAt: '2024-11-28T10:00:00Z',
          },
          {
            id: '2',
            invoiceId: params.id as string,
            description: 'Site Preparation & Excavation',
            quantity: 20,
            unitPrice: 150,
            total: 3000,
            createdAt: '2024-11-28T10:00:00Z',
          },
          {
            id: '3',
            invoiceId: params.id as string,
            description: 'Premium Patio Installation (40 sqm)',
            quantity: 40,
            unitPrice: 120,
            total: 4800,
            createdAt: '2024-11-28T10:00:00Z',
          },
          {
            id: '4',
            invoiceId: params.id as string,
            description: 'Lawn Installation & Turfing',
            quantity: 60,
            unitPrice: 45,
            total: 2700,
            createdAt: '2024-11-28T10:00:00Z',
          },
          {
            id: '5',
            invoiceId: params.id as string,
            description: 'Plant Supply & Installation',
            quantity: 1,
            unitPrice: 1500,
            total: 1500,
            createdAt: '2024-11-28T10:00:00Z',
          }
        ]
      }

      setInvoice(mockInvoice)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      setLoading(false)
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
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
          <p className="text-gray-600 mb-6">The invoice you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[invoice.status]
  const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date()
  const actualStatus = isOverdue ? 'overdue' : invoice.status

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
            <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-gray-600 mt-1">Created {formatDate(invoice.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={`${statusColors[actualStatus]} flex items-center gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {actualStatus.toUpperCase()}
          </Badge>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {invoice.status === 'draft' && (
              <Button size="sm">
                <Send className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-8 mb-6">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gardenly</h2>
            <p className="text-gray-600 mt-1">Professional Landscaping Services</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-semibold text-gray-900">INVOICE</h3>
            <p className="text-gray-600">{invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Customer & Invoice Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Bill To:</h4>
            <div className="text-gray-700">
              <p className="font-medium">{invoice.customer?.name}</p>
              <p>{invoice.customer?.address}</p>
              <p>{invoice.customer?.city} {invoice.customer?.postcode}</p>
              <p className="mt-2">{invoice.customer?.email}</p>
              {invoice.customer?.phone && <p>{invoice.customer.phone}</p>}
            </div>
          </div>
          <div className="text-right">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Date:</span>
                <span className="font-medium">{formatDate(invoice.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
              {invoice.sentAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sent Date:</span>
                  <span className="font-medium">{formatDate(invoice.sentAt)}</span>
                </div>
              )}
              {invoice.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Date:</span>
                  <span className="font-medium text-primary">{formatDate(invoice.paidAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Reference */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Project Reference:</h4>
          <p className="text-gray-700">{invoice.job?.title}</p>
          {invoice.job?.description && (
            <p className="text-sm text-gray-600 mt-1">{invoice.job.description}</p>
          )}
        </div>

        {/* Invoice Items */}
        <div className="mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Description</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-left">{item.description}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Invoice Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT (20%):</span>
                <span>{formatCurrency(invoice.tax)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 pt-8 border-t">
            <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
            <p className="text-gray-600 text-sm">{invoice.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => router.push(`/jobs/${invoice.jobId}`)}>
          View Related Job
        </Button>
        <Button variant="outline" onClick={() => router.push(`/customers/${invoice.customerId}`)}>
          View Customer
        </Button>
        {invoice.status !== 'paid' && (
          <Button>
            Mark as Paid
          </Button>
        )}
      </div>
    </div>
  )
}
// Force dynamic rendering
export const dynamic = 'force-dynamic'
