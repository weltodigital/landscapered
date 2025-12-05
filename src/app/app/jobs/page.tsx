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
  Trash2
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
import { Job, JobStatus } from '@/types/crm'

const statusColors: Record<JobStatus, string> = {
  lead: 'bg-blue-100 text-blue-800',
  quoted: 'bg-yellow-100 text-yellow-800',
  booked: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  on_hold: 'bg-gray-100 text-gray-800',
}

export default function JobsPage() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      // Mock data for now
      const mockJobs: Job[] = [
        {
          id: '1',
          userId: session?.user?.email || '',
          customerId: '1',
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
          scheduledDate: '2024-12-05',
          address: '123 Garden Lane',
          city: 'London',
          postcode: 'SW1A 1AA',
          createdAt: '2024-11-28T10:00:00Z',
          updatedAt: '2024-11-28T10:00:00Z',
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
          customerId: '2',
          title: 'Monthly Lawn Maintenance',
          description: 'Regular lawn care and maintenance service',
          status: 'booked',
          priority: 'medium',
          type: 'maintenance',
          estimatedValue: 500,
          estimatedHours: 8,
          scheduledDate: '2024-12-02',
          address: '456 Rose Street',
          city: 'Manchester',
          postcode: 'M1 1AA',
          createdAt: '2024-11-25T14:00:00Z',
          updatedAt: '2024-11-25T14:00:00Z',
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
          customerId: '3',
          title: 'Patio Installation Quote',
          description: 'Quote for new patio and outdoor seating area',
          status: 'quoted',
          priority: 'low',
          type: 'quote',
          estimatedValue: 8000,
          estimatedHours: 24,
          scheduledDate: '2024-12-10',
          address: '789 Oak Avenue',
          city: 'Birmingham',
          postcode: 'B1 1AA',
          createdAt: '2024-11-27T09:00:00Z',
          updatedAt: '2024-11-27T09:00:00Z',
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
        }
      ]
      setJobs(mockJobs)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-gray-600 mt-1">Manage your landscaping jobs and projects</p>
        </div>
        <Button asChild>
          <Link href="/app/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(j => ['booked', 'in_progress'].includes(j.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(jobs.reduce((sum, job) => sum + (job.estimatedValue || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(j => j.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Jobs</CardTitle>
              <CardDescription>
                Manage and track all your landscaping jobs
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search jobs..."
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
                <TableHead>Job</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">
                        {job.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{job.customer?.name}</div>
                      <div className="text-sm text-gray-500">{job.customer?.email}</div>
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
                    {job.scheduledDate ? formatDate(job.scheduledDate) : '-'}
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
                          <Link href={`/app/jobs/${job.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/app/jobs/${job.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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