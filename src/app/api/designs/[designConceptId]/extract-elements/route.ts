import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserOrganisation } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { extractDesignElements } from '@/lib/ai/gardenDesignService'

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
        designElements: true
      }
    })

    if (!designConcept) {
      return NextResponse.json(
        { error: 'Design concept not found' },
        { status: 404 }
      )
    }

    // Check if elements have already been extracted
    if (designConcept.designElements.length > 0) {
      return NextResponse.json(
        {
          error: 'Elements have already been extracted for this design',
          existingElements: designConcept.designElements
        },
        { status: 400 }
      )
    }

    // Extract design elements using mock AI service
    const extractedElements = await extractDesignElements(params.designConceptId)

    // Save the extracted elements to database
    const savedElements = await Promise.all(
      extractedElements.map((element) =>
        prisma.designElement.create({
          data: {
            designConceptId: params.designConceptId,
            elementType: element.elementType,
            quantityNumeric: element.quantityNumeric,
            unit: element.unit,
            notes: element.notes,
          }
        })
      )
    )

    return NextResponse.json(savedElements, { status: 201 })
  } catch (error) {
    console.error('Error extracting design elements:', error)
    return NextResponse.json(
      { error: 'Failed to extract design elements' },
      { status: 500 }
    )
  }
}