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
      project: {
        title: dbQuote.project?.title || 'Garden Design Project',
        clientName: dbQuote.project?.clientName || 'Client',
        clientEmail: dbQuote.project?.clientEmail || ''
      },
      designConcept: {
        style: dbQuote.designConcept?.style || 'Modern'
      },
      subtotal: dbQuote.subtotal,
      profit: dbQuote.profit,
      total: dbQuote.total,
      lowEstimate: dbQuote.lowEstimate,
      highEstimate: dbQuote.highEstimate,
      currency: dbQuote.currency,
      createdAt: dbQuote.createdAt.toISOString(),
      lineItems: dbQuote.lineItems.map(item => ({
        description: item.description,
        quantityNumeric: item.quantityNumeric,
        unit: item.unit,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal
      }))
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