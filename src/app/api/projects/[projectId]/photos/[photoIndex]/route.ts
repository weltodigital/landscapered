import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string, photoIndex: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params to get the projectId and photoIndex
    const { projectId, photoIndex } = await params
    const index = parseInt(photoIndex)

    if (isNaN(index)) {
      return NextResponse.json(
        { error: 'Invalid photo index' },
        { status: 400 }
      )
    }

    // Get projects from global storage
    const projects = (global as any).projects || []
    const project = projects.find((p: any) => p.id === projectId && p.userId === session.user.email)

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (!project.photos || index < 0 || index >= project.photos.length) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Remove the photo from the project's photos array
    project.photos.splice(index, 1)
    project.updatedAt = new Date().toISOString()

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}