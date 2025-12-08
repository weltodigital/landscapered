import Stripe from 'stripe'

// Initialize Stripe only on server-side with proper error handling
let stripe: Stripe | null = null

if (typeof window === 'undefined' && process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
      typescript: true,
    })
  } catch (error) {
    console.error('Failed to initialize Stripe:', error)
  }
}

export { stripe }

// Pricing configuration matching our discussed tiers
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    credits: 2,
    price: 0,
    priceId: null, // No Stripe price for free tier
    features: [
      '2 image generations per month',
      'All core features',
      'Rate cards & quotes',
      'Logo upload'
    ]
  },
  starter: {
    name: 'Starter',
    credits: 20,
    price: 79,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    features: [
      '20 image generations per month',
      'All core features',
      'Rate cards & quotes',
      'Logo upload',
      'Priority support'
    ]
  },
  professional: {
    name: 'Professional',
    credits: 100,
    price: 149,
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
    popular: true,
    features: [
      '100 image generations per month',
      'All core features',
      'Rate cards & quotes',
      'Logo upload',
      'Priority support',
      'Advanced analytics',
      'Add extra credits as needed'
    ]
  }
} as const

export type PricingPlan = keyof typeof PRICING_PLANS

// Extra credit packs for Professional users
export const EXTRA_CREDIT_PACKS = {
  credits_10: {
    name: '10 Extra Credits',
    credits: 10,
    price: 19,
    priceId: process.env.STRIPE_EXTRA_CREDITS_10_PRICE_ID!,
    savings: 'Save £21 vs individual'
  },
  credits_25: {
    name: '25 Extra Credits',
    credits: 25,
    price: 39,
    priceId: process.env.STRIPE_EXTRA_CREDITS_25_PRICE_ID!,
    savings: 'Save £59 vs individual'
  },
  credits_50: {
    name: '50 Extra Credits',
    credits: 50,
    price: 69,
    priceId: process.env.STRIPE_EXTRA_CREDITS_50_PRICE_ID!,
    savings: 'Save £129 vs individual'
  }
} as const

export type ExtraCreditPack = keyof typeof EXTRA_CREDIT_PACKS

// Helper function to get plan details
export function getPlan(planType: string) {
  return PRICING_PLANS[planType as PricingPlan] || PRICING_PLANS.free
}

// Helper function to get extra credit pack details
export function getExtraCreditPack(packType: string) {
  return EXTRA_CREDIT_PACKS[packType as ExtraCreditPack]
}

// Helper function to check if user has enough credits
export function hasEnoughCredits(availableCredits: number, requiredCredits: number = 1): boolean {
  return availableCredits >= requiredCredits
}