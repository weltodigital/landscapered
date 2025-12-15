import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user and their organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organisations: true }
    })

    if (!user || user.organisations.length === 0) {
      return NextResponse.json([])
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    // Get unique customers from projects
    const projects = await prisma.project.findMany({
      where: {
        organisationId: user.organisations[0].id,
        ...(search && {
          OR: [
            { clientName: { contains: search, mode: 'insensitive' } },
            { clientEmail: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      select: {
        clientName: true,
        clientEmail: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Create unique customers list
    const uniqueCustomersMap = new Map()

    projects.forEach(project => {
      const key = project.clientEmail
      if (!uniqueCustomersMap.has(key)) {
        uniqueCustomersMap.set(key, {
          id: `customer-${project.clientEmail.replace(/[@.]/g, '-')}`,
          name: project.clientName,
          email: project.clientEmail,
          customerNumber: `CUST-${String(uniqueCustomersMap.size + 1).padStart(4, '0')}`,
          phone: '',
          address: '',
          city: '',
          postcode: '',
          notes: '',
          userId: session.user.email,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.createdAt.toISOString()
        })
      }
    })

    const customers = Array.from(uniqueCustomersMap.values())

    return NextResponse.json(customers)

  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user and their organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organisations: true }
    })

    if (!user || user.organisations.length === 0) {
      return NextResponse.json(
        { error: 'User must have an organization' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = createCustomerSchema.parse(body)

    // Check if customer already exists
    const existingProject = await prisma.project.findFirst({
      where: {
        organisationId: user.organisations[0].id,
        clientEmail: validatedData.email
      }
    })

    if (existingProject) {
      return NextResponse.json(
        { error: 'Customer with this email already exists' },
        { status: 400 }
      )
    }

    // Create a placeholder project to represent the customer
    // This allows us to work with the existing database structure
    const project = await prisma.project.create({
      data: {
        organisationId: user.organisations[0].id,
        title: `Customer Profile - ${validatedData.name}`,
        clientName: validatedData.name,
        clientEmail: validatedData.email,
        description: `Customer: ${validatedData.name}\nPhone: ${validatedData.phone || 'Not provided'}\nAddress: ${[validatedData.address, validatedData.city, validatedData.postcode].filter(Boolean).join(', ') || 'Not provided'}\nNotes: ${validatedData.notes || 'None'}`,
        status: 'CUSTOMER_PROFILE' // Special status to identify customer profiles
      }
    })

    const customer = {
      id: `customer-${validatedData.email.replace(/[@.]/g, '-')}`,
      userId: session.user.email,
      customerNumber: `CUST-${String(Date.now()).slice(-4)}`,
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || '',
      address: validatedData.address || '',
      city: validatedData.city || '',
      postcode: validatedData.postcode || '',
      notes: validatedData.notes || '',
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }

    return NextResponse.json(customer, { status: 201 })

  } catch (error) {
    console.error('Error creating customer:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}