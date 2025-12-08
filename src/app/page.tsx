'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowRight, Palette, Calculator, FileText, Users } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // If user is authenticated, redirect to dashboard
  useEffect(() => {
    if (status === 'loading') return
    if (session) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Marketing homepage for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Landscapered" className="h-8 w-auto" />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push('/auth/signin')}>
                Sign In
              </Button>
              <Button onClick={() => router.push('/auth/signup')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
            AI-Powered Garden Design
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Landscaping Business with
            <span className="text-green-600"> AI-Generated Designs</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create stunning visual garden concepts, generate accurate quotes, and win more clients
            with professional design presentations powered by artificial intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={() => router.push('/auth/signup')}>
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Grow Your Business
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From AI-powered design generation to professional quote creation,
            we've built the complete toolkit for modern landscaping professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Palette className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>AI Garden Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Generate stunning garden designs in seconds using AI. Upload photos and get professional concepts instantly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calculator className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Smart Quoting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automatically generate accurate quotes from your designs with material costs and labor estimates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Client Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Keep track of customers, projects, and communications all in one organized platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Landscapered" className="h-8 w-auto invert" />
            </div>
            <p className="text-gray-400">
              © 2024 Landscapered. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}