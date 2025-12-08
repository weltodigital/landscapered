import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateQuotePDF } from '@/lib/pdf/quote-generator'
import { getQuote } from '@/lib/storage/quotes'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params to get the quoteId
    const { quoteId } = await params

    // Find the actual quote from stored quotes
    const dbQuote = await getQuote(quoteId, session.user.email)

    if (!dbQuote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    // Convert database quote to PDF format
    const quote = {
      id: dbQuote.id,
      quoteNumber: `QUO-${dbQuote.createdAt.toISOString().slice(0, 10).replace(/-/g, '')}-${dbQuote.id.slice(-3)}`,
      projectId: dbQuote.projectId,
      customerId: dbQuote.project?.clientEmail || '',
      items: dbQuote.lineItems.map(item => ({
        id: item.id,
        customDescription: item.description,
        quantity: item.quantityNumeric,
        unitPrice: item.unitPrice,
        totalPrice: item.lineTotal,
        category: 'custom' as const
      })),
      subtotal: dbQuote.subtotal,
      markup: 0, // Database stores profit differently
      tax: dbQuote.profit, // Using profit as tax for now
      total: dbQuote.total,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      createdAt: dbQuote.createdAt.toISOString(),
      notes: `Quote for ${dbQuote.project?.title || 'Garden Design Project'}`,
      terms: 'Payment due within 30 days of acceptance.',
      createdBy: dbQuote.project?.clientEmail || '',
      designImageUrl: undefined,
      designStyle: dbQuote.designConcept?.style || 'Modern',
      organisation: dbQuote.project?.organisation ? {
        name: dbQuote.project.organisation.name,
        logoUrl: dbQuote.project.organisation.logoUrl || undefined
      } : undefined
    }


    // Generate PDF
    const doc = await generateQuotePDF(quote)
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Return PDF response
    const filename = `quote-${quoteId}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get quote data from request body
    const quoteData = await request.json()

    console.log('POST PDF generation with quote data:', quoteData.id)

    // Generate PDF with provided data
    const doc = await generateQuotePDF(quoteData)
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Return PDF response
    const filename = `quote-${quoteData.id}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error generating PDF via POST:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}