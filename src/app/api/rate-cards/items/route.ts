import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateRateItemSchema = z.object({
  itemId: z.string(),
  baseMaterialCost: z.number().min(0),
  baseLabourHoursPerUnit: z.number().min(0),
})

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = updateRateItemSchema.parse(body)
    const user = await getCurrentUser()

    // Verify that the rate item belongs to the user's organization
    const rateItem = await prisma.rateItem.findUnique({
      where: { id: validatedData.itemId },
      include: {
        rateCard: {
          include: {
            organisation: true
          }
        }
      }
    })

    if (!rateItem) {
      return NextResponse.json(
        { error: 'Rate item not found' },
        { status: 404 }
      )
    }

    if (rateItem.rateCard.organisation.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update the rate item
    const updatedRateItem = await prisma.rateItem.update({
      where: { id: validatedData.itemId },
      data: {
        baseMaterialCost: validatedData.baseMaterialCost,
        baseLabourHoursPerUnit: validatedData.baseLabourHoursPerUnit,
      }
    })

    return NextResponse.json(updatedRateItem)
  } catch (error) {
    console.error('Error updating rate item:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update rate item' },
      { status: 500 }
    )
  }
}