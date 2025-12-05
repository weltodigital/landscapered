import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserOrganisation } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const organisation = await getCurrentUserOrganisation()

    if (!organisation) {
      return NextResponse.json(
        { error: 'No organisation found' },
        { status: 400 }
      )
    }

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
        { error: 'No rate card found' },
        { status: 404 }
      )
    }

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
    const organisation = await getCurrentUserOrganisation()

    if (!organisation) {
      return NextResponse.json(
        { error: 'No organisation found' },
        { status: 400 }
      )
    }

    const rateCard = await prisma.rateCard.findFirst({
      where: {
        organisationId: organisation.id
      }
    })

    if (!rateCard) {
      return NextResponse.json(
        { error: 'No rate card found' },
        { status: 404 }
      )
    }

    const updatedRateCard = await prisma.rateCard.update({
      where: { id: rateCard.id },
      data: {
        ...(body.labourRatePerHour !== undefined && { labourRatePerHour: body.labourRatePerHour }),
        ...(body.defaultProfitMarginPercent !== undefined && { defaultProfitMarginPercent: body.defaultProfitMarginPercent }),
        ...(body.wasteDisposalRate !== undefined && { wasteDisposalRate: body.wasteDisposalRate }),
        ...(body.travelCostPerMile !== undefined && { travelCostPerMile: body.travelCostPerMile }),
      },
      include: {
        rateItems: true
      }
    })

    return NextResponse.json(updatedRateCard)
  } catch (error) {
    console.error('Error updating rate card:', error)
    return NextResponse.json(
      { error: 'Failed to update rate card' },
      { status: 500 }
    )
  }
}