// Database quote storage using Prisma
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function addQuote(quoteData: any) {
  // Handle both old format (with pricing object) and new format (flat structure)
  const subtotal = quoteData.pricing?.subtotal || quoteData.subtotal || 0
  const tax = quoteData.pricing?.vatAmount || quoteData.tax || 0
  const total = quoteData.pricing?.total || quoteData.total || 0

  const quote = await prisma.quote.create({
    data: {
      projectId: quoteData.projectId,
      designConceptId: quoteData.designConceptId, // Must be a real design concept ID
      subtotal: subtotal,
      profit: tax, // Using tax as profit for now
      total: total,
      lowEstimate: total * 0.85,
      highEstimate: total * 1.15,
      currency: 'GBP'
    }
  })

  // Also create line items if they exist
  if (quoteData.items && Array.isArray(quoteData.items)) {
    for (const item of quoteData.items) {
      await prisma.quoteLineItem.create({
        data: {
          quoteId: quote.id,
          elementType: 'OTHER', // Default type
          description: item.customDescription || 'Item',
          quantityNumeric: item.quantity || 1,
          unit: 'UNIT',
          unitPrice: item.unitPrice || 0,
          lineTotal: item.totalPrice || 0
        }
      })
    }
  }

  return quote
}

export async function getQuote(quoteId: string, userId?: string) {
  return await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      project: true,
      designConcept: true,
      lineItems: true
    }
  })
}

export async function getQuotesByProject(projectId: string, userId: string) {
  return await prisma.quote.findMany({
    where: { projectId },
    include: {
      project: true,
      designConcept: true,
      lineItems: true
    }
  })
}

export async function getAllQuotes() {
  return await prisma.quote.findMany({
    include: {
      project: true,
      designConcept: true,
      lineItems: true
    }
  })
}