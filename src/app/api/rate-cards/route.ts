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
    let organisation = await prisma.organisation.findFirst({
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

    // Auto-create organization if user doesn't have one
    if (!organisation) {
      organisation = await prisma.organisation.create({
        data: {
          name: `${user.name || user.email.split('@')[0]}'s Company`,
          ownerId: user.id,
          rateCards: {
            create: {
              labourRatePerHour: 45.0,
              defaultProfitMarginPercent: 20.0,
              wasteDisposalRate: 150.0,
              travelCostPerMile: 0.5,
              rateItems: {
                create: [
                  {
                    elementType: 'PATIO',
                    unit: 'SQM',
                    baseMaterialCost: 50.0,
                    baseLabourHoursPerUnit: 2.0,
                  },
                  {
                    elementType: 'TURF',
                    unit: 'SQM',
                    baseMaterialCost: 15.0,
                    baseLabourHoursPerUnit: 0.5,
                  },
                  {
                    elementType: 'PERGOLA',
                    unit: 'UNIT',
                    baseMaterialCost: 800.0,
                    baseLabourHoursPerUnit: 8.0,
                  },
                  {
                    elementType: 'LIGHTING',
                    unit: 'UNIT',
                    baseMaterialCost: 120.0,
                    baseLabourHoursPerUnit: 2.0,
                  },
                  {
                    elementType: 'FENCING',
                    unit: 'METRE',
                    baseMaterialCost: 35.0,
                    baseLabourHoursPerUnit: 1.0,
                  },
                  {
                    elementType: 'RAISED_BED',
                    unit: 'SQM',
                    baseMaterialCost: 40.0,
                    baseLabourHoursPerUnit: 1.5,
                  },
                ]
              }
            }
          }
        },
        include: {
          rateCards: {
            include: {
              rateItems: true
            }
          }
        }
      })
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
    let organisation = await prisma.organisation.findFirst({
      where: {
        ownerId: user.id
      },
      include: {
        rateCards: true
      }
    })

    // Auto-create organization if user doesn't have one
    if (!organisation) {
      organisation = await prisma.organisation.create({
        data: {
          name: `${user.name || user.email.split('@')[0]}'s Company`,
          ownerId: user.id,
          rateCards: {
            create: {
              labourRatePerHour: 45.0,
              defaultProfitMarginPercent: 20.0,
              wasteDisposalRate: 150.0,
              travelCostPerMile: 0.5,
              rateItems: {
                create: [
                  {
                    elementType: 'PATIO',
                    unit: 'SQM',
                    baseMaterialCost: 50.0,
                    baseLabourHoursPerUnit: 2.0,
                  },
                  {
                    elementType: 'TURF',
                    unit: 'SQM',
                    baseMaterialCost: 15.0,
                    baseLabourHoursPerUnit: 0.5,
                  },
                  {
                    elementType: 'PERGOLA',
                    unit: 'UNIT',
                    baseMaterialCost: 800.0,
                    baseLabourHoursPerUnit: 8.0,
                  },
                  {
                    elementType: 'LIGHTING',
                    unit: 'UNIT',
                    baseMaterialCost: 120.0,
                    baseLabourHoursPerUnit: 2.0,
                  },
                  {
                    elementType: 'FENCING',
                    unit: 'METRE',
                    baseMaterialCost: 35.0,
                    baseLabourHoursPerUnit: 1.0,
                  },
                  {
                    elementType: 'RAISED_BED',
                    unit: 'SQM',
                    baseMaterialCost: 40.0,
                    baseLabourHoursPerUnit: 1.5,
                  },
                ]
              }
            }
          }
        },
        include: {
          rateCards: true
        }
      })
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