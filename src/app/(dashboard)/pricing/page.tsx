'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Zap } from 'lucide-react'
import { PRICING_PLANS } from '@/lib/stripe'

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (planType: string) => {
    if (planType === 'free') return

    setIsLoading(planType)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType
        }),
      })

      // Check if we got redirected (likely to login page)
      if (response.type === 'opaqueredirect' || response.redirected) {
        throw new Error('Please log in to upgrade your subscription')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Select the perfect plan for your landscaping business. All plans include our core features -
          the difference is in the number of AI-generated design concepts you can create each month.
        </p>
      </div>

      {error && (
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Payment Error</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm underline mt-2 hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {Object.entries(PRICING_PLANS).map(([key, plan]) => (
          <Card
            key={key}
            className={`relative ${'popular' in plan && plan.popular ? 'border-green-500 border-2 shadow-lg' : 'border-gray-200'}`}
          >
            {'popular' in plan && plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-500 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription className="text-gray-600">
                Perfect for {key === 'free' ? 'trying out' : key === 'starter' ? 'small businesses' :
                           key === 'professional' ? 'growing companies' : key === 'business' ? 'established firms' : 'large enterprises'}
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center pb-6">
              <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900">
                  £{plan.price}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  {plan.price === 0 ? 'Forever free' : 'per month'}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-semibold text-green-600">
                  {plan.credits}
                </div>
                <div className="text-gray-600 text-sm">
                  AI design generations per month
                </div>
              </div>

              <ul className="space-y-3 text-left">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              {key === 'free' ? (
                <Button
                  className="w-full"
                  variant="outline"
                  disabled
                >
                  Current Plan
                </Button>
              ) : (
                <Button
                  className={`w-full ${'popular' in plan && plan.popular ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  onClick={() => handleSubscribe(key)}
                  disabled={isLoading === key}
                  variant={'popular' in plan && plan.popular ? 'default' : 'outline'}
                >
                  {isLoading === key ? 'Loading...' : `Upgrade to ${plan.name}`}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto space-y-6 text-left">
          <div>
            <h3 className="font-semibold text-lg mb-2">How do credits work?</h3>
            <p className="text-gray-600">
              Each AI design generation uses 1 credit. Credits reset monthly on your billing date.
              Unused credits don't roll over.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Can I change plans anytime?</h3>
            <p className="text-gray-600">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">What happens if I exceed my credits?</h3>
            <p className="text-gray-600">
              You won't be able to generate new designs until your credits reset next month or you upgrade your plan.
              All existing projects and features remain accessible.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              Yes! Every new account starts with 2 free credits to try out the service. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
// Force dynamic rendering
export const dynamic = 'force-dynamic'
