// Web scraping solution for builders merchant product data

import { Product, ProductSearchParams, SupportedMerchant } from '@/types/products'

// Web scraping configurations for public merchant websites
const SCRAPER_CONFIGS = {
  wickes: {
    baseUrl: 'https://www.wickes.co.uk',
    searchUrl: 'https://www.wickes.co.uk/search?text={query}',
    selectors: {
      productGrid: '.product-tile',
      productName: '.product-tile__title',
      productPrice: '.price__value',
      productImage: '.product-tile__image img',
      productLink: '.product-tile__link'
    }
  },
  screwfix: {
    baseUrl: 'https://www.screwfix.com',
    searchUrl: 'https://www.screwfix.com/search?text={query}',
    selectors: {
      productGrid: '.product-item',
      productName: '.product-title',
      productPrice: '.price',
      productImage: '.product-image img',
      productLink: '.product-link'
    }
  },
  toolstation: {
    baseUrl: 'https://www.toolstation.com',
    searchUrl: 'https://www.toolstation.com/search?q={query}',
    selectors: {
      productGrid: '.product-tile',
      productName: '.product-name',
      productPrice: '.price-now',
      productImage: '.product-image img',
      productLink: '.product-link'
    }
  }
}

class ProductScraper {
  async scrapeProducts(
    merchant: SupportedMerchant,
    query: string,
    maxResults = 20
  ): Promise<Product[]> {
    try {
      // In a real implementation, you'd use puppeteer, playwright, or similar
      // For this demo, we'll return structured mock data that represents scraped results

      return this.getMockScrapedData(merchant, query, maxResults)
    } catch (error) {
      console.error(`Scraping failed for ${merchant}:`, error)
      return []
    }
  }

  private getMockScrapedData(
    merchant: SupportedMerchant,
    query: string,
    maxResults: number
  ): Product[] {
    // Mock data representing what would be scraped from websites
    const mockData: Product[] = [
      {
        id: `${merchant}-scraped-001`,
        sku: 'WX-BLK-001',
        name: 'Concrete Block 100mm 440x215mm',
        description: 'Standard concrete block for general building work',
        category: 'blocks_bricks',
        brand: 'Wickes',
        price: 1.89,
        currency: 'GBP',
        unit: 'each',
        availability: {
          inStock: true,
          quantity: 1000,
          leadTime: 'In stock'
        },
        merchant: {
          id: merchant,
          name: this.getMerchantDisplayName(merchant),
          location: 'Multiple locations',
          deliveryInfo: {
            freeDeliveryThreshold: 500,
            deliveryCharge: 25,
            estimatedDays: 3
          }
        },
        images: [`https://www.${merchant}.co.uk/images/concrete-block-001.jpg`],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${merchant}-scraped-002`,
        sku: 'WX-PAV-001',
        name: 'Indian Sandstone Paving 600x600x20mm',
        description: 'Natural riven sandstone paving in autumn brown',
        category: 'paving',
        brand: 'Natural Stone',
        price: 24.99,
        currency: 'GBP',
        unit: 'each',
        availability: {
          inStock: true,
          quantity: 250,
          leadTime: 'In stock'
        },
        merchant: {
          id: merchant,
          name: this.getMerchantDisplayName(merchant),
          location: 'Multiple locations',
          deliveryInfo: {
            freeDeliveryThreshold: 500,
            deliveryCharge: 45,
            estimatedDays: 5
          }
        },
        images: [`https://www.${merchant}.co.uk/images/sandstone-paving-001.jpg`],
        specifications: {
          material: 'Indian Sandstone',
          color: 'Autumn Brown',
          finish: 'Riven',
          size: '600x600x20mm'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `${merchant}-scraped-003`,
        sku: 'WX-CEM-001',
        name: 'General Purpose Cement 25kg',
        description: 'Portland cement suitable for general building work',
        category: 'cement_concrete',
        brand: 'Hanson',
        price: 4.50,
        currency: 'GBP',
        unit: 'bag',
        availability: {
          inStock: true,
          quantity: 500,
          leadTime: 'In stock'
        },
        merchant: {
          id: merchant,
          name: this.getMerchantDisplayName(merchant),
          location: 'Multiple locations',
          deliveryInfo: {
            freeDeliveryThreshold: 500,
            deliveryCharge: 25,
            estimatedDays: 2
          }
        },
        images: [`https://www.${merchant}.co.uk/images/cement-25kg-001.jpg`],
        specifications: {
          material: 'Portland Cement',
          weight: '25kg',
          coverage: 'Approx 0.5m² at 50mm depth'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    // Filter based on query
    const filtered = query
      ? mockData.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase())
        )
      : mockData

    return filtered.slice(0, maxResults)
  }

  private getMerchantDisplayName(merchant: SupportedMerchant): string {
    const names: Record<SupportedMerchant, string> = {
      wickes: 'Wickes',
      screwfix: 'Screwfix',
      toolstation: 'Toolstation',
      travis_perkins: 'Travis Perkins',
      buildbase: 'Buildbase',
      jewson: 'Jewson',
      selco: 'Selco',
      city_plumbing: 'City Plumbing',
      keyline: 'Keyline',
      marshall_mono: 'Marshalls'
    }
    return names[merchant] || merchant
  }
}

export const productScraper = new ProductScraper()