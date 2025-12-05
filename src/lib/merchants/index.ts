// Builders merchant API integration service

import {
  Product,
  ProductSearchParams,
  ProductSearchResult,
  MerchantAPI,
  SupportedMerchant,
  MerchantFeatures
} from '@/types/products'

// Configuration for UK Builders Merchants
const MERCHANT_CONFIGS: Record<SupportedMerchant, MerchantAPI> = {
  travis_perkins: {
    id: 'travis_perkins',
    name: 'Travis Perkins',
    baseUrl: 'https://api.travisperkins.co.uk',
    authType: 'api_key',
    endpoints: {
      search: '/products/search',
      product: '/products/{id}',
      availability: '/products/{id}/availability',
      pricing: '/products/{id}/pricing'
    },
    supportedFeatures: {
      realTimePricing: true,
      stockLevels: true,
      bulkPricing: true,
      deliveryCalculation: true,
      branchSpecificPricing: true,
      productImages: true,
      specifications: true
    }
  },
  wickes: {
    id: 'wickes',
    name: 'Wickes',
    baseUrl: 'https://api.wickes.co.uk',
    authType: 'oauth',
    endpoints: {
      search: '/catalogue/search',
      product: '/catalogue/products/{id}',
      availability: '/stock/{id}',
      pricing: '/pricing/{id}'
    },
    supportedFeatures: {
      realTimePricing: true,
      stockLevels: true,
      bulkPricing: false,
      deliveryCalculation: true,
      branchSpecificPricing: true,
      productImages: true,
      specifications: true
    }
  },
  screwfix: {
    id: 'screwfix',
    name: 'Screwfix',
    baseUrl: 'https://api.screwfix.com',
    authType: 'api_key',
    endpoints: {
      search: '/products/search',
      product: '/products/{productCode}',
      availability: '/availability/{productCode}',
      pricing: '/pricing/{productCode}'
    },
    supportedFeatures: {
      realTimePricing: true,
      stockLevels: true,
      bulkPricing: false,
      deliveryCalculation: true,
      branchSpecificPricing: true,
      productImages: true,
      specifications: false
    }
  },
  toolstation: {
    id: 'toolstation',
    name: 'Toolstation',
    baseUrl: 'https://api.toolstation.com',
    authType: 'api_key',
    endpoints: {
      search: '/products',
      product: '/products/{id}',
      availability: '/stock/{id}',
      pricing: '/prices/{id}'
    },
    supportedFeatures: {
      realTimePricing: true,
      stockLevels: true,
      bulkPricing: false,
      deliveryCalculation: false,
      branchSpecificPricing: true,
      productImages: true,
      specifications: false
    }
  },
  buildbase: {
    id: 'buildbase',
    name: 'Buildbase',
    baseUrl: 'https://api.buildbase.co.uk',
    authType: 'api_key',
    endpoints: {
      search: '/search',
      product: '/products/{id}',
      availability: '/availability/{id}',
      pricing: '/pricing/{id}'
    },
    supportedFeatures: {
      realTimePricing: true,
      stockLevels: true,
      bulkPricing: true,
      deliveryCalculation: true,
      branchSpecificPricing: true,
      productImages: false,
      specifications: true
    }
  },
  jewson: {
    id: 'jewson',
    name: 'Jewson',
    baseUrl: 'https://api.jewson.co.uk',
    authType: 'api_key',
    endpoints: {
      search: '/products/search',
      product: '/products/{id}',
      availability: '/stock/{id}',
      pricing: '/prices/{id}'
    },
    supportedFeatures: {
      realTimePricing: true,
      stockLevels: true,
      bulkPricing: true,
      deliveryCalculation: true,
      branchSpecificPricing: true,
      productImages: true,
      specifications: true
    }
  },
  selco: {
    id: 'selco',
    name: 'Selco Builders Warehouse',
    baseUrl: 'https://api.selcobw.com',
    authType: 'api_key',
    endpoints: {
      search: '/products',
      product: '/products/{code}',
      availability: '/stock/{code}',
      pricing: '/pricing/{code}'
    },
    supportedFeatures: {
      realTimePricing: true,
      stockLevels: true,
      bulkPricing: true,
      deliveryCalculation: false,
      branchSpecificPricing: true,
      productImages: false,
      specifications: false
    }
  },
  city_plumbing: {
    id: 'city_plumbing',
    name: 'City Plumbing Supplies',
    baseUrl: 'https://api.cityplumbing.co.uk',
    authType: 'oauth',
    endpoints: {
      search: '/search',
      product: '/products/{id}',
      availability: '/availability/{id}',
      pricing: '/pricing/{id}'
    },
    supportedFeatures: {
      realTimePricing: true,
      stockLevels: true,
      bulkPricing: true,
      deliveryCalculation: true,
      branchSpecificPricing: true,
      productImages: true,
      specifications: true
    }
  },
  keyline: {
    id: 'keyline',
    name: 'Keyline Civils Specialist',
    baseUrl: 'https://api.keyline.co.uk',
    authType: 'api_key',
    endpoints: {
      search: '/products/search',
      product: '/products/{id}',
      availability: '/stock/{id}',
      pricing: '/pricing/{id}'
    },
    supportedFeatures: {
      realTimePricing: true,
      stockLevels: true,
      bulkPricing: true,
      deliveryCalculation: true,
      branchSpecificPricing: true,
      productImages: false,
      specifications: true
    }
  },
  marshall_mono: {
    id: 'marshall_mono',
    name: 'Marshalls Mono',
    baseUrl: 'https://api.marshallsmono.co.uk',
    authType: 'api_key',
    endpoints: {
      search: '/catalogue/search',
      product: '/catalogue/{id}',
      availability: '/stock/{id}',
      pricing: '/pricing/{id}'
    },
    supportedFeatures: {
      realTimePricing: true,
      stockLevels: true,
      bulkPricing: true,
      deliveryCalculation: true,
      branchSpecificPricing: false,
      productImages: true,
      specifications: true
    }
  }
}

