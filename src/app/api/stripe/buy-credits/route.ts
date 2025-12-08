import { NextRequest, NextResponse } from 'next/server'
import { stripe, getExtraCreditPack } from '@/lib/stripe'
import { getCurrentUser } from '@/lib/auth-utils'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const user = await getCurrentUser()
    const { creditPackType } = await request.json()

    if (!creditPackType) {
      return NextResponse.json({ error: 'Invalid credit pack type' }, { status: 400 })
    }

    const creditPack = getExtraCreditPack(creditPackType)

    if (!creditPack) {
      return NextResponse.json({ error: 'Credit pack not available' }, { status: 400 })
    }

    // Check if user has Professional subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { planType: true, status: true }
    })

    if (!subscription || subscription.planType !== 'professional' || subscription.status !== 'active') {
      return NextResponse.json({
        error: 'Extra credits are only available for Professional subscribers'
      }, { status: 400 })
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id
        }
      })

      stripeCustomerId = customer.id

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId }
      })
    }

    // Create one-time checkout session for extra credits
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: creditPack.priceId,
          quantity: 1
        }
      ],
      mode: 'payment', // One-time payment, not subscription
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
        creditPackType,
        credits: creditPack.credits.toString()
      },
      success_url: `${process.env.NEXTAUTH_URL}/subscription?success=true&credits=${creditPack.credits}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscription?canceled=true`
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating credit purchase session:', error)
    return NextResponse.json(
      { error: 'Failed to create credit purchase session' },
      { status: 500 }
    )
  }
}