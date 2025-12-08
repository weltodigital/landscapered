// Comprehensive landscaping product catalog with realistic UK pricing

import { Product, ProductCategory } from '@/types/products'

// Product catalog - starts empty, products will be added by users
export const LANDSCAPING_CATALOG: Product[] = []

// Helper function to search the catalog
export function searchCatalog(
  query?: string,
  category?: ProductCategory,
  maxPrice?: number
): Product[] {
  let results = [...LANDSCAPING_CATALOG]

  if (query) {
    const searchTerm = query.toLowerCase()
    results = results.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm)
    )
  }

  if (category) {
    results = results.filter(product => product.category === category)
  }

  if (maxPrice) {
    results = results.filter(product => product.price <= maxPrice)
  }

  return results
}

// Helper function to get products by category
export function getProductsByCategory(category: ProductCategory): Product[] {
  return LANDSCAPING_CATALOG.filter(product => product.category === category)
}

// Helper function to calculate project estimates
export function calculateMaterialEstimate(
  areaSquareMetres: number,
  materialType: 'paving' | 'turf' | 'aggregate'
): { productId: string; quantity: number; estimatedCost: number }[] {
  const estimates: { productId: string; quantity: number; estimatedCost: number }[] = []

  // Return empty array since catalog is now empty
  // Users will need to add their own products first
  return estimates
}