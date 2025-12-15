import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
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

    if (!user || user.organisations.length === 0) {
      return NextResponse.json(
        { error: 'No organisation found' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        organisationId: user.organisations[0].id
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
      // Debug: Get all available project IDs for this organization
      const allProjects = await prisma.project.findMany({
        where: { organisationId: user.organisations[0].id },
        select: { id: true, title: true }
      })

      console.error(`Project not found. Requested ID: ${projectId}. Available project IDs:`, allProjects.map(p => `${p.id} (${p.title})`))

      return NextResponse.json(
        {
          error: 'Project not found',
          debug: {
            requestedId: projectId,
            availableProjects: allProjects.map(p => ({ id: p.id, title: p.title }))
          }
        },
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
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const body = await request.json()
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

    if (!user || user.organisations.length === 0) {
      return NextResponse.json(
        { error: 'No organisation found' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        organisationId: user.organisations[0].id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
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
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
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

    if (!user || user.organisations.length === 0) {
      return NextResponse.json(
        { error: 'No organisation found' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        organisationId: user.organisations[0].id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    await prisma.project.delete({
      where: { id: projectId }
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