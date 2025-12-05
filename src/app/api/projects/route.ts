import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// In-memory project storage (in production, this would be a database)
// Store in global to share between API routes
const projects: any[] = (global as any).projects || []
if (!(global as any).projects) {
  (global as any).projects = projects
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Filter projects for current user
    const userProjects = projects.filter(p => p.userId === session.user.email)

    return NextResponse.json(userProjects)

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

    // Create project object
    const newProject = {
      id: `proj-${Date.now()}`,
      title,
      clientName,
      clientEmail,
      description: description || '',
      preferredStyle: preferredStyle || '',
      gardenLength: gardenLength ? parseFloat(gardenLength) : null,
      gardenWidth: gardenWidth ? parseFloat(gardenWidth) : null,
      dimensionUnit: unit || 'metres',
      photos: photos,
      designs: [], // Array to store AI-generated designs
      userId: session.user.email,
      status: 'PLANNING' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store project (in production, save to database)
    projects.push(newProject)

    return NextResponse.json({
      id: newProject.id,
      title: newProject.title,
      clientName: newProject.clientName,
      status: newProject.status,
      photos: newProject.photos.map(p => ({ url: p.url, name: p.name })), // Don't send base64 in response
      createdAt: newProject.createdAt,
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}