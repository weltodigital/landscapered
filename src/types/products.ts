// Product catalog types for builders merchant integration

export interface Product {
  id: string
  sku: string
  name: string
  description?: string
  category: ProductCategory
  subcategory?: string
  brand?: string
  price: number
  currency: string
  unit: ProductUnit
  availability: ProductAvailability
  merchant: MerchantInfo
  specifications?: ProductSpecifications
  images?: string[]
  features?: string[]
  dimensions?: ProductDimensions
  weight?: number
  environmentalInfo?: EnvironmentalInfo
  createdAt: string
  updatedAt: string
}

export interface ProductSpecifications {
  material?: string
  color?: string
  finish?: string
  size?: string
  coverage?: string
  [key: string]: any
}

export interface ProductDimensions {
  length?: number
  width?: number
  height?: number
  diameter?: number
  thickness?: number
  unit: 'mm' | 'cm' | 'm' | 'inches' | 'feet'
}

export interface EnvironmentalInfo {
  sustainabilityRating?: string
  recyclable?: boolean
  carbonFootprint?: string
  certifications?: string[]
}

export interface MerchantInfo {
  id: string
  name: string
  branch?: string
  location?: string
  contactInfo?: {
    phone?: string
    email?: string
    address?: string
  }
  deliveryInfo?: {
    freeDeliveryThreshold?: number
    deliveryCharge?: number
    estimatedDays?: number
  }
}

export interface ProductAvailability {
  inStock: boolean
  quantity?: number
  leadTime?: string
  estimatedDelivery?: string
  alternativeProducts?: string[]
}

export type ProductCategory =
  | 'aggregates'
  | 'blocks_bricks'
  | 'cement_concrete'
  | 'drainage'
  | 'fencing'
  | 'landscaping'
  | 'paving'
  | 'plants_seeds'
  | 'roofing'
  | 'timber'
  | 'tools_equipment'
  | 'insulation'
  | 'plumbing'
  | 'electrical'
  | 'adhesives_chemicals'

export type ProductUnit =
  | 'each'
  | 'pack'
  | 'bag'
  | 'tonne'
  | 'cubic_metre'
  | 'square_metre'
  | 'linear_metre'
  | 'litre'
  | 'kg'
  | 'pallet'

export interface ProductSearchParams {
  query?: string
  category?: ProductCategory
  subcategory?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  merchant?: string
  location?: string
}

export interface ProductSearchResult {
  products: Product[]
  total: number
  page: number
  pageSize: number
  filters: {
    categories: { category: ProductCategory; count: number }[]
    brands: { brand: string; count: number }[]
    priceRange: { min: number; max: number }
    merchants: { merchant: string; count: number }[]
  }
}

export interface QuoteItem {
  id: string
  quoteId: string
  productId?: string
  product?: Product
  customDescription?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  markup?: number
  markupPercent?: number
  notes?: string
  category: 'product' | 'service' | 'custom'
  createdAt: string
}

export interface PriceQuote {
  id: string
  projectId?: string
  jobId?: string
  customerId: string
  quoteNumber: string
  status: QuoteStatus
  validUntil: string
  items: QuoteItem[]
  subtotal: number
  markup: number
  tax: number
  total: number
  notes?: string
  terms?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  designId?: string
  designImageUrl?: string
  designStyle?: string
  designImageNumber?: number
}

export type QuoteStatus =
  | 'draft'
  | 'pending'
  | 'sent'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'converted'

// API integration types for different merchants
export interface MerchantAPI {
  id: string
  name: string
  baseUrl: string
  apiKey?: string
  authType: 'api_key' | 'oauth' | 'basic'
  rateLimit?: {
    requestsPerMinute: number
    requestsPerHour: number
  }
  endpoints: {
    search: string
    product: string
    availability: string
    pricing: string
  }
  supportedFeatures: MerchantFeatures
}

export interface MerchantFeatures {
  realTimePricing: boolean
  stockLevels: boolean
  bulkPricing: boolean
  deliveryCalculation: boolean
  branchSpecificPricing: boolean
  productImages: boolean
  specifications: boolean
}

// Common UK Builders Merchants
export type SupportedMerchant =
  | 'travis_perkins'
  | 'wickes'
  | 'screwfix'
  | 'toolstation'
  | 'buildbase'
  | 'jewson'
  | 'selco'
  | 'city_plumbing'
  | 'keyline'
  | 'marshall_mono'

export interface ProductCartItem {
  product: Product
  quantity: number
  notes?: string
  projectId?: string
  jobId?: string
  addedAt: string
}