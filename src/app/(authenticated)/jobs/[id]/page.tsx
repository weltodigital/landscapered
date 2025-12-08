'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Edit, Calendar, MapPin, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Job, JobStatus } from '@/types/crm'

const statusColors: Record<JobStatus, string> = {
  lead: 'bg-primary/10 text-primary',
  quoted: 'bg-yellow-100 text-yellow-800',
  booked: 'bg-accent/10 text-accent',
  in_progress: 'bg-secondary/10 text-secondary',
  completed: 'bg-primary/10 text-primary',
  cancelled: 'bg-red-100 text-red-800',
  on_hold: 'bg-gray-100 text-gray-800',
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJob()
  }, [params.id])

  const fetchJob = async () => {
    try {
      // Mock data for now - in production this would come from your API
      const mockJob: Job = {
        id: params.id as string,
        userId: session?.user?.email || '',
        customerId: '1',
        title: 'Garden Design & Installation',
        description: 'Complete garden makeover with modern landscape design including new patio area, lawn renovation, and contemporary planting scheme.',
        status: 'in_progress',
        priority: 'high',
        type: 'design',
        estimatedValue: 15000,
        actualValue: 14500,
        estimatedHours: 40,
        actualHours: 35,
        startDate: '2024-12-01',
        endDate: '2024-12-15',
        address: '123 Garden Lane',
        city: 'London',
        postcode: 'SW1A 1AA',
        notes: 'Customer prefers modern, low-maintenance plants. Access through side gate only.',
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
      }
      setJob(mockJob)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching job:', error)
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
      weekday: 'long',
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

  if (!job) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/app/jobs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
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
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-gray-600 mt-1">Job #{job.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={statusColors[job.status]}>
            {job.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Button onClick={() => router.push(`/app/jobs/${job.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-600">{job.description}</p>
              </div>

              {job.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-gray-600">{job.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="font-medium capitalize">{job.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Priority</div>
                  <div className="font-medium capitalize">{job.priority}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline & Estimates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Start Date</span>
                  </div>
                  {job.startDate ? (
                    <div className="font-medium">{formatDate(job.startDate)}</div>
                  ) : (
                    <div className="text-gray-400">Not scheduled</div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Duration</span>
                  </div>
                  <div className="font-medium">
                    {job.startDate && job.endDate ? (
                      <>{formatDate(job.startDate)} - {formatDate(job.endDate)}</>
                    ) : (
                      'To be determined'
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Estimated Value</span>
                  </div>
                  <div className="font-medium">
                    {job.estimatedValue ? formatCurrency(job.estimatedValue) : 'TBD'}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Estimated Hours</span>
                  </div>
                  <div className="font-medium">
                    {job.estimatedHours ? `${job.estimatedHours}h` : 'TBD'}
                  </div>
                </div>
              </div>

              {(job.actualValue || job.actualHours) && (
                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                  {job.actualValue && (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-500">Actual Value</div>
                      <div className="font-medium text-primary">
                        {formatCurrency(job.actualValue)}
                      </div>
                    </div>
                  )}

                  {job.actualHours && (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-500">Actual Hours</div>
                      <div className="font-medium text-primary">
                        {job.actualHours}h
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-medium">{job.customer?.name}</div>
                <div className="text-sm text-gray-500">{job.customer?.email}</div>
                {job.customer?.phone && (
                  <div className="text-sm text-gray-500">{job.customer.phone}</div>
                )}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/app/customers/${job.customerId}`)}
              >
                View Customer Details
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Job Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="font-medium">{job.address}</div>
                <div className="text-gray-500">
                  {job.city} {job.postcode}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                Update Status
              </Button>
              <Button variant="outline" className="w-full">
                Add Activity
              </Button>
              <Button variant="outline" className="w-full">
                Create Invoice
              </Button>
              <Button variant="outline" className="w-full">
                Schedule Follow-up
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}