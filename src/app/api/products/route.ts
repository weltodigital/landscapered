import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// In-memory product storage (in production, this would be a database)
const products: any[] = (global as any).products || []
if (!(global as any).products) {
  (global as any).products = products
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Filter products for current user
    const userProducts = products.filter(p => p.userId === session.user.email)

    return NextResponse.json(userProducts)

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, price, unit, category, sku, supplierName, supplierUrl, imageUrl } = body

    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    // Create product object
    const newProduct = {
      id: `product-${Date.now()}`,
      name,
      description: description || '',
      price: parseFloat(price),
      unit: unit || 'UNIT',
      category: category || '',
      sku: sku || '',
      supplierName: supplierName || '',
      supplierUrl: supplierUrl || '',
      imageUrl: imageUrl || '',
      isActive: true,
      userId: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Store product
    products.push(newProduct)

    return NextResponse.json(newProduct, { status: 201 })

  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}