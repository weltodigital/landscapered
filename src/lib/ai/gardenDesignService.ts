import { ElementType, Unit } from '@prisma/client'

export interface DesignConcept {
  style: string
  imageUrl: string
  metadata: {
    prompt: string
    model: string
    generatedAt: string
  }
}

export interface DesignElement {
  elementType: ElementType
  quantityNumeric: number
  unit: Unit
  notes?: string
}

// Mock placeholder images for different garden styles
const mockImageUrls = [
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
  'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
  'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
]

/**
 * Mock AI service to generate design concepts
 * In production, this would call external AI APIs (OpenAI DALL-E, Midjourney, etc.)
 */
export async function generateDesignConcepts(
  projectId: string,
  styles: string[]
): Promise<DesignConcept[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  const concepts: DesignConcept[] = []

  for (const style of styles) {
    // Generate 3-5 concepts per style (for this mock, we'll do 1 per style)
    const concept: DesignConcept = {
      style,
      imageUrl: mockImageUrls[Math.floor(Math.random() * mockImageUrls.length)],
      metadata: {
        prompt: generatePromptForStyle(style),
        model: 'mock-ai-v1',
        generatedAt: new Date().toISOString(),
      }
    }

    concepts.push(concept)

    // Add variations for certain styles
    if (concepts.length < 5 && (style === 'Modern' || style === 'Luxury')) {
      const variation: DesignConcept = {
        style: `${style} Variation`,
        imageUrl: mockImageUrls[Math.floor(Math.random() * mockImageUrls.length)],
        metadata: {
          prompt: generatePromptForStyle(style, true),
          model: 'mock-ai-v1',
          generatedAt: new Date().toISOString(),
        }
      }
      concepts.push(variation)
    }
  }

  return concepts
}

/**
 * Mock AI service to extract design elements from a concept
 * In production, this would call computer vision APIs to analyze the generated image
 */
export async function extractDesignElements(
  designConceptId: string
): Promise<DesignElement[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Generate realistic mock elements based on common garden features
  const possibleElements = [
    { elementType: 'PATIO' as ElementType, unit: 'SQM' as Unit, baseQuantity: 25, variance: 15 },
    { elementType: 'TURF' as ElementType, unit: 'SQM' as Unit, baseQuantity: 40, variance: 20 },
    { elementType: 'PLANTING_BED' as ElementType, unit: 'SQM' as Unit, baseQuantity: 15, variance: 10 },
    { elementType: 'PATHWAY' as ElementType, unit: 'SQM' as Unit, baseQuantity: 12, variance: 8 },
    { elementType: 'LIGHTING' as ElementType, unit: 'UNIT' as Unit, baseQuantity: 6, variance: 4 },
    { elementType: 'FENCING' as ElementType, unit: 'METRE' as Unit, baseQuantity: 20, variance: 10 },
    { elementType: 'RAISED_BED' as ElementType, unit: 'SQM' as Unit, baseQuantity: 8, variance: 6 },
  ]

  // Randomly select 3-7 elements for this design
  const numElements = Math.floor(Math.random() * 5) + 3
  const selectedElements = possibleElements
    .sort(() => 0.5 - Math.random())
    .slice(0, numElements)

  const elements: DesignElement[] = selectedElements.map(element => {
    const variance = element.variance * (Math.random() - 0.5) * 2 // -variance to +variance
    const quantity = Math.max(1, element.baseQuantity + variance)

    return {
      elementType: element.elementType,
      quantityNumeric: Math.round(quantity * 10) / 10, // Round to 1 decimal place
      unit: element.unit,
      notes: generateElementNotes(element.elementType)
    }
  })

  // Sometimes include special elements
  if (Math.random() > 0.6) {
    elements.push({
      elementType: 'PERGOLA',
      quantityNumeric: 1,
      unit: 'UNIT',
      notes: 'Corner feature pergola for seating area'
    })
  }

  if (Math.random() > 0.7) {
    elements.push({
      elementType: 'WATER_FEATURE',
      quantityNumeric: 1,
      unit: 'UNIT',
      notes: 'Small garden fountain or water feature'
    })
  }

  return elements
}

/**
 * Generate AI prompts for different garden styles
 */
function generatePromptForStyle(style: string, isVariation: boolean = false): string {
  const basePrompts: Record<string, string> = {
    'Modern': 'Modern minimalist garden design with clean lines, geometric shapes, contemporary materials, neutral colors, and structured planting',
    'Cottage': 'English cottage garden with abundant flowering plants, curved pathways, rustic materials, and natural, informal planting style',
    'Luxury': 'High-end luxury garden design with premium materials, sophisticated lighting, water features, and expertly crafted landscaping',
    'Low-Maintenance': 'Low maintenance garden design with drought-resistant plants, hardscaping, automated irrigation, and easy-care features',
    'Traditional': 'Traditional garden design with classic formal elements, symmetrical layouts, traditional materials, and established planting schemes',
    'Contemporary': 'Contemporary garden design blending modern and natural elements with innovative materials and sustainable features',
  }

  let prompt = basePrompts[style] || `${style} style garden design with appropriate landscaping elements`

  if (isVariation) {
    prompt += ', alternative design approach with different layout and material choices'
  }

  return prompt + ', high quality garden visualization, professional landscape architecture'
}

/**
 * Generate contextual notes for design elements
 */
function generateElementNotes(elementType: ElementType): string | undefined {
  const notes: Partial<Record<ElementType, string[]>> = {
    PATIO: [
      'Natural stone paving with jointing',
      'Composite decking material',
      'Brick pattern with mortar joints',
      'Concrete with textured finish'
    ],
    TURF: [
      'High-quality turf installation',
      'Hardwearing grass suitable for family use',
      'Premium lawn with irrigation',
      'Artificial grass alternative'
    ],
    PLANTING_BED: [
      'Mixed perennial and shrub planting',
      'Seasonal flower displays',
      'Structured evergreen planting',
      'Native plant wildlife garden'
    ],
    LIGHTING: [
      'LED path and feature lighting',
      'Garden uplighting for trees',
      'Security and ambient lighting',
      'Solar-powered garden lights'
    ],
    FENCING: [
      'Timber fence panels with posts',
      'Contemporary slatted screening',
      'Traditional close-board fencing',
      'Decorative metal railings'
    ],
    PERGOLA: [
      'Timber pergola with climbing plants',
      'Metal pergola structure',
      'Pergola with integrated seating',
      'Covered outdoor dining area'
    ]
  }

  const elementNotes = notes[elementType]
  if (elementNotes && elementNotes.length > 0) {
    return elementNotes[Math.floor(Math.random() * elementNotes.length)]
  }

  return undefined
}