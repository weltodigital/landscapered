import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Check if API keys are configured
if (!process.env.IDEOGRAM_API_KEY) {
  console.warn('⚠️  Ideogram API key not configured. Set IDEOGRAM_API_KEY in your .env file to enable AI image generation.')
}

if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
  console.warn('⚠️  OpenAI API key not configured. Set OPENAI_API_KEY in your .env file to enable garden image analysis.')
}

export interface DesignPrompt {
  style: string
  description: string
  characteristics: string[]
}

export interface GeneratedDesign {
  id: string
  style: string
  title: string
  description: string
  imageUrl: string
  characteristics: string[]
  elements: any[]
  createdAt: string
  updatedAt: string
}

export async function analyzeGardenImage(imageUrl: string): Promise<string> {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.')
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this garden space and provide a brief summary focusing on: 1) Approximate garden size/scale (small/medium/large), 2) Current key features (lawn, patio, beds, etc.), 3) Garden style/condition, 4) Any obvious constraints. Keep response under 150 words and focus on practical design considerations for a realistic residential garden redesign."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 500
    })

    return response.choices[0]?.message?.content || "Unable to analyze the garden image."
  } catch (error) {
    console.error('Error analyzing garden image:', error)
    return "Garden analysis not available - using general design approach."
  }
}

