// Comprehensive landscaping product catalog with realistic UK pricing

import { Product, ProductCategory } from '@/types/products'

// Common landscaping products with current UK market pricing (November 2024)
export const LANDSCAPING_CATALOG: Product[] = [
  // === PAVING & HARD LANDSCAPING ===
  {
    id: 'pav-001',
    sku: 'SAND-600-AUTUMN',
    name: 'Indian Sandstone Paving 600x600mm',
    description: 'Natural riven finish sandstone paving in autumn brown. Perfect for patios and pathways.',
    category: 'paving',
    subcategory: 'natural_stone',
    brand: 'Natural Stone Company',
    price: 24.99,
    currency: 'GBP',
    unit: 'each',
    availability: { inStock: true, quantity: 500 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Indian Sandstone',
      color: 'Autumn Brown',
      finish: 'Riven',
      size: '600x600x20mm',
      coverage: '0.36 sqm per slab'
    },
    dimensions: { length: 600, width: 600, height: 20, unit: 'mm' },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },
  {
    id: 'pav-002',
    sku: 'CONCRETE-SLAB-600',
    name: 'Concrete Paving Slab 600x600mm',
    description: 'Smooth finish concrete paving slab in charcoal grey.',
    category: 'paving',
    subcategory: 'concrete',
    brand: 'Bradstone',
    price: 8.50,
    currency: 'GBP',
    unit: 'each',
    availability: { inStock: true, quantity: 1000 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Concrete',
      color: 'Charcoal Grey',
      finish: 'Smooth',
      size: '600x600x35mm'
    },
    dimensions: { length: 600, width: 600, height: 35, unit: 'mm' },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },
  {
    id: 'pav-003',
    sku: 'BLOCK-PAVING-200',
    name: 'Block Paving 200x100mm',
    description: 'Charcoal block paving, ideal for driveways and paths.',
    category: 'paving',
    subcategory: 'block_paving',
    brand: 'Marshalls',
    price: 1.85,
    currency: 'GBP',
    unit: 'each',
    availability: { inStock: true, quantity: 5000 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Concrete',
      color: 'Charcoal',
      size: '200x100x60mm',
      coverage: '50 blocks per sqm'
    },
    dimensions: { length: 200, width: 100, height: 60, unit: 'mm' },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },

  // === AGGREGATES & DECORATIVE STONES ===
  {
    id: 'agg-001',
    sku: 'GRAVEL-10MM-GOLDEN',
    name: 'Golden Gravel 10mm',
    description: 'Decorative golden gravel, perfect for pathways and borders.',
    category: 'aggregates',
    subcategory: 'decorative',
    brand: 'Aggregate Industries',
    price: 48.00,
    currency: 'GBP',
    unit: 'tonne',
    availability: { inStock: true, quantity: 100 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Natural Stone',
      color: 'Golden',
      size: '10mm',
      coverage: '1 tonne covers approximately 12 sqm at 50mm depth'
    },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },
  {
    id: 'agg-002',
    sku: 'SLATE-CHIPPINGS-20MM',
    name: 'Blue Slate Chippings 20mm',
    description: 'Premium blue slate chippings for modern garden designs.',
    category: 'aggregates',
    subcategory: 'decorative',
    brand: 'Welsh Slate',
    price: 75.00,
    currency: 'GBP',
    unit: 'tonne',
    availability: { inStock: true, quantity: 50 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Welsh Slate',
      color: 'Blue',
      size: '20mm',
      coverage: '1 tonne covers approximately 10 sqm at 50mm depth'
    },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },

  // === SOIL & GROWING MEDIA ===
  {
    id: 'soil-001',
    sku: 'TOPSOIL-PREMIUM',
    name: 'Premium Topsoil',
    description: 'High-quality screened topsoil, ideal for lawns and planting.',
    category: 'landscaping',
    subcategory: 'soil',
    brand: 'Rolawn',
    price: 35.00,
    currency: 'GBP',
    unit: 'tonne',
    availability: { inStock: true, quantity: 200 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Screened Topsoil',
      ph: '6.0-7.5',
      coverage: '1 tonne covers approximately 12 sqm at 100mm depth'
    },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },
  {
    id: 'soil-002',
    sku: 'COMPOST-MULTI-PURPOSE',
    name: 'Multi-Purpose Compost 40L',
    description: 'High-quality multi-purpose compost for all garden plants.',
    category: 'landscaping',
    subcategory: 'compost',
    brand: 'Westland',
    price: 4.99,
    currency: 'GBP',
    unit: 'bag',
    availability: { inStock: true, quantity: 500 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Multi-Purpose Compost',
      volume: '40 litres',
      nutrients: 'With added John Innes'
    },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },

  // === TURF & GRASS SEED ===
  {
    id: 'turf-001',
    sku: 'TURF-FAMILY-LAWN',
    name: 'Family Lawn Turf',
    description: 'Hard-wearing turf perfect for family gardens with children and pets.',
    category: 'plants_seeds',
    subcategory: 'turf',
    brand: 'Rolawn Medallion',
    price: 3.50,
    currency: 'GBP',
    unit: 'square_metre',
    availability: { inStock: true, quantity: 1000 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Mixed Grass Varieties',
      type: 'Family Lawn',
      thickness: '25mm'
    },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },
  {
    id: 'seed-001',
    sku: 'GRASS-SEED-LUXURY',
    name: 'Luxury Lawn Grass Seed 10kg',
    description: 'Premium grass seed mixture for creating beautiful lawns.',
    category: 'plants_seeds',
    subcategory: 'grass_seed',
    brand: 'DLF Trifolium',
    price: 89.99,
    currency: 'GBP',
    unit: 'bag',
    availability: { inStock: true, quantity: 100 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Grass Seed Mix',
      weight: '10kg',
      coverage: 'Covers approximately 400 sqm'
    },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },

  // === BUILDING MATERIALS ===
  {
    id: 'block-001',
    sku: 'CONCRETE-BLOCK-100',
    name: 'Concrete Block 100mm',
    description: 'Standard concrete building block for construction work.',
    category: 'blocks_bricks',
    subcategory: 'concrete_blocks',
    brand: 'Thermalite',
    price: 1.89,
    currency: 'GBP',
    unit: 'each',
    availability: { inStock: true, quantity: 2000 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Concrete',
      size: '440x215x100mm',
      strength: '7.3N/mm²'
    },
    dimensions: { length: 440, width: 215, height: 100, unit: 'mm' },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },
  {
    id: 'cement-001',
    sku: 'CEMENT-PORTLAND-25KG',
    name: 'Portland Cement 25kg',
    description: 'General purpose Portland cement for concrete and mortar.',
    category: 'cement_concrete',
    subcategory: 'cement',
    brand: 'Hanson',
    price: 4.50,
    currency: 'GBP',
    unit: 'bag',
    availability: { inStock: true, quantity: 500 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Portland Cement',
      weight: '25kg',
      type: 'CEM I 52.5N'
    },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },

  // === FENCING MATERIALS ===
  {
    id: 'fence-001',
    sku: 'FENCE-PANEL-6FT',
    name: 'Featheredge Fence Panel 6ft',
    description: 'Pressure treated featheredge fence panel.',
    category: 'fencing',
    subcategory: 'panels',
    brand: 'Forest Garden',
    price: 28.99,
    currency: 'GBP',
    unit: 'each',
    availability: { inStock: true, quantity: 200 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Pressure Treated Timber',
      size: '1.83m x 1.83m',
      thickness: '32mm'
    },
    dimensions: { length: 1830, width: 1830, height: 32, unit: 'mm' },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },

  // === DRAINAGE ===
  {
    id: 'drain-001',
    sku: 'LAND-DRAIN-100MM',
    name: 'Perforated Land Drain 100mm',
    description: 'Flexible perforated drainage pipe for land drainage.',
    category: 'drainage',
    subcategory: 'land_drainage',
    brand: 'Wavin',
    price: 3.25,
    currency: 'GBP',
    unit: 'linear_metre',
    availability: { inStock: true, quantity: 1000 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'HDPE',
      diameter: '100mm',
      type: 'Perforated'
    },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  },

  // === PLANTS ===
  {
    id: 'plant-001',
    sku: 'LAVENDER-MUNSTEAD',
    name: 'Lavender Munstead 9cm Pot',
    description: 'Compact lavender variety, perfect for borders and containers.',
    category: 'plants_seeds',
    subcategory: 'perennials',
    brand: 'Thompson & Morgan',
    price: 4.99,
    currency: 'GBP',
    unit: 'each',
    availability: { inStock: true, quantity: 100 },
    merchant: {
      id: 'catalog',
      name: 'Landscaping Catalog',
      location: 'UK Wide'
    },
    specifications: {
      material: 'Live Plant',
      size: '9cm pot',
      height: '15-20cm',
      spread: '30cm',
      flowering: 'June-September'
    },
    createdAt: '2024-11-28T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z'
  }
]

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
      product.description.toLowerCase().includes(searchTerm) ||
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

  switch (materialType) {
    case 'paving':
      // Assume 600x600mm slabs (0.36 sqm each)
      const pavingSlabs = Math.ceil(areaSquareMetres / 0.36)
      const pavingProduct = LANDSCAPING_CATALOG.find(p => p.id === 'pav-001')
      if (pavingProduct) {
        estimates.push({
          productId: pavingProduct.id,
          quantity: pavingSlabs,
          estimatedCost: pavingSlabs * pavingProduct.price
        })
      }
      break

    case 'turf':
      const turfProduct = LANDSCAPING_CATALOG.find(p => p.id === 'turf-001')
      if (turfProduct) {
        estimates.push({
          productId: turfProduct.id,
          quantity: areaSquareMetres,
          estimatedCost: areaSquareMetres * turfProduct.price
        })
      }
      break

    case 'aggregate':
      // Assume 50mm depth, 1 tonne covers ~12 sqm
      const tonnageRequired = Math.ceil(areaSquareMetres / 12)
      const aggregateProduct = LANDSCAPING_CATALOG.find(p => p.id === 'agg-001')
      if (aggregateProduct) {
        estimates.push({
          productId: aggregateProduct.id,
          quantity: tonnageRequired,
          estimatedCost: tonnageRequired * aggregateProduct.price
        })
      }
      break
  }

  return estimates
}