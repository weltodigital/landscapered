import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const createOrganisationSchema = z.object({
  name: z.string().min(1, 'Organisation name is required'),
  logoUrl: z.string().optional(),
})

const updateOrganisationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Organisation name is required').optional(),
  logoUrl: z.string().optional(),
})

export async function GET() {
  try {
    const user = await getCurrentUser()

    const organisations = await prisma.organisation.findMany({
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

    return NextResponse.json(organisations)
  } catch (error) {
    console.error('Error fetching organisations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organisations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createOrganisationSchema.parse(body)
    const user = await getCurrentUser()

    // Check if user already has an organisation
    if (user.organisations.length > 0) {
      return NextResponse.json(
        { error: 'User already has an organisation' },
        { status: 400 }
      )
    }

    const organisation = await prisma.organisation.create({
      data: {
        name: validatedData.name,
        logoUrl: validatedData.logoUrl,
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

    return NextResponse.json(organisation, { status: 201 })
  } catch (error) {
    console.error('Error creating organisation:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create organisation' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = updateOrganisationSchema.parse(body)
    const user = await getCurrentUser()

    // Check if organisation exists and belongs to user
    const existingOrganisation = await prisma.organisation.findFirst({
      where: {
        id: validatedData.id,
        ownerId: user.id
      }
    })

    if (!existingOrganisation) {
      return NextResponse.json(
        { error: 'Organisation not found or access denied' },
        { status: 404 }
      )
    }

    // Update organisation
    const updateData: any = {}
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name
    }
    if (validatedData.logoUrl !== undefined) {
      updateData.logoUrl = validatedData.logoUrl
    }

    const organisation = await prisma.organisation.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        rateCards: {
          include: {
            rateItems: true
          }
        }
      }
    })

    return NextResponse.json(organisation)
  } catch (error) {
    console.error('Error updating organisation:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update organisation' },
      { status: 500 }
    )
  }
}