'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FolderKanban,
  Plus,
  Calculator,
  Settings,
  Briefcase,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    outstandingInvoices: 0,
    jobsThisWeek: 0
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    // Mock data for now - in production this would come from your API
    const mockStats = {
      totalJobs: 12,
      activeJobs: 5,
      totalCustomers: 8,
      totalRevenue: 23400,
      outstandingInvoices: 3,
      jobsThisWeek: 4
    }
    setStats(mockStats)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's your business overview and quick actions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-gray-500">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-gray-500">Of {stats.totalJobs} total jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-gray-500">Total customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jobsThisWeek}</div>
            <p className="text-xs text-gray-500">Jobs scheduled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest business updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="text-sm">
                  <span className="font-medium">Garden Design completed</span>
                  <div className="text-gray-500">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-blue-500" />
                <div className="text-sm">
                  <span className="font-medium">Invoice sent to Sarah J.</span>
                  <div className="text-gray-500">5 hours ago</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Plus className="h-4 w-4 text-purple-500" />
                <div className="text-sm">
                  <span className="font-medium">New customer added</span>
                  <div className="text-gray-500">1 day ago</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Upcoming This Week</CardTitle>
            <CardDescription>Jobs and appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">Garden Installation</div>
                  <div className="text-gray-500 text-xs">John Smith - London</div>
                </div>
                <div className="text-xs text-gray-500">Today</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">Maintenance Visit</div>
                  <div className="text-gray-500 text-xs">Sarah Johnson - Manchester</div>
                </div>
                <div className="text-xs text-gray-500">Tomorrow</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">Quote Meeting</div>
                  <div className="text-gray-500 text-xs">Mike Wilson - Birmingham</div>
                </div>
                <div className="text-xs text-gray-500">Friday</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Outstanding Items</CardTitle>
            <CardDescription>Needs attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Pending invoices</span>
                </div>
                <span className="font-medium">{stats.outstandingInvoices}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Draft quotes</span>
                </div>
                <span className="font-medium">2</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Follow-ups due</span>
                </div>
                <span className="font-medium">1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/app/jobs/new">
            <Button className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <Plus className="h-6 w-6" />
              <span>New Job</span>
            </Button>
          </Link>

          <Link href="/app/customers/new">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              <span>Add Customer</span>
            </Button>
          </Link>

          <Link href="/app/schedule">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <Calendar className="h-6 w-6" />
              <span>Schedule</span>
            </Button>
          </Link>

          <Link href="/app/invoices">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <FileText className="h-6 w-6" />
              <span>Invoices</span>
            </Button>
          </Link>

          <Link href="/app/projects/new">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <FolderKanban className="h-6 w-6" />
              <span>New Project</span>
            </Button>
          </Link>

          <Link href="/app/projects">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <FolderKanban className="h-6 w-6" />
              <span>View Projects</span>
            </Button>
          </Link>

          <Link href="/app/rate-card">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <Calculator className="h-6 w-6" />
              <span>Rate Card</span>
            </Button>
          </Link>

          <Link href="/app/settings">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <Settings className="h-6 w-6" />
              <span>Settings</span>
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
        <Card>
          <CardHeader>
            <CardTitle>Set Up Your Account</CardTitle>
            <CardDescription>
              Complete these steps to start using Gardenly effectively
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
                ✓
              </div>
              <span>Create your account</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm">
                2
              </div>
              <span>Set up your organization</span>
              <Link href="/app/settings">
                <Button size="sm" variant="outline">
                  Setup
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm">
                3
              </div>
              <span>Configure your rate card</span>
              <Link href="/app/rate-card">
                <Button size="sm" variant="outline">
                  Configure
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm">
                4
              </div>
              <span>Create your first project</span>
              <Link href="/app/projects/new">
                <Button size="sm" variant="outline">
                  Create
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}