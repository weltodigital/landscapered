import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getAllQuotes, addQuote } from '@/lib/storage/quotes'
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
    const allQuotes = getAllQuotes()
    const userQuotes = allQuotes.filter(quote => quote.userId === session.user.email)

    // Transform quotes to match the expected format for the quotes page
    const transformedQuotes = userQuotes.map(quote => ({
      id: quote.id,
      customerId: quote.projectId, // Using projectId as customerId for now
      quoteNumber: `QUO-${quote.createdAt.slice(0, 10).replace(/-/g, '')}-${quote.id.slice(-3)}`,
      status: quote.status.toLowerCase(), // Convert to lowercase for consistency
      validUntil: quote.validUntil.slice(0, 10), // Convert to date string
      items: quote.elements || [],
      subtotal: quote.pricing.subtotal,
      markup: quote.pricing.vatAmount, // Using VAT as markup for now
      tax: quote.pricing.vatAmount,
      total: quote.pricing.total,
      notes: quote.clientDetails?.notes || `Quote for project ${quote.projectId}`,
      terms: 'Payment due within 30 days of acceptance.',
      createdBy: quote.userId,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      projectId: quote.projectId
    }))

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
  quoteNumber: z.string().min(1, 'Quote number is required'),
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
  status: z.string().default('draft')
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

    // Create new quote object
    const newQuote = {
      id: `quote-${Date.now()}`,
      userId: session.user.email,
      projectId: validatedData.jobId || validatedData.customerId,
      status: validatedData.status.toUpperCase(),
      validUntil: validatedData.validUntil,
      pricing: {
        subtotal: validatedData.subtotal,
        vatAmount: validatedData.tax,
        vatRate: 0.2,
        total: validatedData.total,
        currency: 'GBP'
      },
      elements: validatedData.items.map(item => ({
        id: item.id,
        type: item.customDescription || 'Custom Item',
        description: item.customDescription || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        category: item.category
      })),
      clientDetails: {
        customerId: validatedData.customerId,
        notes: validatedData.notes || ''
      },
      terms: validatedData.terms || 'Payment due within 30 days of acceptance.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add the quote using the storage function
    addQuote(newQuote)

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