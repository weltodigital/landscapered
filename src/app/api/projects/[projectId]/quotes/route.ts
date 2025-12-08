import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { addQuote, getQuotesByProject } from '@/lib/storage/quotes'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params to get the projectId
    const { projectId } = await params

    const body = await request.json()
    const { elements, clientDetails } = body

    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return NextResponse.json(
        { error: 'No elements provided for quote' },
        { status: 400 }
      )
    }

    // Calculate pricing for each element
    const basePrice = {
      'PATIO': 150,
      'TURF': 45,
      'PLANTING_BED': 85,
      'PATHWAY': 75,
      'WATER_FEATURE': 2500,
      'LIGHTING': 125,
      'PERGOLA': 3500,
      'RAISED_BED': 180,
    }

    const quotedElements = elements.map((element: any) => {
      const unitPrice = basePrice[element.type as keyof typeof basePrice] || 100
      const totalPrice = unitPrice * (element.unit === 'UNIT' ? 1 : element.area)

      return {
        ...element,
        unitPrice,
        totalPrice,
        quotedAt: new Date().toISOString()
      }
    })

    const subtotal = quotedElements.reduce((sum: number, element: any) => sum + element.totalPrice, 0)
    const vatRate = 0.20 // 20% VAT
    const vatAmount = subtotal * vatRate
    const totalAmount = subtotal + vatAmount

    // Generate quote object
    const quote = {
      id: `quote-${Date.now()}`,
      projectId: projectId,
      userId: session.user.email,
      elements: quotedElements,
      pricing: {
        subtotal,
        vatRate,
        vatAmount,
        total: totalAmount
      },
      status: 'DRAFT',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientDetails: clientDetails || null
    }

    // Store quote in database
    const savedQuote = await addQuote(quote)

    // Debug logging
    console.log('Quote created with ID:', quote.id)
    console.log('Quote stored for user:', quote.userId)

    return NextResponse.json(quote, { status: 201 })

  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { projectId } = await params

    // Filter quotes for current user and project
    const projectQuotes = await getQuotesByProject(projectId, session.user.email)

    return NextResponse.json(projectQuotes)

  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}