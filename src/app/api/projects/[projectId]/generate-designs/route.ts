import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { generateGardenDesignImage, downloadAndStoreImage, createDesignElements, analyzeGardenImage } from '@/lib/ai/ideogram'

// Real AI design generation service using Ideogram AI

const DESIGN_STYLES = {
  Modern: {
    description: 'Clean lines, minimal plantings, and contemporary materials create a sleek outdoor space.',
    characteristics: ['Geometric shapes', 'Concrete features', 'Ornamental grasses', 'Water features'],
  },
  Cottage: {
    description: 'Charming, informal garden with abundant flowering plants and natural materials.',
    characteristics: ['Mixed flower borders', 'Gravel paths', 'Climbing roses', 'Herb garden'],
  },
  Luxury: {
    description: 'Sophisticated design with premium materials and statement features.',
    characteristics: ['Premium stone', 'Outdoor lighting', 'Water features', 'Mature plantings'],
  },
  Minimalist: {
    description: 'Simple, uncluttered design focusing on form and negative space.',
    characteristics: ['Limited plant palette', 'Clean surfaces', 'Structural plants', 'Simple materials'],
  },
}

const GARDEN_ELEMENTS = [
  { type: 'PATIO', name: 'Natural Stone Patio', area: 25, unit: 'SQM' },
  { type: 'TURF', name: 'Premium Lawn Turf', area: 45, unit: 'SQM' },
  { type: 'PLANTING_BED', name: 'Mixed Planting Border', area: 15, unit: 'SQM' },
  { type: 'PATHWAY', name: 'Gravel Pathway', area: 12, unit: 'SQM' },
  { type: 'WATER_FEATURE', name: 'Contemporary Water Feature', area: 1, unit: 'UNIT' },
  { type: 'LIGHTING', name: 'Garden LED Lighting', area: 6, unit: 'UNIT' },
  { type: 'PERGOLA', name: 'Timber Pergola', area: 1, unit: 'UNIT' },
  { type: 'RAISED_BED', name: 'Raised Planting Bed', area: 8, unit: 'SQM' },
]

// Simulate AI processing delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Await params to get the projectId
    const { projectId } = await params

    const body = await request.json()
    const { styles, usePreferredStyle = true, selectedElements = [] } = body

    // First, we need to get the project photos for analysis
    // In production, this would be fetched from database
    // For now, we'll simulate getting it from in-memory storage
    const projects = (global as any).projects || []
    const project = projects.find((p: any) => p.id === projectId)

    let gardenAnalysis = ''

    // Determine which style to generate (single design)
    let styleToGenerate = 'Modern' // Default style
    if (usePreferredStyle && project?.preferredStyle) {
      // Use the preferred style
      styleToGenerate = project.preferredStyle
    } else if (styles && styles.length > 0) {
      // Use the first provided style
      styleToGenerate = styles[0]
    }

    // Analyze the first uploaded photo if available
    if (project?.photos?.[0]?.base64) {
      console.log('Analyzing garden image for context...')
      try {
        gardenAnalysis = await analyzeGardenImage(project.photos[0].base64)
        console.log('Garden analysis complete:', gardenAnalysis.substring(0, 100) + '...')
      } catch (error) {
        console.error('Failed to analyze garden image:', error)
      }
    }

    // Generate single AI design concept
    const styleConfig = DESIGN_STYLES[styleToGenerate as keyof typeof DESIGN_STYLES] || DESIGN_STYLES.Modern
    const designId = `design-${projectId}-${Date.now()}`

    let design
    try {
      // Prepare garden dimensions if available
      const gardenDimensions = (project?.gardenLength && project?.gardenWidth) ? {
        length: project.gardenLength,
        width: project.gardenWidth,
        unit: project.dimensionUnit || 'metres'
      } : undefined

      // Generate image using Ideogram AI with garden context and selected elements
      const imageUrl = await generateGardenDesignImage(
        styleToGenerate,
        styleConfig.description,
        styleConfig.characteristics,
        gardenAnalysis,
        undefined, // variationIndex
        selectedElements.length > 0 ? selectedElements : undefined,
        gardenDimensions
      )

      // Store the image (in production, you'd upload to cloud storage)
      const storedImageUrl = await downloadAndStoreImage(imageUrl, designId)

      // Generate garden elements for this style
      const elements = createDesignElements(styleToGenerate).map((element, elementIndex) => ({
        ...element,
        id: `element-${designId}-${elementIndex}`,
        designId: designId,
      }))

      design = {
        id: designId,
        projectId: projectId,
        style: styleToGenerate,
        title: `${styleToGenerate} Garden Design`,
        description: styleConfig.description,
        imageUrl: storedImageUrl,
        elements: elements,
        characteristics: styleConfig.characteristics,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error(`Error generating ${styleToGenerate} design:`, error)

      // Fallback to placeholder if AI generation fails
      const elements = createDesignElements(styleToGenerate).map((element, elementIndex) => ({
        ...element,
        id: `element-${designId}-${elementIndex}`,
        designId: designId,
      }))

      design = {
        id: designId,
        projectId: projectId,
        style: styleToGenerate,
        title: `${styleToGenerate} Garden Design`,
        description: styleConfig.description,
        imageUrl: `/mock-designs/${styleToGenerate.toLowerCase()}-placeholder.jpg`,
        elements: elements,
        characteristics: styleConfig.characteristics,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        error: 'AI generation failed, using placeholder'
      }
    }

    // Save design to the project
    if (project) {
      // Add new design to the project's designs array
      project.designs = [...(project.designs || []), design]
      project.updatedAt = new Date().toISOString()
    }

    return NextResponse.json([design], { status: 201 })

  } catch (error) {
    console.error('Error generating designs:', error)
    return NextResponse.json(
      { error: 'Failed to generate designs' },
      { status: 500 }
    )
  }
}