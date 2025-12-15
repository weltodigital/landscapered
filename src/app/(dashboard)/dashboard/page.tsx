'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    outstandingInvoices: 0,
    jobsThisWeek: 0
  })
  const [completionState, setCompletionState] = useState({
    hasOrganization: false,
    hasCustomers: false,
    hasProjects: false,
    showGettingStarted: true
  })

  useEffect(() => {
    fetchDashboardStats()
    fetchCompletionState()
  }, [])

  // Refresh completion state when user returns to dashboard
  useEffect(() => {
    const handleFocus = () => {
      fetchCompletionState()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchDashboardStats = async () => {
    // All stats start at zero for clean app
    const emptyStats = {
      totalJobs: 0,
      activeJobs: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      outstandingInvoices: 0,
      jobsThisWeek: 0
    }
    setStats(emptyStats)
  }

  const fetchCompletionState = async () => {
    try {
      // Check if user has organizations
      const orgResponse = await fetch('/api/organisations')
      const organizations = orgResponse.ok ? await orgResponse.json() : []

      // Check if user has customers
      const customerResponse = await fetch('/api/customers')
      const customers = customerResponse.ok ? await customerResponse.json() : []

      // Check if user has projects
      const projectResponse = await fetch('/api/projects')
      const projects = projectResponse.ok ? await projectResponse.json() : []

      const hasOrganization = organizations.length > 0
      const hasCustomers = customers.length > 0
      const hasProjects = projects.length > 0

      setCompletionState({
        hasOrganization,
        hasCustomers,
        hasProjects,
        showGettingStarted: !(hasOrganization && hasCustomers && hasProjects)
      })
    } catch (error) {
      console.error('Error fetching completion state:', error)
    }
  }

  const handleDismissGettingStarted = () => {
    setCompletionState(prev => ({ ...prev, showGettingStarted: false }))
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
          Welcome back!
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
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-gray-500">Of {stats.totalJobs} total jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-gray-500">Total customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-secondary" />
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
            <div className="space-y-3 text-center text-gray-500">
              <p className="text-sm">No recent activity yet</p>
              <p className="text-xs">Activity will appear here as you use the app</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Upcoming This Week</CardTitle>
            <CardDescription>Jobs and appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-center text-gray-500">
              <p className="text-sm">No upcoming jobs scheduled</p>
              <p className="text-xs">Schedule jobs to see them here</p>
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
                  <Clock className="h-4 w-4 text-secondary" />
                  <span className="text-sm">Pending invoices</span>
                </div>
                <span className="font-medium">{stats.outstandingInvoices}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm">Draft quotes</span>
                </div>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm">Follow-ups due</span>
                </div>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/jobs/new">
            <Button className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <Plus className="h-6 w-6" />
              <span>New Job</span>
            </Button>
          </Link>

          <Link href="/customers/new">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              <span>Add Customer</span>
            </Button>
          </Link>

          <Link href="/quotes/new">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <Calculator className="h-6 w-6" />
              <span>New Quote</span>
            </Button>
          </Link>

          <Link href="/invoices">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <FileText className="h-6 w-6" />
              <span>Invoices</span>
            </Button>
          </Link>

          <Link href="/projects/new">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <FolderKanban className="h-6 w-6" />
              <span>New Project</span>
            </Button>
          </Link>

          <Link href="/projects">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <FolderKanban className="h-6 w-6" />
              <span>View Projects</span>
            </Button>
          </Link>

          <Link href="/settings">
            <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
              <Settings className="h-6 w-6" />
              <span>Settings</span>
            </Button>
          </Link>
        </div>
      </div>

      {completionState.showGettingStarted && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Getting Started</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismissGettingStarted}
              className="text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Set Up Your Account</CardTitle>
              <CardDescription>
                Complete these steps to start using Landscapered effectively
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                    ✓
                  </div>
                  <span>Create your account</span>
                </div>
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    completionState.hasOrganization
                      ? 'bg-primary text-primary-foreground'
                      : 'border-2 border-border text-muted-foreground'
                  }`}>
                    {completionState.hasOrganization ? '✓' : '2'}
                  </div>
                  <span className={completionState.hasOrganization ? 'line-through text-muted-foreground' : ''}>
                    Set up your organization
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {completionState.hasOrganization ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Link href="/settings">
                      <Button size="sm" variant="outline">
                        Setup
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    completionState.hasCustomers
                      ? 'bg-primary text-primary-foreground'
                      : 'border-2 border-border text-muted-foreground'
                  }`}>
                    {completionState.hasCustomers ? '✓' : '3'}
                  </div>
                  <span className={completionState.hasCustomers ? 'line-through text-muted-foreground' : ''}>
                    Add your first customer
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {completionState.hasCustomers ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Link href="/customers/new">
                      <Button size="sm" variant="outline">
                        Add Customer
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                    completionState.hasProjects
                      ? 'bg-primary text-primary-foreground'
                      : 'border-2 border-border text-muted-foreground'
                  }`}>
                    {completionState.hasProjects ? '✓' : '4'}
                  </div>
                  <span className={completionState.hasProjects ? 'line-through text-muted-foreground' : ''}>
                    Create your first project
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {completionState.hasProjects ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Link href="/projects/new">
                      <Button size="sm" variant="outline">
                        Create
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
// Force dynamic rendering
export const dynamic = 'force-dynamic'
