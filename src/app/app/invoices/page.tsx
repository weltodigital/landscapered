'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Invoice, InvoiceStatus } from '@/types/crm'

const statusColors: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
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

export default function InvoicesPage() {
  const { data: session } = useSession()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      // Mock data for now
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          userId: session?.user?.email || '',
          jobId: '1',
          customerId: '1',
          invoiceNumber: 'INV-2024-001',
          status: 'sent',
          subtotal: 14500,
          tax: 2900,
          total: 17400,
          dueDate: '2024-12-20',
          sentAt: '2024-11-28T10:00:00Z',
          createdAt: '2024-11-28T10:00:00Z',
          updatedAt: '2024-11-28T10:00:00Z',
          job: {
            id: '1',
            userId: session?.user?.email || '',
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
            userId: session?.user?.email || '',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '+44 123 456 7890',
            address: '123 Garden Lane',
            city: 'London',
            postcode: 'SW1A 1AA',
            createdAt: '2024-11-20T10:00:00Z',
            updatedAt: '2024-11-20T10:00:00Z',
          }
        },
        {
          id: '2',
          userId: session?.user?.email || '',
          jobId: '2',
          customerId: '2',
          invoiceNumber: 'INV-2024-002',
          status: 'paid',
          subtotal: 500,
          tax: 100,
          total: 600,
          dueDate: '2024-12-15',
          sentAt: '2024-11-25T14:00:00Z',
          paidAt: '2024-11-27T10:30:00Z',
          createdAt: '2024-11-25T14:00:00Z',
          updatedAt: '2024-11-27T10:30:00Z',
          job: {
            id: '2',
            userId: session?.user?.email || '',
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
          customer: {
            id: '2',
            userId: session?.user?.email || '',
            name: 'Sarah Johnson',
            email: 'sarah@example.com',
            phone: '+44 098 765 4321',
            address: '456 Rose Street',
            city: 'Manchester',
            postcode: 'M1 1AA',
            createdAt: '2024-11-22T14:00:00Z',
            updatedAt: '2024-11-22T14:00:00Z',
          }
        },
        {
          id: '3',
          userId: session?.user?.email || '',
          jobId: '3',
          customerId: '3',
          invoiceNumber: 'INV-2024-003',
          status: 'draft',
          subtotal: 8000,
          tax: 1600,
          total: 9600,
          dueDate: '2024-12-30',
          createdAt: '2024-11-27T09:00:00Z',
          updatedAt: '2024-11-27T09:00:00Z',
          job: {
            id: '3',
            userId: session?.user?.email || '',
            customerId: '3',
            title: 'Patio Installation Quote',
            description: 'Quote for new patio and outdoor seating area',
            status: 'quoted',
            priority: 'low',
            type: 'quote',
            estimatedValue: 8000,
            createdAt: '2024-11-27T09:00:00Z',
            updatedAt: '2024-11-27T09:00:00Z',
          },
          customer: {
            id: '3',
            userId: session?.user?.email || '',
            name: 'Mike Wilson',
            email: 'mike@example.com',
            phone: '+44 555 123 4567',
            address: '789 Oak Avenue',
            city: 'Birmingham',
            postcode: 'B1 1AA',
            createdAt: '2024-11-26T09:00:00Z',
            updatedAt: '2024-11-26T09:00:00Z',
          }
        },
        {
          id: '4',
          userId: session?.user?.email || '',
          jobId: '4',
          customerId: '4',
          invoiceNumber: 'INV-2024-004',
          status: 'overdue',
          subtotal: 1200,
          tax: 240,
          total: 1440,
          dueDate: '2024-11-15',
          sentAt: '2024-11-01T14:00:00Z',
          createdAt: '2024-11-01T14:00:00Z',
          updatedAt: '2024-11-01T14:00:00Z',
          job: {
            id: '4',
            userId: session?.user?.email || '',
            customerId: '4',
            title: 'Emergency Tree Removal',
            description: 'Fallen tree removal after storm',
            status: 'completed',
            priority: 'urgent',
            type: 'maintenance',
            estimatedValue: 1200,
            createdAt: '2024-10-30T09:00:00Z',
            updatedAt: '2024-10-30T09:00:00Z',
          },
          customer: {
            id: '4',
            userId: session?.user?.email || '',
            name: 'Emma Thompson',
            email: 'emma@example.com',
            phone: '+44 777 888 9999',
            address: '321 Maple Drive',
            city: 'Leeds',
            postcode: 'LS1 2AB',
            createdAt: '2024-10-25T16:30:00Z',
            updatedAt: '2024-10-25T16:30:00Z',
          }
        }
      ]
      setInvoices(mockInvoices)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.job?.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)

  const outstandingAmount = invoices
    .filter(inv => ['sent', 'overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.total, 0)

  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage invoicing and track payments</p>
        </div>
        <Button asChild>
          <Link href="/app/invoices/new">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-green-600">Paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(outstandingAmount)}</div>
            <p className="text-xs text-blue-600">Pending payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueCount}</div>
            <p className="text-xs text-red-600">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Send className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter(inv => {
                const created = new Date(inv.createdAt)
                const now = new Date()
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
              }).length}
            </div>
            <p className="text-xs text-purple-600">New invoices</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                Track and manage all your invoices and payments
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-8 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const StatusIcon = statusIcons[invoice.status]
                const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date()
                const actualStatus = isOverdue ? 'overdue' : invoice.status

                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-medium">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(invoice.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customer?.name}</div>
                        <div className="text-sm text-gray-500">{invoice.customer?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm truncate max-w-[200px]" title={invoice.job?.title}>
                        {invoice.job?.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[actualStatus]} flex items-center gap-1 w-fit`}>
                        <StatusIcon className="h-3 w-3" />
                        {actualStatus.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(invoice.total)}</div>
                      {invoice.status === 'paid' && invoice.paidAt && (
                        <div className="text-xs text-green-600">
                          Paid {formatDate(invoice.paidAt)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        {formatDate(invoice.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/app/invoices/${invoice.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/app/invoices/${invoice.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Send Invoice
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}