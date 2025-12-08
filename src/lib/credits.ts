import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreditBalance {
  available: number
  total: number
  used: number
}

// Grant free credits to new users
export async function grantFreeCredits(userId: string): Promise<void> {
  // Check if user already has credits
  const existingCredits = await prisma.credit.findFirst({
    where: { userId }
  })

  // Only grant if they don't have any credits yet
  if (!existingCredits) {
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + 6) // Free credits expire in 6 months

    await prisma.credit.create({
      data: {
        userId,
        amount: 2, // Free tier gets 2 credits
        source: 'free_tier',
        expiresAt
      }
    })
  }
}

// Get user's current credit balance
export async function getCreditBalance(userId: string): Promise<CreditBalance> {
  const now = new Date()

  // Count available (unused) credits that haven't expired
  const availableCredits = await prisma.credit.count({
    where: {
      userId,
      used: false,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } }
      ]
    }
  })

  // Count total credits (used and unused)
  const totalCredits = await prisma.credit.count({
    where: { userId }
  })

  // Count used credits
  const usedCredits = await prisma.credit.count({
    where: {
      userId,
      used: true
    }
  })

  return {
    available: availableCredits,
    total: totalCredits,
    used: usedCredits
  }
}

// Use a credit for image generation
export async function useCredit(userId: string, action: string = 'image_generation'): Promise<boolean> {
  // Find the oldest available credit
  const availableCredit = await prisma.credit.findFirst({
    where: {
      userId,
      used: false,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    orderBy: { createdAt: 'asc' } // Use oldest credits first
  })

  if (!availableCredit) {
    return false // No credits available
  }

  // Use the credit and record usage
  await prisma.$transaction([
    // Mark credit as used
    prisma.credit.update({
      where: { id: availableCredit.id },
      data: {
        used: true,
        usedAt: new Date()
      }
    }),
    // Record usage for analytics
    prisma.usage.create({
      data: {
        userId,
        action,
        creditCost: 1
      }
    })
  ])

  return true
}

// Check if user has enough credits
export async function hasCredits(userId: string, required: number = 1): Promise<boolean> {
  const balance = await getCreditBalance(userId)
  return balance.available >= required
}

// Grant monthly credits for subscription renewal
export async function grantSubscriptionCredits(
  userId: string,
  creditAmount: number,
  planType: string
): Promise<void> {
  // Set expiration to end of next month
  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 2)
  expiresAt.setDate(0) // Last day of the month

  await prisma.credit.create({
    data: {
      userId,
      amount: creditAmount,
      source: `subscription_${planType}`,
      expiresAt
    }
  })
}

// Clean up expired credits (can be run as a cron job)
export async function cleanupExpiredCredits(): Promise<number> {
  const now = new Date()

  const result = await prisma.credit.deleteMany({
    where: {
      expiresAt: {
        lt: now
      },
      used: false
    }
  })

  return result.count
}