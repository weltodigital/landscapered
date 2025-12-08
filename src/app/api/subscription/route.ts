import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        planType: true,
        status: true,
        creditsPerMonth: true,
        stripeCurrentPeriodEnd: true,
      }
    })

    // Get user's current credits
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Count available (unused) credits that haven't expired
    const availableCredits = await prisma.credit.count({
      where: {
        userId: user.id,
        used: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    })

    // Count total credits for this month (both used and unused)
    const totalCredits = await prisma.credit.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    // Count used credits
    const usedCredits = totalCredits - availableCredits

    // Count design generations this month (usage)
    const thisMonthUsage = await prisma.usage.count({
      where: {
        userId: user.id,
        action: 'image_generation',
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    // If no subscription, provide free tier defaults
    const effectiveTotalCredits = subscription ? subscription.creditsPerMonth : (totalCredits > 0 ? totalCredits : 2)

    return NextResponse.json({
      subscription,
      credits: {
        available: availableCredits,
        total: effectiveTotalCredits,
        used: usedCredits
      },
      usage: {
        thisMonth: thisMonthUsage
      }
    })
  } catch (error) {
    console.error('Error fetching subscription data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    )
  }
}