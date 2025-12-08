import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 to-accent/10">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Garden Photos into
            <span className="text-primary"> Professional Designs</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload garden photos, generate AI-powered design concepts, and create accurate quotes
            with our intelligent landscaping SaaS platform.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link href="/auth/signin">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📸 Upload Photos
                </CardTitle>
                <CardDescription>
                  Upload 1-3 photos of any garden space you want to redesign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Simply drag and drop or select garden photos from your device.
                  Our AI analyzes the space to understand dimensions and features.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 AI Design Generation
                </CardTitle>
                <CardDescription>
                  Generate 3-5 professional design concepts in multiple styles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Choose from Modern, Cottage, Luxury, Low-Maintenance and more.
                  Our AI creates realistic design visualizations tailored to your space.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💰 Instant Quotes
                </CardTitle>
                <CardDescription>
                  Get accurate price estimates based on detected design elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Automatically extract elements like patios, turf, pergolas, and lighting.
                  Generate professional quotes with your custom rates.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-8">Perfect for Landscapers & Homeowners</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">For Landscaping Professionals</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li>✓ Speed up the design process</li>
                <li>✓ Impress clients with visual concepts</li>
                <li>✓ Generate accurate quotes faster</li>
                <li>✓ Win more projects</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">For Homeowners</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li>✓ Visualize your dream garden</li>
                <li>✓ Compare different design styles</li>
                <li>✓ Get realistic cost estimates</li>
                <li>✓ Plan your landscaping budget</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
