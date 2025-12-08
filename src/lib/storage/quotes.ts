// Database quote storage using Prisma
import { prisma } from '@/lib/prisma'

export async function addQuote(quoteData: any, userId?: string) {
  // Handle both old format (with pricing object) and new format (flat structure)
  const subtotal = quoteData.pricing?.subtotal || quoteData.subtotal || 0
  const tax = quoteData.pricing?.vatAmount || quoteData.tax || 0
  const total = quoteData.pricing?.total || quoteData.total || 0

  // Get or create organisation for the user
  let organisationId = 'default-org'
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organisations: true }
    })

    if (user && user.organisations.length > 0) {
      organisationId = user.organisations[0].id
    } else if (user) {
      // Create a default organisation for the user
      const newOrg = await prisma.organisation.create({
        data: {
          name: `${user.name || user.email}'s Organisation`,
          ownerId: user.id
        }
      })
      organisationId = newOrg.id
    }
  }

  // Validate that the project exists, create if needed
  let projectId = quoteData.projectId
  if (projectId && projectId !== 'unknown') {
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!existingProject) {
      // If project doesn't exist, create a basic one
      const newProject = await prisma.project.create({
        data: {
          id: projectId,
          organisationId: organisationId,
          title: `Project for ${quoteData.customerId || 'Unknown Client'}`,
          clientName: quoteData.customerId || 'Unknown Client',
          clientEmail: quoteData.customerId || 'unknown@example.com',
          description: 'Auto-generated project from quote',
          status: 'DRAFT'
        }
      })
      projectId = newProject.id
    }
  } else {
    // Create a fallback project if no valid projectId
    const newProject = await prisma.project.create({
      data: {
        organisationId: organisationId,
        title: `Project for ${quoteData.customerId || 'Unknown Client'}`,
        clientName: quoteData.customerId || 'Unknown Client',
        clientEmail: quoteData.customerId || 'unknown@example.com',
        description: 'Auto-generated project from quote',
        status: 'DRAFT'
      }
    })
    projectId = newProject.id
  }

  // Validate or create design concept
  let designConceptId = quoteData.designConceptId
  if (designConceptId) {
    const existingConcept = await prisma.designConcept.findUnique({
      where: { id: designConceptId }
    })

    if (!existingConcept) {
      // Create a basic design concept
      const newConcept = await prisma.designConcept.create({
        data: {
          id: designConceptId,
          projectId: projectId,
          style: quoteData.designStyle || 'Modern',
          imageUrl: quoteData.designImageUrl || '/placeholder-design.jpg',
          metadata: JSON.stringify({
            auto_generated: true,
            quote_id: quoteData.id
          })
        }
      })
      designConceptId = newConcept.id
    }
  } else {
    // Create a fallback design concept
    const newConcept = await prisma.designConcept.create({
      data: {
        projectId: projectId,
        style: quoteData.designStyle || 'Modern',
        imageUrl: quoteData.designImageUrl || '/placeholder-design.jpg',
        metadata: JSON.stringify({
          auto_generated: true,
          quote_id: quoteData.id
        })
      }
    })
    designConceptId = newConcept.id
  }

  const quote = await prisma.quote.create({
    data: {
      projectId: projectId,
      designConceptId: designConceptId,
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
      project: {
        include: {
          organisation: true
        }
      },
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