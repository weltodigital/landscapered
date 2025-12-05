import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserOrganisation } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const organisation = await getCurrentUserOrganisation()

    if (!organisation) {
      return NextResponse.json(
        { error: 'No organisation found' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: {
        id: params.projectId,
        organisationId: organisation.id
      },
      include: {
        gardenPhotos: true,
        designConcepts: {
          include: {
            designElements: true,
            quotes: {
              include: {
                lineItems: true
              }
            }
          }
        },
        quotes: {
          include: {
            lineItems: true,
            designConcept: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json()
    const organisation = await getCurrentUserOrganisation()

    if (!organisation) {
      return NextResponse.json(
        { error: 'No organisation found' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: {
        id: params.projectId,
        organisationId: organisation.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const updatedProject = await prisma.project.update({
      where: { id: params.projectId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.clientName && { clientName: body.clientName }),
        ...(body.clientEmail && { clientEmail: body.clientEmail }),
        ...(body.status && { status: body.status }),
        ...(body.gardenLength !== undefined && { gardenLength: body.gardenLength }),
        ...(body.gardenWidth !== undefined && { gardenWidth: body.gardenWidth }),
        ...(body.dimensionUnit && { dimensionUnit: body.dimensionUnit }),
      },
      include: {
        gardenPhotos: true,
        designConcepts: {
          include: {
            designElements: true
          }
        }
      }
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const organisation = await getCurrentUserOrganisation()

    if (!organisation) {
      return NextResponse.json(
        { error: 'No organisation found' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: {
        id: params.projectId,
        organisationId: organisation.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    await prisma.project.delete({
      where: { id: params.projectId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}