import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getAllQuotes } from '@/lib/storage/quotes'

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