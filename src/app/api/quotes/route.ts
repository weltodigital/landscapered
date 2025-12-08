import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getAllQuotes, addQuote } from '@/lib/storage/quotes'
import { getCustomerByEmail } from '@/lib/storage/customers'
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
    const userQuotes = allQuotes.filter(quote => quote.userId === session.user.email)

    // Transform quotes to match the expected format for the quotes page
    const transformedQuotes = userQuotes.map(quote => {
      // Handle both old format (elements/pricing) and new format (flat structure)
      const isNewFormat = quote.items && !quote.elements

      return {
        id: quote.id,
        customerId: quote.customerId || quote.projectId,
        quoteNumber: quote.quoteNumber || `QUO-${quote.createdAt.slice(0, 10).replace(/-/g, '')}-${quote.id.slice(-3)}`,
        status: quote.status.toLowerCase(),
        validUntil: isNewFormat ? quote.validUntil : quote.validUntil.slice(0, 10),
        items: isNewFormat ? quote.items : (quote.elements || []),
        subtotal: isNewFormat ? quote.subtotal : quote.pricing.subtotal,
        markup: isNewFormat ? quote.markup : 0,
        tax: isNewFormat ? quote.tax : quote.pricing.vatAmount,
        total: isNewFormat ? quote.total : quote.pricing.total,
        notes: isNewFormat ? quote.notes : (quote.clientDetails?.notes || `Quote for project ${quote.projectId}`),
        terms: quote.terms || 'Payment due within 30 days of acceptance.',
        createdBy: quote.createdBy || quote.userId,
        createdAt: quote.createdAt,
        updatedAt: quote.updatedAt,
        projectId: quote.projectId || quote.customerId,
        designId: quote.designId,
        designImageUrl: quote.designImageUrl,
        designStyle: quote.designStyle,
        designImageNumber: quote.designImageNumber
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

    // Add the quote using the storage function
    const savedQuote = await addQuote(newQuote)

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