import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateRateCardSchema = z.object({
  labourRatePerHour: z.number().min(0),
  defaultProfitMarginPercent: z.number().min(0),
  wasteDisposalRate: z.number().min(0),
  travelCostPerMile: z.number().min(0),
})

export async function GET() {
  try {
    const user = await getCurrentUser()

    // Get user's organization and rate card
    const organisation = await prisma.organisation.findFirst({
      where: {
        ownerId: user.id
      },
      include: {
        rateCards: {
          include: {
            rateItems: true
          }
        }
      }
    })

    if (!organisation || !organisation.rateCards.length) {
      return NextResponse.json(null)
    }

    // Return the first (and should be only) rate card
    const rateCard = organisation.rateCards[0]

    return NextResponse.json(rateCard)
  } catch (error) {
    console.error('Error fetching rate card:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rate card' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = updateRateCardSchema.parse(body)
    const user = await getCurrentUser()

    // Get user's organization and rate card
    const organisation = await prisma.organisation.findFirst({
      where: {
        ownerId: user.id
      },
      include: {
        rateCards: true
      }
    })

    if (!organisation || !organisation.rateCards.length) {
      return NextResponse.json(
        { error: 'No rate card found for this organization' },
        { status: 404 }
      )
    }

    const rateCardId = organisation.rateCards[0].id

    // Update the rate card
    const updatedRateCard = await prisma.rateCard.update({
      where: { id: rateCardId },
      data: {
        labourRatePerHour: validatedData.labourRatePerHour,
        defaultProfitMarginPercent: validatedData.defaultProfitMarginPercent,
        wasteDisposalRate: validatedData.wasteDisposalRate,
        travelCostPerMile: validatedData.travelCostPerMile,
      },
      include: {
        rateItems: true
      }
    })

    return NextResponse.json(updatedRateCard)
  } catch (error) {
    console.error('Error updating rate card:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update rate card' },
      { status: 500 }
    )
  }
}