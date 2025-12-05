import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string, designId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params to get the projectId and designId
    const { projectId, designId } = await params

    // Get projects from global storage
    const projects = (global as any).projects || []
    const project = projects.find((p: any) => p.id === projectId && p.userId === session.user.email)

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Remove the design from the project's designs array
    if (project.designs) {
      project.designs = project.designs.filter((d: any) => d.id !== designId)
      project.updatedAt = new Date().toISOString()
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting design:', error)
    return NextResponse.json(
      { error: 'Failed to delete design' },
      { status: 500 }
    )
  }
}