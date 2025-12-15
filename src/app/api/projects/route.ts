import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user and their organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organisations: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Auto-create organization if user doesn't have one
    let organisation = user.organisations[0]
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
        }
      })
    }

    // Get projects for user's organization (exclude customer profiles)
    const projects = await prisma.project.findMany({
      where: {
        organisationId: organisation.id,
        status: { not: 'CUSTOMER_PROFILE' }
      },
      include: {
        gardenPhotos: true,
        designConcepts: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Transform to match expected format
    const transformedProjects = projects.map(project => ({
      id: project.id,
      title: project.title,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      description: project.description,
      preferredStyle: project.preferredStyle,
      gardenLength: project.gardenLength,
      gardenWidth: project.gardenWidth,
      dimensionUnit: project.dimensionUnit,
      status: project.status,
      photos: project.gardenPhotos.map(photo => ({
        url: photo.url,
        name: 'garden-photo.jpg'
      })),
      designs: project.designConcepts,
      userId: session.user.email,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    }))

    return NextResponse.json(transformedProjects)

  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user and their organization
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organisations: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Auto-create organization if user doesn't have one
    let organisation = user.organisations[0]
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
        }
      })
    }

    const formData = await request.formData()

    const title = formData.get('title') as string
    const clientName = formData.get('clientName') as string
    const clientEmail = formData.get('clientEmail') as string
    const description = formData.get('description') as string
    const preferredStyle = formData.get('preferredStyle') as string
    const gardenLength = formData.get('gardenLength') as string
    const gardenWidth = formData.get('gardenWidth') as string
    const unit = formData.get('unit') as string

    if (!title || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Process uploaded photos
    const photos: Array<{url: string, name: string, base64?: string}> = []
    let photoIndex = 0

    while (true) {
      const photo = formData.get(`photo${photoIndex}`) as File | null
      if (!photo) break

      // Convert photo to base64 for AI analysis
      const arrayBuffer = await photo.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const mimeType = photo.type || 'image/jpeg'
      const dataUrl = `data:${mimeType};base64,${base64}`

      photos.push({
        url: `/uploads/${Date.now()}-${photo.name}`, // Mock URL for display
        name: photo.name,
        base64: dataUrl // Store base64 for AI analysis
      })

      photoIndex++
    }

    // Create project in database
    const newProject = await prisma.project.create({
      data: {
        organisationId: organisation.id,
        title,
        clientName,
        clientEmail,
        description: description || '',
        preferredStyle: preferredStyle || '',
        gardenLength: gardenLength ? parseFloat(gardenLength) : null,
        gardenWidth: gardenWidth ? parseFloat(gardenWidth) : null,
        dimensionUnit: unit || 'metres',
        status: 'PLANNING',
        gardenPhotos: {
          create: photos.map(photo => ({
            url: photo.base64 || photo.url // Store base64 for AI analysis
          }))
        }
      },
      include: {
        gardenPhotos: true,
        designConcepts: true
      }
    })

    // Transform to match expected format
    const responseProject = {
      id: newProject.id,
      title: newProject.title,
      clientName: newProject.clientName,
      clientEmail: newProject.clientEmail,
      description: newProject.description,
      preferredStyle: newProject.preferredStyle,
      gardenLength: newProject.gardenLength,
      gardenWidth: newProject.gardenWidth,
      dimensionUnit: newProject.dimensionUnit,
      status: newProject.status,
      photos: newProject.gardenPhotos.map(photo => ({
        url: photo.url,
        name: 'garden-photo.jpg'
      })),
      designs: newProject.designConcepts,
      userId: session.user.email,
      createdAt: newProject.createdAt.toISOString(),
      updatedAt: newProject.updatedAt.toISOString()
    }

    return NextResponse.json(responseProject, { status: 201 })

  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}