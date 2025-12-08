'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, Briefcase } from 'lucide-react'
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
import { Customer, Job, JobStatus } from '@/types/crm'

const statusColors: Record<JobStatus, string> = {
  lead: 'bg-primary/10 text-primary',
  quoted: 'bg-yellow-100 text-yellow-800',
  booked: 'bg-accent/10 text-accent',
  in_progress: 'bg-secondary/10 text-secondary',
  completed: 'bg-primary/10 text-primary',
  cancelled: 'bg-red-100 text-red-800',
  on_hold: 'bg-gray-100 text-gray-800',
}

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCustomerData()
  }, [params.id])

  const fetchCustomerData = async () => {
    try {
      // Mock data for now - in production this would come from your API
      const mockCustomer: Customer = {
        id: params.id as string,
        userId: session?.user?.email || '',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+44 123 456 7890',
        address: '123 Garden Lane',
        city: 'London',
        postcode: 'SW1A 1AA',
        notes: 'Prefers modern garden design. Has large dog that needs to be considered in garden planning. Usually available weekdays after 3pm.',
        createdAt: '2024-11-20T10:00:00Z',
        updatedAt: '2024-11-20T10:00:00Z',
      }

      const mockJobs: Job[] = [
        {
          id: '1',
          userId: session?.user?.email || '',
          customerId: params.id as string,
          title: 'Garden Design & Installation',
          description: 'Complete garden makeover with modern landscape design',
          status: 'in_progress',
          priority: 'high',
          type: 'design',
          estimatedValue: 15000,
          actualValue: 14500,
          estimatedHours: 40,
          actualHours: 35,
          startDate: '2024-12-01',
          endDate: '2024-12-15',
          createdAt: '2024-11-28T10:00:00Z',
          updatedAt: '2024-11-28T10:00:00Z',
        },
        {
          id: '4',
          userId: session?.user?.email || '',
          customerId: params.id as string,
          title: 'Spring Maintenance Package',
          description: 'Annual spring garden maintenance and pruning',
          status: 'quoted',
          priority: 'medium',
          type: 'maintenance',
          estimatedValue: 800,
          estimatedHours: 12,
          createdAt: '2024-11-26T12:00:00Z',
          updatedAt: '2024-11-26T12:00:00Z',
        }
      ]

      setCustomer(mockCustomer)
      setJobs(mockJobs)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching customer:', error)
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
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const totalValue = jobs.reduce((sum, job) => sum + (job.estimatedValue || 0), 0)
  const completedJobs = jobs.filter(job => job.status === 'completed').length
  const activeJobs = jobs.filter(job => ['booked', 'in_progress'].includes(job.status)).length

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

  if (!customer) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Customer Not Found</h1>
          <p className="text-gray-600 mb-6">The customer you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/app/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
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
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            <p className="text-gray-600 mt-1">Customer since {formatDate(customer.createdAt)}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/app/customers/${customer.id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-gray-500">{activeJobs} currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-gray-500">All projects combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedJobs}</div>
            <p className="text-xs text-gray-500">Finished projects</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Jobs</CardTitle>
              <CardDescription>
                All jobs and projects for this customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Scheduled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow
                      key={job.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/app/jobs/${job.id}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {job.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[job.status]}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{job.type}</TableCell>
                      <TableCell>
                        {job.estimatedValue ? formatCurrency(job.estimatedValue) : '-'}
                      </TableCell>
                      <TableCell>
                        {job.startDate ? formatDate(job.startDate) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium">{customer.email}</div>
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">{customer.phone}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {customer.address && <div className="font-medium">{customer.address}</div>}
                <div className="text-gray-500">
                  {customer.city} {customer.postcode}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => router.push('/app/jobs/new')}>
                Create New Job
              </Button>
              <Button variant="outline" className="w-full">
                Send Email
              </Button>
              <Button variant="outline" className="w-full">
                Schedule Call
              </Button>
              <Button variant="outline" className="w-full">
                View History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}