import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'demo@gardenly.com' },
    update: {},
    create: {
      email: 'demo@gardenly.com',
      name: 'Demo Landscaper',
      hashedPassword,
    },
  })

  console.log('✅ Created demo user')

  // Create demo organisation with rate card
  const organisation = await prisma.organisation.upsert({
    where: { id: 'demo-org-id' },
    update: {},
    create: {
      name: 'Green Thumb Landscaping',
      ownerId: user.id,
      rateCards: {
        create: {
          labourRatePerHour: 45.0,
          defaultProfitMarginPercent: 20.0,
          wasteDisposalRate: 150.0,
          travelCostPerMile: 0.5,
          rateItems: {
            create: [
              {
                elementType: 'PATIO',
                unit: 'SQM',
                baseMaterialCost: 50.0,
                baseLabourHoursPerUnit: 2.0,
              },
              {
                elementType: 'TURF',
                unit: 'SQM',
                baseMaterialCost: 15.0,
                baseLabourHoursPerUnit: 0.5,
              },
              {
                elementType: 'DECKING',
                unit: 'SQM',
                baseMaterialCost: 45.0,
                baseLabourHoursPerUnit: 1.5,
              },
              {
                elementType: 'PERGOLA',
                unit: 'UNIT',
                baseMaterialCost: 800.0,
                baseLabourHoursPerUnit: 8.0,
              },
              {
                elementType: 'FENCING',
                unit: 'METRE',
                baseMaterialCost: 35.0,
                baseLabourHoursPerUnit: 1.0,
              },
              {
                elementType: 'RAISED_BED',
                unit: 'SQM',
                baseMaterialCost: 40.0,
                baseLabourHoursPerUnit: 1.5,
              },
              {
                elementType: 'LIGHTING',
                unit: 'UNIT',
                baseMaterialCost: 120.0,
                baseLabourHoursPerUnit: 2.0,
              },
              {
                elementType: 'WATER_FEATURE',
                unit: 'UNIT',
                baseMaterialCost: 500.0,
                baseLabourHoursPerUnit: 6.0,
              },
              {
                elementType: 'PATHWAY',
                unit: 'SQM',
                baseMaterialCost: 30.0,
                baseLabourHoursPerUnit: 1.0,
              },
              {
                elementType: 'PLANTING_BED',
                unit: 'SQM',
                baseMaterialCost: 25.0,
                baseLabourHoursPerUnit: 1.2,
              },
              {
                elementType: 'GRAVEL_AREA',
                unit: 'SQM',
                baseMaterialCost: 20.0,
                baseLabourHoursPerUnit: 0.8,
              },
              {
                elementType: 'FIRE_PIT',
                unit: 'UNIT',
                baseMaterialCost: 350.0,
                baseLabourHoursPerUnit: 4.0,
              },
            ],
          },
        },
      },
    },
  })

  console.log('✅ Created demo organisation and rate card')

  // Create demo projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Johnson Family Garden Redesign',
      clientName: 'Sarah Johnson',
      clientEmail: 'sarah.johnson@email.com',
      status: 'DRAFT',
      organisationId: organisation.id,
      gardenPhotos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
          },
          {
            url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
          },
        ],
      },
    },
  })

  const project2 = await prisma.project.create({
    data: {
      title: 'Modern Urban Courtyard',
      clientName: 'Michael Chen',
      clientEmail: 'michael.chen@email.com',
      status: 'DESIGNING',
      organisationId: organisation.id,
      gardenPhotos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800',
          },
        ],
      },
    },
  })

  // Create design concepts for project 2
  const designConcept1 = await prisma.designConcept.create({
    data: {
      projectId: project2.id,
      style: 'Modern',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
      metadata: {
        prompt: 'Modern minimalist garden design with clean lines and contemporary materials',
        model: 'mock-ai-v1',
        generatedAt: new Date().toISOString(),
      },
      designElements: {
        create: [
          {
            elementType: 'PATIO',
            quantityNumeric: 25.0,
            unit: 'SQM',
            notes: 'Natural stone paving with jointing',
          },
          {
            elementType: 'TURF',
            quantityNumeric: 35.0,
            unit: 'SQM',
            notes: 'High-quality turf installation',
          },
          {
            elementType: 'PLANTING_BED',
            quantityNumeric: 12.0,
            unit: 'SQM',
            notes: 'Structured evergreen planting',
          },
          {
            elementType: 'LIGHTING',
            quantityNumeric: 8.0,
            unit: 'UNIT',
            notes: 'LED path and feature lighting',
          },
          {
            elementType: 'FENCING',
            quantityNumeric: 15.0,
            unit: 'METRE',
            notes: 'Contemporary slatted screening',
          },
        ],
      },
    },
  })

  // Get the rate card to calculate quote
  const rateCard = await prisma.rateCard.findFirst({
    where: { organisationId: organisation.id },
    include: { rateItems: true },
  })

  if (rateCard) {
    // Create a sample quote for the design concept
    const subtotal = 3850.0
    const profit = subtotal * (rateCard.defaultProfitMarginPercent / 100)
    const total = subtotal + profit

    await prisma.quote.create({
      data: {
        projectId: project2.id,
        designConceptId: designConcept1.id,
        subtotal,
        profit,
        total,
        lowEstimate: total * 0.85,
        highEstimate: total * 1.15,
        currency: 'GBP',
        lineItems: {
          create: [
            {
              elementType: 'PATIO',
              description: 'Patio Installation (25.0m²) - Natural stone paving with jointing',
              quantityNumeric: 25.0,
              unit: 'SQM',
              unitPrice: 140.0,
              lineTotal: 3500.0,
            },
            {
              elementType: 'TURF',
              description: 'Turf Installation (35.0m²) - High-quality turf installation',
              quantityNumeric: 35.0,
              unit: 'SQM',
              unitPrice: 37.5,
              lineTotal: 1312.5,
            },
            {
              elementType: 'PLANTING_BED',
              description: 'Planting Bed Preparation (12.0m²) - Structured evergreen planting',
              quantityNumeric: 12.0,
              unit: 'SQM',
              unitPrice: 79.0,
              lineTotal: 948.0,
            },
            {
              elementType: 'LIGHTING',
              description: 'Garden Lighting Installation (8 units) - LED path and feature lighting',
              quantityNumeric: 8.0,
              unit: 'UNIT',
              unitPrice: 210.0,
              lineTotal: 1680.0,
            },
            {
              elementType: 'FENCING',
              description: 'Fencing Installation (15.0m linear) - Contemporary slatted screening',
              quantityNumeric: 15.0,
              unit: 'METRE',
              unitPrice: 80.0,
              lineTotal: 1200.0,
            },
            {
              elementType: 'OTHER',
              description: 'Waste Disposal & Site Cleanup',
              quantityNumeric: 1,
              unit: 'UNIT',
              unitPrice: 150.0,
              lineTotal: 150.0,
            },
          ],
        },
      },
    })

    // Update project status
    await prisma.project.update({
      where: { id: project2.id },
      data: { status: 'QUOTED' },
    })
  }

  console.log('✅ Created demo projects with design concepts and quotes')

  console.log('🎉 Seeding completed successfully!')
  console.log('')
  console.log('Demo credentials:')
  console.log('Email: demo@gardenly.com')
  console.log('Password: demo123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })