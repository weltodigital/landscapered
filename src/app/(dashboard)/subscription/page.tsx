'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, CreditCard, Zap, ArrowUpCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { EXTRA_CREDIT_PACKS } from '@/lib/stripe'

interface SubscriptionData {
  subscription?: {
    id: string
    planType: string
    status: string
    creditsPerMonth: number
    stripeCurrentPeriodEnd: string
  }
  credits: {
    available: number
    total: number
    used: number
  }
  usage: {
    thisMonth: number
  }
}

export default function SubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [buyingCredits, setBuyingCredits] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription')
      const subscriptionData = await response.json()
      setData(subscriptionData)
    } catch (error) {
      console.error('Error fetching subscription data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyCredits = async (creditPackType: string) => {
    setBuyingCredits(creditPackType)
    setError(null)

    try {
      const response = await fetch('/api/stripe/buy-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditPackType
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to purchase credits')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'No checkout URL received')
      }
    } catch (error) {
      console.error('Error buying credits:', error)
      setError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setBuyingCredits(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const subscription = data?.subscription
  const isActive = subscription?.status === 'active'
  const planName = subscription?.planType ? subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1) : 'Free'
  const renewalDate = subscription?.stripeCurrentPeriodEnd ? new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString() : null

  const creditsUsagePercentage = data?.credits.total ? (data.credits.used / data.credits.total) * 100 : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Subscription & Usage
        </h1>
        <p className="text-gray-600">
          Manage your subscription and monitor your credit usage
        </p>
      </div>

      {error && (
        <div className="mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Error</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
            <CardDescription>
              Your active subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{planName} Plan</span>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Active" : subscription ? subscription.status : "Free"}
                </Badge>
              </div>

              {subscription && (
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {isActive ? `Renews on ${renewalDate}` : `Ended on ${renewalDate}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>{subscription.creditsPerMonth} credits per month</span>
                  </div>
                </div>
              )}

              <div className="pt-4">
                {subscription && isActive ? (
                  <Button variant="outline" className="w-full">
                    Manage Subscription
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/pricing">
                      <ArrowUpCircle className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Credit Usage
            </CardTitle>
            <CardDescription>
              Your current month's usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {data?.credits.available || 0} credits remaining
                </span>
                <span className="text-sm text-gray-600">
                  of {data?.credits.total || 5}
                </span>
              </div>

              <div className="space-y-2">
                <Progress value={creditsUsagePercentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{data?.credits.used || 0} used</span>
                  <span>{data?.credits.total || 5} total</span>
                </div>
              </div>

              <div className="pt-2 text-sm text-gray-600">
                <p>
                  You've generated <strong>{data?.usage.thisMonth || 0}</strong> designs this month.
                  {!subscription && (
                    <span className="block mt-1 text-blue-600">
                      Upgrade to get more credits!
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your recent design generation activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Start generating designs to see your usage history here</p>
          </div>
        </CardContent>
      </Card>

      {/* Extra Credits - Only for Professional users */}
      {subscription && isActive && subscription.planType === 'professional' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Buy Extra Credits
            </CardTitle>
            <CardDescription>
              Need more designs this month? Purchase additional credits for your Professional plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(EXTRA_CREDIT_PACKS).map(([key, pack]) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{pack.name}</h3>
                    <div className="text-2xl font-bold text-blue-600 my-2">£{pack.price}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      £{(pack.price / pack.credits).toFixed(2)} per credit
                    </div>
                    <div className="text-xs text-green-600 mb-4">{pack.savings}</div>
                    <Button
                      onClick={() => handleBuyCredits(key)}
                      disabled={buyingCredits === key}
                      className="w-full"
                      size="sm"
                    >
                      {buyingCredits === key ? 'Processing...' : `Buy ${pack.credits} Credits`}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>• Extra credits expire in 6 months</p>
              <p>• Credits are used oldest first (monthly allocation, then purchases)</p>
              <p>• All purchases are one-time payments</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Information */}
      {subscription && isActive && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>
              Manage your payment method and billing details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Payment Method</p>
                  <p className="text-sm text-gray-600">•••• •••• •••• 4242</p>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>

              <div className="flex gap-4">
                <Button variant="outline">Download Invoices</Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
// Force dynamic rendering
export const dynamic = 'force-dynamic'
