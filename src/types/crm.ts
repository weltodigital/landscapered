export interface Customer {
  id: string
  userId: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  postcode?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Job {
  id: string
  userId: string
  customerId: string
  projectId?: string
  title: string
  description?: string
  status: JobStatus
  priority: JobPriority
  type: JobType
  estimatedValue?: number
  actualValue?: number
  estimatedHours?: number
  actualHours?: number
  startDate?: string
  endDate?: string
  scheduledDate?: string
  completedAt?: string
  address?: string
  city?: string
  postcode?: string
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations
  customer?: Customer
  invoices?: Invoice[]
  activities?: JobActivity[]
}

export interface JobActivity {
  id: string
  jobId: string
  userId: string
  type: ActivityType
  description: string
  hours?: number
  date: string
  createdAt: string
}

export interface Invoice {
  id: string
  userId: string
  jobId: string
  customerId: string
  invoiceNumber: string
  status: InvoiceStatus
  subtotal: number
  tax: number
  total: number
  dueDate: string
  paidAt?: string
  sentAt?: string
  notes?: string
  createdAt: string
  updatedAt: string

  // Relations
  job?: Job
  customer?: Customer
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  createdAt: string
}

export type JobStatus =
  | 'lead'
  | 'quoted'
  | 'booked'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold'

export type JobPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'

export type JobType =
  | 'design'
  | 'installation'
  | 'maintenance'
  | 'consultation'
  | 'quote'
  | 'other'

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled'

export type ActivityType =
  | 'call'
  | 'email'
  | 'visit'
  | 'work'
  | 'note'
  | 'quote_sent'
  | 'payment_received'

export interface CRMStats {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  totalCustomers: number
  totalRevenue: number
  outstandingInvoices: number
  jobsByStatus: Record<JobStatus, number>
  revenueThisMonth: number
  jobsThisMonth: number
}