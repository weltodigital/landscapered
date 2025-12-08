import { DesignConcept, DesignElement, RateCard, RateItem } from '@prisma/client'

// Define types that were previously enums
type ElementType = 'PATIO' | 'TURF' | 'DECKING' | 'PERGOLA' | 'FENCING' | 'RAISED_BED' | 'LIGHTING' | 'WATER_FEATURE' | 'PATHWAY' | 'PLANTING_BED' | 'GRAVEL_AREA' | 'FIRE_PIT' | 'OTHER'
type Unit = 'SQM' | 'METRE' | 'UNIT'

export interface QuoteLineItem {
  elementType: string
  description: string
  quantityNumeric: number
  unit: string
  unitPrice: number
  lineTotal: number
}

export interface GeneratedQuote {
  subtotal: number
  profit: number
  total: number
  lowEstimate: number
  highEstimate: number
  currency: string
  lineItems: QuoteLineItem[]
}

type DesignConceptWithElements = DesignConcept & {
  designElements: DesignElement[]
}

type RateCardWithItems = RateCard & {
  rateItems: RateItem[]
}

/**
 * Generate a quote from a design concept and rate card
 */
export async function generateQuoteFromDesign(
  designConcept: DesignConceptWithElements,
  rateCard: RateCardWithItems
): Promise<GeneratedQuote> {
  const lineItems: QuoteLineItem[] = []
  let subtotal = 0

  // Generate line items for each design element
  for (const element of designConcept.designElements) {
    const lineItem = generateLineItemForElement(element, rateCard)
    if (lineItem) {
      lineItems.push(lineItem)
      subtotal += lineItem.lineTotal
    }
  }

  // Add waste disposal if there are any items
  if (lineItems.length > 0) {
    lineItems.push({
      elementType: 'OTHER',
      description: 'Waste Disposal & Site Cleanup',
      quantityNumeric: 1,
      unit: 'UNIT',
      unitPrice: rateCard.wasteDisposalRate,
      lineTotal: rateCard.wasteDisposalRate,
    })
    subtotal += rateCard.wasteDisposalRate
  }

  // Calculate profit
  const profit = subtotal * (rateCard.defaultProfitMarginPercent / 100)
  const total = subtotal + profit

  // Calculate estimate ranges (±15% for low/high estimates)
  const estimateVariance = 0.15
  const lowEstimate = total * (1 - estimateVariance)
  const highEstimate = total * (1 + estimateVariance)

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    total: Math.round(total * 100) / 100,
    lowEstimate: Math.round(lowEstimate * 100) / 100,
    highEstimate: Math.round(highEstimate * 100) / 100,
    currency: 'GBP',
    lineItems
  }
}

/**
 * Generate a line item for a specific design element
 */
function generateLineItemForElement(
  element: DesignElement,
  rateCard: RateCardWithItems
): QuoteLineItem | null {
  // Find matching rate item
  const rateItem = rateCard.rateItems.find(
    item => item.elementType === element.elementType && item.unit === element.unit
  )

  if (!rateItem) {
    console.warn(`No rate item found for ${element.elementType} in ${element.unit}`)
    return null
  }

  // Calculate costs
  const materialCost = rateItem.baseMaterialCost * element.quantityNumeric
  const labourCost = rateItem.baseLabourHoursPerUnit * element.quantityNumeric * rateCard.labourRatePerHour
  const unitPrice = rateItem.baseMaterialCost + (rateItem.baseLabourHoursPerUnit * rateCard.labourRatePerHour)
  const lineTotal = materialCost + labourCost

  return {
    elementType: element.elementType,
    description: generateElementDescription(element),
    quantityNumeric: element.quantityNumeric,
    unit: element.unit,
    unitPrice: Math.round(unitPrice * 100) / 100,
    lineTotal: Math.round(lineTotal * 100) / 100,
  }
}

/**
 * Generate a human-readable description for a design element
 */
function generateElementDescription(element: DesignElement): string {
  const baseDescriptions: Record<string, string> = {
    PATIO: 'Patio Installation',
    TURF: 'Turf Installation',
    DECKING: 'Decking Installation',
    PERGOLA: 'Pergola Construction',
    FENCING: 'Fencing Installation',
    RAISED_BED: 'Raised Bed Construction',
    LIGHTING: 'Garden Lighting Installation',
    WATER_FEATURE: 'Water Feature Installation',
    PATHWAY: 'Pathway Construction',
    PLANTING_BED: 'Planting Bed Preparation',
    GRAVEL_AREA: 'Gravel Area Installation',
    FIRE_PIT: 'Fire Pit Installation',
    OTHER: 'Miscellaneous Work',
  }

  let description = baseDescriptions[element.elementType] || 'Garden Work'

  // Add unit-specific details
  if (element.unit === 'SQM') {
    description += ` (${element.quantityNumeric}m²)`
  } else if (element.unit === 'METRE') {
    description += ` (${element.quantityNumeric}m linear)`
  } else if (element.unit === 'UNIT') {
    description += element.quantityNumeric > 1 ? ` (${element.quantityNumeric} units)` : ''
  }

  // Add notes if available
  if (element.notes) {
    description += ` - ${element.notes}`
  }

  return description
}

/**
 * Calculate project complexity multiplier based on design elements
 * This can be used to adjust quotes for more complex projects
 */
export function calculateComplexityMultiplier(elements: DesignElement[]): number {
  let complexityScore = 0

  // Base score
  complexityScore += elements.length * 0.1

  // Add complexity for specific elements
  for (const element of elements) {
    switch (element.elementType) {
      case 'WATER_FEATURE':
        complexityScore += 0.3
        break
      case 'PERGOLA':
        complexityScore += 0.2
        break
      case 'LIGHTING':
        complexityScore += 0.15
        break
      case 'FIRE_PIT':
        complexityScore += 0.25
        break
      default:
        break
    }

    // Large quantities add complexity
    if (element.quantityNumeric > 50) {
      complexityScore += 0.1
    }
  }

  // Convert score to multiplier (1.0 = no change, 1.2 = 20% increase)
  return Math.min(1.5, 1.0 + complexityScore)
}

/**
 * Apply seasonal pricing adjustments
 */
export function applySeasonalPricing(basePrice: number, month: number): number {
  // Peak season (March-September) - 10% increase
  // Off season (October-February) - 5% decrease
  const isPeakSeason = month >= 3 && month <= 9
  const seasonalMultiplier = isPeakSeason ? 1.1 : 0.95

  return basePrice * seasonalMultiplier
}