class MerchantAPIService {
  private apiKeys: Record<string, string> = {}

  constructor() {
    // Load API keys from environment variables
    this.apiKeys = {
      travis_perkins: process.env.TRAVIS_PERKINS_API_KEY || '',
      wickes: process.env.WICKES_API_KEY || '',
      screwfix: process.env.SCREWFIX_API_KEY || '',
      toolstation: process.env.TOOLSTATION_API_KEY || '',
      buildbase: process.env.BUILDBASE_API_KEY || '',
      jewson: process.env.JEWSON_API_KEY || '',
      selco: process.env.SELCO_API_KEY || '',
      city_plumbing: process.env.CITY_PLUMBING_API_KEY || '',
      keyline: process.env.KEYLINE_API_KEY || '',
      marshall_mono: process.env.MARSHALL_MONO_API_KEY || ''
    }
  }

  async searchProducts(
    params: ProductSearchParams,
    merchants: SupportedMerchant[] = ['travis_perkins', 'wickes', 'screwfix']
  ): Promise<ProductSearchResult> {
    const searchPromises = merchants.map(merchant => this.searchFromMerchant(merchant, params))

    try {
      const results = await Promise.allSettled(searchPromises)
      const products: Product[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          products.push(...result.value)
        } else {
          console.warn(`Search failed for ${merchants[index]}:`, result.reason)
        }
      })

