import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserOrganisation } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { generateQuoteFromDesign } from '@/lib/quotes/quoteGenerator'

export async function POST(
  request: NextRequest,
  { params }: { params: { designConceptId: string } }
) {
  try {
    const organisation = await getCurrentUserOrganisation()

    if (!organisation) {
      return NextResponse.json(
        { error: 'No organisation found' },
        { status: 400 }
      )
    }

    // Verify design concept exists and belongs to user's organisation
    const designConcept = await prisma.designConcept.findFirst({
      where: {
        id: params.designConceptId,
        project: {
          organisationId: organisation.id
        }
      },
      include: {
        project: true,
        designElements: true,
        quotes: true
      }
    })

    if (!designConcept) {
      return NextResponse.json(
        { error: 'Design concept not found' },
        { status: 404 }
      )
    }

    // Check if elements exist
    if (designConcept.designElements.length === 0) {
      return NextResponse.json(
        { error: 'No design elements found. Please extract elements first.' },
        { status: 400 }
      )
    }

    // Check if quote already exists
    if (designConcept.quotes.length > 0) {
      return NextResponse.json(
        {
          error: 'Quote already exists for this design',
          existingQuote: designConcept.quotes[0]
        },
        { status: 400 }
      )
    }

    // Get organisation's rate card
    const rateCard = await prisma.rateCard.findFirst({
      where: {
        organisationId: organisation.id
      },
      include: {
        rateItems: true
      }
    })

    if (!rateCard) {
      return NextResponse.json(
        { error: 'No rate card found. Please set up your pricing first.' },
        { status: 400 }
      )
    }

    // Generate quote
    const quoteData = await generateQuoteFromDesign(
      designConcept,
      rateCard
    )

    // Save quote to database
    const savedQuote = await prisma.quote.create({
      data: {
        projectId: designConcept.project.id,
        designConceptId: params.designConceptId,
        subtotal: quoteData.subtotal,
        profit: quoteData.profit,
        total: quoteData.total,
        lowEstimate: quoteData.lowEstimate,
        highEstimate: quoteData.highEstimate,
        currency: quoteData.currency,
        lineItems: {
          create: quoteData.lineItems.map((item) => ({
            elementType: item.elementType,
            description: item.description,
            quantityNumeric: item.quantityNumeric,
            unit: item.unit,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
          }))
        }
      },
      include: {
        lineItems: true,
        designConcept: true,
        project: true
      }
    })

    // Update project status
    await prisma.project.update({
      where: { id: designConcept.project.id },
      data: { status: 'QUOTED' }
    })

    return NextResponse.json(savedQuote, { status: 201 })
  } catch (error) {
    console.error('Error generating quote:', error)
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    )
  }
}