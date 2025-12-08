import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getAllQuotes, addQuote } from '@/lib/storage/quotes'
import { getCustomerByEmail } from '@/lib/storage/customers'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all quotes for the current user
    const allQuotes = await getAllQuotes()

    // Transform quotes to match the expected format for the quotes page
    const transformedQuotes = allQuotes.map(quote => {
      return {
        id: quote.id,
        customerId: quote.project?.clientEmail || '',
        quoteNumber: `QUO-${quote.createdAt.toISOString().slice(0, 10).replace(/-/g, '')}-${quote.id.slice(-3)}`,
        status: 'draft',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        items: quote.lineItems.map(item => ({
          id: item.id,
          customDescription: item.description,
          quantity: item.quantityNumeric,
          unitPrice: item.unitPrice,
          totalPrice: item.lineTotal,
          category: 'custom'
        })),
        subtotal: quote.subtotal,
        markup: 0,
        tax: quote.profit,
        total: quote.total,
        notes: `Quote for ${quote.project?.title || 'Garden Design Project'}`,
        terms: 'Payment due within 30 days of acceptance.',
        createdBy: quote.project?.clientEmail || '',
        createdAt: quote.createdAt.toISOString(),
        updatedAt: quote.updatedAt.toISOString(),
        projectId: quote.projectId,
        designId: quote.designConceptId,
        designImageUrl: quote.designConcept?.imageUrl,
        designStyle: quote.designConcept?.style,
        designImageNumber: 1
      }
    })

    return NextResponse.json(transformedQuotes)

  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

const createQuoteSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  jobId: z.string().optional(),
  quoteNumber: z.string().optional(),
  validUntil: z.string().min(1, 'Valid until date is required'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    quoteId: z.string(),
    productId: z.string().optional(),
    customDescription: z.string().optional(),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
    totalPrice: z.number().min(0),
    markup: z.number().optional(),
    markupPercent: z.number().optional(),
    category: z.enum(['product', 'service', 'custom']),
    createdAt: z.string()
  })),
  subtotal: z.number().min(0),
  markup: z.number().min(0),
  tax: z.number().min(0),
  total: z.number().min(0),
  status: z.string().default('draft'),
  designId: z.string().optional(),
  designImageUrl: z.string().optional(),
  designStyle: z.string().optional(),
  designImageNumber: z.number().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createQuoteSchema.parse(body)

    // Generate quote number with customer number
    let quoteNumber = `QUO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Try to find customer by email and use their customer number
    if (validatedData.customerId) {
      const customer = getCustomerByEmail(validatedData.customerId, session.user.email)
      if (customer?.customerNumber) {
        quoteNumber = `${customer.customerNumber}-QUO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      }
    }

    // Create new quote object in flat format for compatibility
    const newQuote = {
      id: `quote-${Date.now()}`,
      userId: session.user.email,
      customerId: validatedData.customerId,
      projectId: validatedData.jobId || validatedData.customerId,
      quoteNumber: quoteNumber,
      status: validatedData.status.toUpperCase(),
      validUntil: validatedData.validUntil,
      items: validatedData.items,
      subtotal: validatedData.subtotal,
      markup: validatedData.markup,
      tax: validatedData.tax,
      total: validatedData.total,
      notes: validatedData.notes || '',
      terms: validatedData.terms || 'Payment due within 30 days of acceptance.',
      designId: validatedData.designId,
      designImageUrl: validatedData.designImageUrl,
      designStyle: validatedData.designStyle,
      designImageNumber: validatedData.designImageNumber,
      createdBy: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Map the data to match the addQuote function expectations
    const mappedQuoteData = {
      ...newQuote,
      projectId: validatedData.jobId || validatedData.customerId, // Map jobId to projectId
      designConceptId: validatedData.designId, // Map designId to designConceptId
      items: validatedData.items
    }

    // Get user ID for proper organisation handling
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    // Add the quote using the storage function
    const savedQuote = await addQuote(mappedQuoteData, user?.id)

    return NextResponse.json(newQuote, { status: 201 })

  } catch (error) {
    console.error('Error creating quote:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    )
  }
}