      return {
        products: this.deduplicateProducts(products),
        total: products.length,
        page: 1,
        pageSize: products.length,
        filters: this.generateFilters(products)
      }
    } catch (error) {
      console.error('Product search failed:', error)
      throw new Error('Failed to search products from merchants')
    }
  }

  private async searchFromMerchant(
    merchant: SupportedMerchant,
    params: ProductSearchParams
  ): Promise<Product[]> {
    const config = MERCHANT_CONFIGS[merchant]
    const apiKey = this.apiKeys[merchant]

    if (!apiKey) {
      console.warn(`No API key configured for ${merchant}`)
      return this.getMockProducts(merchant, params)
    }

    // In production, this would make real API calls
    // For now, return mock data that simulates real merchant responses
    return this.getMockProducts(merchant, params)
  }

  private getMockProducts(merchant: SupportedMerchant, params: ProductSearchParams): Product[] {
    // Mock product data for demonstration
    const mockProducts: Product[] = [
      {
        id: `${merchant}-001`,
        sku: 'BLK-001',
        name: 'Standard Concrete Block 100mm',
        description: 'High quality concrete building block, perfect for construction projects',
        category: 'blocks_bricks',
        subcategory: 'concrete_blocks',
        brand: 'Thermalite',
        price: 1.85,
        currency: 'GBP',
        unit: 'each',
        availability: {
          inStock: true,
          quantity: 500,
          leadTime: '1-2 days',
          estimatedDelivery: '2024-12-02'
        },
        merchant: {
          id: merchant,
          name: MERCHANT_CONFIGS[merchant].name,
          branch: 'London Central',
          location: 'London, UK',
          deliveryInfo: {
            freeDeliveryThreshold: 500,
            deliveryCharge: 25,
            estimatedDays: 2
          }
        },
        specifications: {
          material: 'Concrete',
          size: '100mm',
          finish: 'Standard'
        },
        dimensions: {
          length: 440,
          width: 215,
          height: 100,
          unit: 'mm'
        },
        createdAt: '2024-11-28T10:00:00Z',
        updatedAt: '2024-11-28T10:00:00Z'
      },
      {
        id: `${merchant}-002`,
        sku: 'PAV-001',
        name: 'Natural Sandstone Paving 600x600',
        description: 'Premium quality natural sandstone paving slabs',
        category: 'paving',
        subcategory: 'natural_stone',
        brand: 'Marshalls',
        price: 28.50,
        currency: 'GBP',
        unit: 'each',
        availability: {
          inStock: true,
          quantity: 200,
          leadTime: '3-5 days',
          estimatedDelivery: '2024-12-05'
        },
        merchant: {
          id: merchant,
          name: MERCHANT_CONFIGS[merchant].name,
          branch: 'Manchester',
          location: 'Manchester, UK',
          deliveryInfo: {
            freeDeliveryThreshold: 1000,
            deliveryCharge: 50,
            estimatedDays: 5
          }
        },
        specifications: {
          material: 'Natural Sandstone',
          color: 'Buff',
          finish: 'Riven',
          size: '600x600x22mm'
        },
        dimensions: {
          length: 600,
          width: 600,
          height: 22,
          unit: 'mm'
        },
        createdAt: '2024-11-28T10:00:00Z',
        updatedAt: '2024-11-28T10:00:00Z'
      },
      {
        id: `${merchant}-003`,
        sku: 'AGG-001',
        name: '10mm Granite Chippings',
        description: 'Premium granite decorative aggregate',
        category: 'aggregates',
        subcategory: 'decorative',
        brand: 'Aggregate Industries',
        price: 45.00,
        currency: 'GBP',
        unit: 'tonne',
        availability: {
          inStock: true,
          quantity: 50,
          leadTime: '1 day',
          estimatedDelivery: '2024-12-01'
        },
        merchant: {
          id: merchant,
          name: MERCHANT_CONFIGS[merchant].name,
          branch: 'Birmingham',
          location: 'Birmingham, UK',
          deliveryInfo: {
            freeDeliveryThreshold: 300,
            deliveryCharge: 35,
            estimatedDays: 1
          }
        },
        specifications: {
          material: 'Granite',
          color: 'Grey/Pink',
          size: '10mm'
        },
        createdAt: '2024-11-28T10:00:00Z',
        updatedAt: '2024-11-28T10:00:00Z'
      }
    ]

    // Filter based on search parameters
    return mockProducts.filter(product => {
      if (params.category && product.category !== params.category) return false
      if (params.query) {
        const query = params.query.toLowerCase()
        return (
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query) ||
          product.brand?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }

  private deduplicateProducts(products: Product[]): Product[] {
    const seen = new Set<string>()
    return products.filter(product => {
      const key = `${product.sku}-${product.name}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private generateFilters(products: Product[]) {
    const categories = new Map<string, number>()
    const brands = new Map<string, number>()
    const merchants = new Map<string, number>()
    let minPrice = Infinity
    let maxPrice = 0

    products.forEach(product => {
      // Categories
      categories.set(product.category, (categories.get(product.category) || 0) + 1)

      // Brands
      if (product.brand) {
        brands.set(product.brand, (brands.get(product.brand) || 0) + 1)
      }

      // Merchants
      merchants.set(product.merchant.name, (merchants.get(product.merchant.name) || 0) + 1)

      // Price range
      minPrice = Math.min(minPrice, product.price)
      maxPrice = Math.max(maxPrice, product.price)
    })

    return {
      categories: Array.from(categories.entries()).map(([category, count]) => ({
        category: category as any,
        count
      })),
      brands: Array.from(brands.entries()).map(([brand, count]) => ({ brand, count })),
      merchants: Array.from(merchants.entries()).map(([merchant, count]) => ({ merchant, count })),
      priceRange: { min: minPrice === Infinity ? 0 : minPrice, max: maxPrice }
    }
  }

  async getProduct(merchant: SupportedMerchant, productId: string): Promise<Product | null> {
    const config = MERCHANT_CONFIGS[merchant]
    const apiKey = this.apiKeys[merchant]

    if (!apiKey) {
      console.warn(`No API key configured for ${merchant}`)
      return null
    }

    // In production, make real API call
    // For now, return mock data
    return this.getMockProducts(merchant, {})[0] || null
  }

  getSupportedMerchants(): Record<SupportedMerchant, MerchantAPI> {
    return MERCHANT_CONFIGS
  }

  isMerchantConfigured(merchant: SupportedMerchant): boolean {
    return !!this.apiKeys[merchant]
  }
}

// Export singleton instance
export const merchantAPI = new MerchantAPIService()

// Helper functions
export function formatPrice(price: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency
  }).format(price)
}

export function calculateMarkup(cost: number, markupPercent: number): number {
  return cost * (markupPercent / 100)
}

export function calculateTotalWithMarkup(cost: number, markupPercent: number): number {
  return cost + calculateMarkup(cost, markupPercent)
}

export * from '@/types/products'