export async function generateGardenDesignImage(
  style: string,
  description: string,
  characteristics: string[],
  gardenAnalysis?: string,
  variationIndex?: number,
  selectedElements?: Array<{type: string, name: string, area?: number, unit?: string}>,
  gardenDimensions?: {length: number, width: number, unit: string}
): Promise<string> {
  // Check if API key is configured
  console.log('Ideogram API Key status:', process.env.IDEOGRAM_API_KEY ? 'Present' : 'Missing')
  console.log('API Key length:', process.env.IDEOGRAM_API_KEY?.length || 0)

  if (!process.env.IDEOGRAM_API_KEY) {
    throw new Error('Ideogram API key not configured. Please set IDEOGRAM_API_KEY in your .env file.')
  }

  try {
    // Create simple, realistic prompt focusing on matching the existing garden size and simplicity
    const spaceContext = gardenAnalysis
      ? `Based on the existing garden space: ${gardenAnalysis.substring(0, 200)}...`
      : 'For a typical residential garden'

    // Detailed style-specific visual descriptions
    const stylePrompts = {
      Modern: 'geometric rectangular lawn, straight-edged concrete patio, linear planting beds with architectural plants like ornamental grasses, clean gravel paths, minimal color palette',
      Cottage: 'curved lawn edges, natural stone or brick patio, mixed flower borders with roses and perennials, winding gravel paths, abundant colorful plantings',
      Luxury: 'pristine manicured lawn, premium natural stone patio, sophisticated water feature, mature trees and shrubs, high-end materials throughout',
      Minimalist: 'simple rectangular lawn, plain concrete or stone patio, single-species planting beds, limited plant varieties, zen-like clean surfaces'
    }

    const styleDescription = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.Modern

    // Add subtle variations for multiple designs of the same style
    const variations = [
      'patio positioned against house back edge',
      'patio positioned in corner location',
      'patio positioned along side edge'
    ]

    const pathVariations = [
      'straight pathway from patio to center',
      'curved pathway connecting main areas',
      'L-shaped pathway along garden edges'
    ]

    const plantingVariations = [
      'planting beds along three borders',
      'planting beds in corner clusters',
      'planting beds as central island feature'
    ]

    const variationSuffix = typeof variationIndex === 'number' ? `
LAYOUT VARIATION ${variationIndex + 1}:
- ${variations[variationIndex % variations.length]}
- ${pathVariations[variationIndex % pathVariations.length]}
- ${plantingVariations[variationIndex % plantingVariations.length]}` : ''

    // Generate custom element specifications if provided
    const customElementsText = selectedElements && selectedElements.length > 0 ? `

SPECIFIC ELEMENTS TO INCLUDE (MANDATORY):
${selectedElements.map(element => {
  const elementDescriptions = {
    'PATIO': 'rectangular paved patio area',
    'TURF': 'lawn/grass area',
    'PLANTING_BED': 'planted flower/shrub border',
    'PATHWAY': 'gravel or stone pathway',
    'WATER_FEATURE': 'small decorative water feature',
    'LIGHTING': 'garden light fixtures',
    'PERGOLA': 'wooden pergola structure',
    'RAISED_BED': 'raised planting bed',
    'SEATING': 'built-in or standalone seating area',
    'SCREENING': 'privacy fence or hedge',
    'DECKING': 'wooden decking area',
    'DRIVEWAY': 'paved driveway area'
  }
  const description = elementDescriptions[element.type as keyof typeof elementDescriptions] || element.name.toLowerCase()
  const sizeNote = element.area ? ` (${element.area} ${element.unit || 'sqm'})` : ''
  return `- ${element.name}: ${description}${sizeNote}`
}).join('\n')}

GARDEN BOUNDARY CONSTRAINTS:
- Focus ONLY on the single garden space shown in the uploaded photo
- Do NOT include neighboring gardens, properties, or external areas
- Keep all design elements within the defined garden boundaries
- Maintain the same approximate scale and proportions as the original garden
- CRITICAL: Areas outside the garden perimeter fence must be PLAIN WHITE background
- The garden should appear as if isolated on a white canvas
- No visible neighboring properties, roads, or other buildings beyond the fence line` : ''

    const prompt = `PHOTOREALISTIC GARDEN DESIGN - AERIAL VIEW

CRITICAL VIEWPOINT REQUIREMENTS:
- Direct overhead drone photograph at perfect 90° angle looking straight down
- High-resolution aerial garden photography style
- Professional landscape architecture documentation quality
- Camera positioned directly above center of garden space

GARDEN BOUNDARY SPECIFICATIONS (MANDATORY):
- Show ONLY the enclosed garden space within fence perimeter
- Garden fence acts as absolute boundary - nothing beyond fence visible
- Outside fence area must be PURE WHITE background (RGB 255,255,255)
- Garden appears as isolated design on white canvas
- NO neighboring properties, houses, driveways, or external features
- Fence line creates clean edge where garden meets white background

REALISTIC GARDEN DESIGN:
- Style: ${style.toUpperCase()} residential garden design
- ${styleDescription}
- ${gardenDimensions
  ? `Garden dimensions: ${gardenDimensions.length}${gardenDimensions.unit === 'metres' ? 'm' : 'ft'} × ${gardenDimensions.width}${gardenDimensions.unit === 'metres' ? 'm' : 'ft'}`
  : 'Typical residential garden proportions (12m × 10m)'}
- British suburban garden context: ${spaceContext}

PHOTOREALISTIC MATERIALS & TEXTURES:
- Natural grass lawn with realistic texture and color variation
- Authentic paving materials (natural stone, brick, concrete slabs)
- Real plant species with natural growth patterns and seasonal colors
- Proper scale trees, shrubs, and perennial plantings
- Realistic garden furniture and structures with natural weathering
- Accurate shadows and lighting consistent with natural daylight
- Genuine material joins, edges, and construction details

GARDEN LAYOUT ELEMENTS:${customElementsText || `
- Well-proportioned lawn areas with natural grass texture
- Appropriate patio/terrace areas with realistic paving
- Mixed planting borders with seasonal plants and natural growth
- Practical pathways connecting different garden zones`}

REALISM REQUIREMENTS:
- Photograph-quality image, not illustration or 3D render
- Natural imperfections in grass growth and plant placement
- Realistic color palette matching real garden materials
- Proper plant sizing and spacing for mature garden
- Authentic construction details and material transitions
- Natural soft shadows from overhead sun position
- Real garden proportions and practical layout

STRICT PROHIBITIONS:
- NO artificial or cartoon-like appearance
- NO neighboring properties or external context beyond fence
- NO roads, other buildings, or landscape features outside garden
- NO dramatic artistic effects or unrealistic colors
- NO rendered or CGI appearance - must look like real photograph
- NO perspective distortion or angled views
- NO text, labels, or graphic overlays

TARGET RESULT: Ultra-realistic aerial photograph of a real ${style.toLowerCase()} garden taken from directly overhead, showing only the enclosed garden space with pure white background beyond the fence perimeter, featuring authentic materials, natural plant growth, and professional landscape design suitable for client presentation.`.trim()

    // Use Ideogram 3.0 Flash for faster image generation
    console.log('Using Ideogram 3.0 Flash for image generation')

    const formData = new FormData()
    formData.append('prompt', prompt)
    formData.append('aspect_ratio', '1x1')
    formData.append('rendering_speed', 'FLASH')
    formData.append('magic_prompt', 'AUTO')

    const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate', {
      method: 'POST',
      headers: {
        'Api-Key': process.env.IDEOGRAM_API_KEY,
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Ideogram API error: ${response.status} ${errorData}`)
    }

    const data = await response.json()

    if (!data.data || !data.data[0]?.url) {
      throw new Error('No image generated from Ideogram')
    }

    return data.data[0].url
  } catch (error) {
    console.error('Error generating image with Ideogram:', error)
    throw new Error(`Failed to generate design image: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function downloadAndStoreImage(imageUrl: string, designId: string): Promise<string> {
  try {
    // In production, you would:
    // 1. Download the image from OpenAI's URL
    // 2. Upload it to your cloud storage (AWS S3, Cloudinary, etc.)
    // 3. Return the permanent URL

    // For now, we'll return the OpenAI URL directly
    // Note: OpenAI URLs expire after some time, so in production you should store them
    return imageUrl
  } catch (error) {
    console.error('Error downloading/storing image:', error)
    throw new Error('Failed to store generated image')
  }
}

export function createDesignElements(style: string) {
  // This function creates realistic, simple garden elements based on the design style
  const baseElements = [
    { type: 'PATIO', name: 'Patio Area', area: 20, unit: 'SQM' },
    { type: 'TURF', name: 'Lawn Area', area: 35, unit: 'SQM' },
    { type: 'PLANTING_BED', name: 'Planting Border', area: 10, unit: 'SQM' },
    { type: 'PATHWAY', name: 'Garden Path', area: 8, unit: 'SQM' },
    { type: 'WATER_FEATURE', name: 'Small Water Feature', area: 1, unit: 'UNIT' },
    { type: 'LIGHTING', name: 'Garden Lighting', area: 4, unit: 'UNIT' },
    { type: 'SEATING', name: 'Garden Seating Area', area: 1, unit: 'UNIT' },
    { type: 'BORDER', name: 'Decorative Border', area: 6, unit: 'SQM' },
  ]

  // Customize elements based on style
  const styleCustomizations = {
    Modern: {
      modifications: {
        'PATIO': { name: 'Modern Patio Area' },
        'PLANTING_BED': { name: 'Modern Planting Area' },
        'PATHWAY': { name: 'Contemporary Path' }
      }
    },
    Cottage: {
      modifications: {
        'PATIO': { name: 'Traditional Patio' },
        'PLANTING_BED': { name: 'Cottage Garden Border' },
        'PATHWAY': { name: 'Garden Pathway' }
      }
    },
    Luxury: {
      modifications: {
        'PATIO': { name: 'Premium Patio Area' },
        'WATER_FEATURE': { name: 'Water Feature' },
        'LIGHTING': { name: 'Landscape Lighting' }
      }
    },
    Minimalist: {
      modifications: {
        'PLANTING_BED': { name: 'Simple Planting Area' },
        'PATHWAY': { name: 'Clean Pathway' }
      }
    }
  }

  // Apply style-specific customizations
  const customizations = styleCustomizations[style as keyof typeof styleCustomizations]?.modifications || {}

  // Select 3-4 essential elements for simpler designs
  const shuffledElements = [...baseElements].sort(() => 0.5 - Math.random())
  const selectedElements = shuffledElements.slice(0, 3 + Math.floor(Math.random() * 2))

  return selectedElements.map((element, index) => {
    const customization = customizations[element.type as keyof typeof customizations]
    const finalElement = customization ? { ...element, ...customization } : element

    return {
      id: `element-ai-${Date.now()}-${index}`,
      designId: '', // Will be set when design is created
      type: finalElement.type,
      name: finalElement.name,
      description: `${finalElement.name} for ${style} style garden`,
      area: finalElement.area + Math.floor(Math.random() * 4 - 2), // Small realistic variation
      unit: finalElement.unit,
      createdAt: new Date().toISOString(),
    }
  })
}