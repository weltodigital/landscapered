'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User
} from 'lucide-react'
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
  lead: 'bg-blue-100 text-blue-800',
  quoted: 'bg-yellow-100 text-yellow-800',
  booked: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-orange-100 text-orange-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  on_hold: 'bg-gray-100 text-gray-800',
}

export default function SchedulePage() {
  const { data: session } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      // Mock data for now - same as jobs page but with more scheduling focus
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
          startDate: '2024-12-02',
          endDate: '2024-12-15',
          scheduledDate: '2024-12-02',
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
          scheduledDate: '2024-12-03',
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
          scheduledDate: '2024-12-05',
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
        },
        {
          id: '4',
          userId: session?.user?.email || '',
          customerId: '4',
          title: 'Tree Pruning Service',
          description: 'Annual tree maintenance and pruning',
          status: 'booked',
          priority: 'medium',
          type: 'maintenance',
          estimatedValue: 750,
          estimatedHours: 6,
          scheduledDate: '2024-12-04',
          address: '321 Maple Drive',
          city: 'Leeds',
          postcode: 'LS1 2AB',
          createdAt: '2024-11-26T12:00:00Z',
          updatedAt: '2024-11-26T12:00:00Z',
          customer: {
            id: '4',
            userId: session?.user?.email || '',
            name: 'Emma Thompson',
            email: 'emma@example.com',
            phone: '+44 777 888 9999',
            address: '321 Maple Drive',
            city: 'Leeds',
            postcode: 'LS1 2AB',
            createdAt: '2024-11-23T16:30:00Z',
            updatedAt: '2024-11-23T16:30:00Z',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (estimatedHours?: number) => {
    if (!estimatedHours) return ''
    return `${estimatedHours}h`
  }

  const getWeekDays = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const dayOfWeek = startOfWeek.getDay()
    const monday = new Date(startOfWeek)
    monday.setDate(startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

    for (let i = 0; i < 7; i++) {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      week.push(day)
    }
    return week
  }

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return jobs.filter(job => job.scheduledDate === dateStr)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const weekDays = getWeekDays(currentDate)
  const upcomingJobs = jobs
    .filter(job => job.scheduledDate && new Date(job.scheduledDate) >= new Date())
    .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-gray-600 mt-1">Manage your job schedule and appointments</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            {viewMode === 'week' ? 'Month View' : 'Week View'}
          </Button>
          <Button asChild>
            <Link href="/app/jobs/new">
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weekDays.reduce((count, day) => count + getJobsForDate(day).length, 0)}
            </div>
            <p className="text-xs text-gray-500">Scheduled jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getJobsForDate(new Date()).length}
            </div>
            <p className="text-xs text-gray-500">Jobs today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(j => j.scheduledDate && new Date(j.scheduledDate) > new Date()).length}
            </div>
            <p className="text-xs text-gray-500">Future jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weekDays.reduce((total, day) => {
                const dayJobs = getJobsForDate(day)
                return total + dayJobs.reduce((sum, job) => sum + (job.estimatedHours || 0), 0)
              }, 0)}h
            </div>
            <p className="text-xs text-gray-500">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Week of {weekDays[0].toLocaleDateString('en-GB', { month: 'long', day: 'numeric' })}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => {
                  const dayJobs = getJobsForDate(day)
                  const isToday = day.toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] p-2 border rounded-lg ${
                        isToday ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isToday ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {day.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' })}
                      </div>
                      <div className="space-y-1">
                        {dayJobs.map((job) => (
                          <div
                            key={job.id}
                            className="text-xs p-2 rounded bg-white border cursor-pointer hover:shadow-sm"
                          >
                            <div className="font-medium truncate">{job.title}</div>
                            <div className="text-gray-500 truncate">{job.customer?.name}</div>
                            {job.estimatedHours && (
                              <div className="flex items-center text-gray-400">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(job.estimatedHours)}
                              </div>
                            )}
                            <Badge className={`text-xs ${statusColors[job.status]}`}>
                              {job.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Jobs</CardTitle>
              <CardDescription>Next scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingJobs.map((job) => (
                <div key={job.id} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{job.title}</div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <User className="h-3 w-3 mr-1" />
                        {job.customer?.name}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.city}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {job.scheduledDate && formatDate(job.scheduledDate)}
                      </div>
                    </div>
                    <Badge className={statusColors[job.status]}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}