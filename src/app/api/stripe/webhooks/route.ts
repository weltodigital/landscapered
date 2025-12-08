import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId }
  })

  if (!user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Get the price ID to determine plan type and credits
  const priceId = subscription.items.data[0]?.price.id
  const planDetails = getPlanByPriceId(priceId)

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : null,
      status: subscription.status,
      planType: planDetails.type,
      creditsPerMonth: planDetails.credits,
      updatedAt: new Date()
    },
    create: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: (subscription as any).current_period_end ? new Date((subscription as any).current_period_end * 1000) : null,
      stripeCustomerId: customerId,
      status: subscription.status,
      planType: planDetails.type,
      creditsPerMonth: planDetails.credits
    }
  })

  // If subscription is active, grant credits for the current period
  if (subscription.status === 'active') {
    await grantMonthlyCredits(user.id, planDetails.credits, planDetails.type)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Update subscription status to canceled
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'canceled',
      updatedAt: new Date()
    }
  })
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Payment succeeded - grant credits if it's a subscription renewal
  if ((invoice as any).subscription) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
    await handleSubscriptionChange(subscription)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Handle failed payment - could notify user, pause subscription, etc.
  console.log('Payment failed for invoice:', invoice.id)

  // Update subscription status if needed
  if ((invoice as any).subscription) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: (invoice as any).subscription as string },
      data: {
        status: 'past_due',
        updatedAt: new Date()
      }
    })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Handle one-time payments for extra credits
  if (session.mode === 'payment' && session.metadata?.creditPackType) {
    const userId = session.metadata.userId
    const credits = parseInt(session.metadata.credits || '0')

    if (userId && credits > 0) {
      // Set expiration to 6 months for purchased credits
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 6)

      await prisma.credit.create({
        data: {
          userId,
          amount: credits,
          source: `purchase_${session.metadata.creditPackType}`,
          expiresAt
        }
      })
    }
  }
}

async function grantMonthlyCredits(userId: string, creditAmount: number, source: string) {
  // Set expiration to end of next month
  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 2)
  expiresAt.setDate(0) // Last day of the month

  // Grant credits
  await prisma.credit.create({
    data: {
      userId,
      amount: creditAmount,
      source: `subscription_${source}`,
      expiresAt
    }
  })
}

function getPlanByPriceId(priceId: string): { type: string; credits: number } {
  // Map price IDs to plan details
  const priceIdMap: Record<string, { type: string; credits: number }> = {
    [process.env.STRIPE_STARTER_PRICE_ID!]: { type: 'starter', credits: 20 },
    [process.env.STRIPE_PROFESSIONAL_PRICE_ID!]: { type: 'professional', credits: 100 }
  }

  return priceIdMap[priceId] || { type: 'free', credits: 2 }
}