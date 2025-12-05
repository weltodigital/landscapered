'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, User, Mail, Image, Wand2, Loader2, X, Check, Settings, Trash2, Edit, Save } from 'lucide-react'

interface Project {
  id: string
  title: string
  clientName: string
  clientEmail: string
  description: string
  preferredStyle?: string
  gardenLength?: number
  gardenWidth?: number
  dimensionUnit?: string
  photos: Array<{url: string, name: string, base64?: string}>
  designs?: any[]
  status: string
  createdAt: string
  updatedAt: string
}

export default function ProjectDetailPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [designs, setDesigns] = useState<any[]>([])
  const [selectedDesign, setSelectedDesign] = useState<any>(null)
  const [selectedElements, setSelectedElements] = useState<any[]>([])
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const [selectedDesignImage, setSelectedDesignImage] = useState<any>(null)
  const [elementProducts, setElementProducts] = useState<{[elementId: string]: any[]}>({}) // Products assigned to specific elements
  const [elementCustomization, setElementCustomization] = useState<{[elementId: string]: {area: number, price: number}}>({}) // Custom area and price for elements
  const [selectedStyle, setSelectedStyle] = useState<string>('')
  const [selectedDesignElements, setSelectedDesignElements] = useState<any[]>([])
  const [isEditingDimensions, setIsEditingDimensions] = useState(false)
  const [editDimensions, setEditDimensions] = useState({length: '', width: '', unit: 'metres'})
  const [products, setProducts] = useState<any[]>([])
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])
  const [error, setError] = useState('')
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    unit: 'UNIT',
    category: '',
    sku: '',
    supplierName: '',
    supplierUrl: '',
    description: ''
  })
  const [customSupplier, setCustomSupplier] = useState('')
  const [selectedProductCategory, setSelectedProductCategory] = useState('')
  const [elementDetails, setElementDetails] = useState<{[elementId: string]: {note: string, size: string, unit: string}}>({})
  const [showElementForm, setShowElementForm] = useState<string | null>(null)
  const [elementsFinalized, setElementsFinalized] = useState(false)
  const [isAddingCustomElement, setIsAddingCustomElement] = useState(false)
  const [customElement, setCustomElement] = useState({
    name: '',
    description: '',
    type: 'CUSTOM',
    unit: 'sqm',
    estimatedPrice: ''
  })
  const [customElements, setCustomElements] = useState<any[]>([])
  const [productQuantities, setProductQuantities] = useState<{[productId: string]: number}>({})
  const [showFeatureSelection, setShowFeatureSelection] = useState<{[productId: string]: boolean}>({})

  const ukSuppliers = [
    'B&Q',
    'Wickes',
    'Homebase',
    'Screwfix',
    'Travis Perkins',
    'Jewson',
    'Buildbase',
    'Selco',
    'Toolstation',
    'Magnet Trade',
    'Covers Timber & Builders Merchants',
    'Huws Gray',
    'Custom'
  ]

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch('/api/projects')
        if (!response.ok) throw new Error('Failed to fetch projects')

        const projects = await response.json()
        const currentProject = projects.find((p: Project) => p.id === params.projectId)

        if (!currentProject) {
          setError('Project not found')
        } else {
          setProject(currentProject)
          // Load existing designs if any
          setDesigns(currentProject.designs || [])
        }
      } catch (err) {
        setError('Failed to load project')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
    fetchProducts()
  }, [params.projectId])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const addNewProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      setError('Name and price are required')
      return
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct)
      })

      if (!response.ok) throw new Error('Failed to create product')

      const createdProduct = await response.json()
      setProducts(prev => [...prev, createdProduct])
      setNewProduct({
        name: '',
        price: '',
        unit: 'UNIT',
        category: '',
        sku: '',
        supplierName: '',
        supplierUrl: '',
        description: ''
      })
      setCustomSupplier('')
      setIsAddingProduct(false)
      setError('')
    } catch (err) {
      setError('Failed to create product. Please try again.')
    }
  }

  const handleProductInputChange = (field: string, value: string) => {
    if (field === 'supplierName') {
      if (value === 'Custom') {
        setNewProduct({ ...newProduct, [field]: 'Custom' })
      } else {
        setNewProduct({ ...newProduct, [field]: value })
        setCustomSupplier('')
      }
    } else {
      setNewProduct({ ...newProduct, [field]: value })
    }
  }

  const handleCustomSupplierChange = (value: string) => {
    setCustomSupplier(value)
    setNewProduct({ ...newProduct, supplierName: value })
  }

  const addCustomElement = () => {
    if (!customElement.name || !customElement.description) {
      setError('Element name and description are required')
      return
    }

    const newElement = {
      type: 'CUSTOM',
      name: customElement.name,
      description: customElement.description,
      unit: customElement.unit.toUpperCase(),
      price: parseFloat(customElement.estimatedPrice) || 0,
      defaultArea: 1,
      isCustom: true
    }

    // Add to custom elements list
    setCustomElements(prev => [...prev, newElement])

    // Reset the form
    setCustomElement({
      name: '',
      description: '',
      type: 'CUSTOM',
      unit: 'sqm',
      estimatedPrice: ''
    })
    setIsAddingCustomElement(false)
    setError('')
  }

  const deleteCustomElement = (elementToDelete: any) => {
    if (!confirm(`Are you sure you want to delete the custom element "${elementToDelete.name}"?`)) return

    // Remove from custom elements
    setCustomElements(prev => prev.filter(el => el.name !== elementToDelete.name))

    // Remove from selected elements if selected
    const elementId = `${elementToDelete.type}-${elementToDelete.name}`
    setSelectedElements(prev => prev.filter(e => e.type !== elementToDelete.type || e.name !== elementToDelete.name))

    // Remove element details
    setElementDetails(prev => {
      const newDetails = { ...prev }
      delete newDetails[elementId]
      return newDetails
    })

    // Remove assigned products
    setElementProducts(prev => {
      const newProducts = { ...prev }
      delete newProducts[elementId]
      return newProducts
    })
  }

  const generateDesigns = async () => {
    if (!project) return

    setIsGenerating(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/generate-designs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usePreferredStyle: selectedStyle ? false : true,
          styles: selectedStyle ? [selectedStyle, selectedStyle, selectedStyle] : undefined,
          selectedElements: selectedDesignElements
        })
      })

      if (!response.ok) throw new Error('Failed to generate designs')

      const generatedDesigns = await response.json()
      // Append new designs to existing ones
      setDesigns(prev => [...prev, ...generatedDesigns])
    } catch (err) {
      setError('Failed to generate designs. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const deleteDesign = async (designId: string) => {
    if (!project || !confirm('Are you sure you want to delete this design?')) return

    try {
      const response = await fetch(`/api/projects/${project.id}/designs/${designId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete design')

      // Remove from local state
      setDesigns(prev => prev.filter(d => d.id !== designId))

      // Close modal if the deleted design was selected
      if (selectedDesign?.id === designId) {
        setSelectedDesign(null)
      }
      if (selectedDesignImage?.id === designId) {
        setSelectedDesignImage(null)
      }
    } catch (err) {
      setError('Failed to delete design. Please try again.')
    }
  }

  const deletePhoto = async (photoIndex: number) => {
    if (!project || !confirm('Are you sure you want to delete this photo?')) return

    try {
      const response = await fetch(`/api/projects/${project.id}/photos/${photoIndex}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete photo')

      // Update project state
      const updatedProject = {
        ...project,
        photos: project.photos.filter((_, index) => index !== photoIndex)
      }
      setProject(updatedProject)

      // Close modal if the deleted photo was selected
      if (selectedPhoto === project.photos[photoIndex]) {
        setSelectedPhoto(null)
      }
    } catch (err) {
      setError('Failed to delete photo. Please try again.')
    }
  }

  const selectElement = (element: any) => {
    setSelectedElements(prev => {
      const isAlreadySelected = prev.find(e => e.id === element.id)
      if (isAlreadySelected) {
        return prev.filter(e => e.id !== element.id)
      }
      return [...prev, element]
    })
  }

  const getTotalCost = () => {
    const elementsTotal = selectedElements.reduce((total, element) => {
      // Mock pricing calculation based on element type and area
      const basePrices: { [key: string]: number } = {
        'PATIO': 150,
        'TURF': 45,
        'PLANTING_BED': 85,
        'PATHWAY': 75,
        'WATER_FEATURE': 2500,
        'LIGHTING': 125,
        'SEATING': 800,
        'BORDER': 60,
      }
      const basePrice = basePrices[element.type] || 100

      return total + (basePrice * (element.unit === 'UNIT' ? 1 : element.area))
    }, 0)

    const productsTotal = selectedProducts.reduce((total, product) => {
      return total + (product.price * product.quantity)
    }, 0)

    return elementsTotal + productsTotal
  }

  const generateQuote = async () => {
    if (!project || (selectedElements.length === 0 && selectedProducts.length === 0)) return

    setIsGeneratingQuote(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elements: selectedElements,
          products: selectedProducts,
          clientDetails: {
            name: project.clientName,
            email: project.clientEmail,
            projectTitle: project.title
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate quote')

      const quote = await response.json()

      // Trigger PDF download via POST with quote data
      const pdfResponse = await fetch(`/api/quotes/${quote.id}/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quote)
      })

      if (!pdfResponse.ok) throw new Error('Failed to generate PDF')

      // Download the PDF
      const pdfBlob = await pdfResponse.blob()
      const downloadUrl = URL.createObjectURL(pdfBlob)
      const downloadLink = document.createElement('a')
      downloadLink.href = downloadUrl
      downloadLink.download = `quote-${quote.id}.pdf`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(downloadUrl)

      // Show success message
      alert(`Quote generated and downloaded successfully! Quote ID: ${quote.id}`)

      // Clear selected elements and products after successful quote generation
      setSelectedElements([])
      setSelectedProducts([])

    } catch (err) {
      setError('Failed to generate quote. Please try again.')
    } finally {
      setIsGeneratingQuote(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-6">
        <div className="text-center">Loading project...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="container mx-auto py-8 px-6">
        <div className="text-center text-red-600">{error || 'Project not found'}</div>
        <div className="text-center mt-4">
          <Link href="/app">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const renderEditDimensionsModal = () => {
    if (!isEditingDimensions || !project) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">Edit Garden Dimensions</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Length</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 10.5"
                value={editDimensions.length}
                onChange={(e) => setEditDimensions(prev => ({ ...prev, length: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Width</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g., 8.0"
                value={editDimensions.width}
                onChange={(e) => setEditDimensions(prev => ({ ...prev, width: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Unit</label>
              <select
                value={editDimensions.unit}
                onChange={(e) => setEditDimensions(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="metres">Metres</option>
                <option value="feet">Feet</option>
              </select>
            </div>

            {editDimensions.length && editDimensions.width && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  Total area: {(parseFloat(editDimensions.length) * parseFloat(editDimensions.width)).toFixed(1)} {editDimensions.unit === 'metres' ? 'sq m' : 'sq ft'}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditingDimensions(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    if (!project || !editDimensions.length || !editDimensions.width) return

                    const response = await fetch(`/api/projects/${project.id}`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        gardenLength: parseFloat(editDimensions.length),
                        gardenWidth: parseFloat(editDimensions.width),
                        dimensionUnit: editDimensions.unit
                      })
                    })

                    if (!response.ok) throw new Error('Failed to update dimensions')

                    const updatedProject = await response.json()

                    setProject(updatedProject)
                    setIsEditingDimensions(false)

                  } catch (error) {
                    setError('Failed to update garden dimensions. Please try again.')
                  }
                }}
                disabled={!editDimensions.length || !editDimensions.width}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/app">
              <Button variant="ghost" className="hover:bg-gray-100 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <Badge variant="outline" className="capitalize px-3 py-1">
              {project.status.toLowerCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-semibold text-gray-900">{project.title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Project Details - Full Width Top Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{project.clientName}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">{new Date(project.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Client Email</div>
              <div className="text-gray-700 text-sm">{project.clientEmail}</div>
            </div>
            {project.preferredStyle && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Preferred Style</div>
                <div className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {project.preferredStyle}
                </div>
              </div>
            )}
            {(project.gardenLength && project.gardenWidth) && (
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <div className="text-sm text-gray-500">Garden Size</div>
                  <button
                    onClick={() => {
                      setEditDimensions({
                        length: project.gardenLength?.toString() || '',
                        width: project.gardenWidth?.toString() || '',
                        unit: project.dimensionUnit || 'metres'
                      })
                      setIsEditingDimensions(true)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-gray-900 text-sm">
                    {project.gardenLength} × {project.gardenWidth} {project.dimensionUnit || 'metres'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {(project.gardenLength * project.gardenWidth).toFixed(1)} {project.dimensionUnit === 'metres' ? 'sq m' : 'sq ft'}
                  </div>
                </div>
              </div>
            )}
            <div className="col-span-2">
              <div className="text-sm text-gray-500 mb-1">Description</div>
              {project.description ? (
                <p className="text-gray-700 text-sm leading-relaxed">{project.description}</p>
              ) : (
                <p className="text-gray-400 text-sm italic">No description provided</p>
              )}
            </div>
          </div>
        </div>

        {/* Garden Photos - Full Width Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              Garden Photos
              <span className="text-sm font-normal text-gray-500">({project.photos.length})</span>
            </h2>
          </div>
          <div className="p-6">
            {project.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {project.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-all duration-300"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    {photo.base64 ? (
                      <img
                        src={photo.base64}
                        alt={photo.name || `Garden photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML =
                              '<div class="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">' +
                                '<div class="text-center text-gray-500">' +
                                  '<div class="text-sm font-medium">Photo ' + (index + 1) + '</div>' +
                                  '<div class="text-xs text-gray-400">' + photo.name + '</div>' +
                                '</div>' +
                              '</div>'
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Image className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <div className="text-sm font-medium">Photo {index + 1}</div>
                          <div className="text-xs text-gray-400">{photo.name}</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 left-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {photo.name || `Photo ${index + 1}`}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deletePhoto(index)
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                      title="Delete photo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No photos uploaded</h3>
                <p className="text-gray-500">Upload photos to get started with AI design generation</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Design Generation Section - Full Width */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Design Generation</h3>

          {/* Style Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Generate Style</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              {['Modern', 'Cottage', 'Luxury', 'Minimalist'].map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(selectedStyle === style ? '' : style)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedStyle === style
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
            {selectedStyle && (
              <div className="text-sm text-gray-600 mb-3">
                Generating {selectedStyle} style designs
              </div>
            )}
          </div>


          <div className="mt-6">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-base font-medium rounded-xl"
              onClick={generateDesigns}
              disabled={isGenerating || project.photos.length === 0}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating {selectedStyle || project.preferredStyle?.toLowerCase() || 'AI'} designs...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 mr-2" />
                  Generate {selectedStyle || project.preferredStyle || 'AI'} designs
                </>
              )}
            </Button>
            <div className="text-sm text-gray-600 leading-relaxed mt-3">
              {designs.length > 0 ? (
                <p>You have <span className="font-medium text-gray-900">{designs.length} saved design{designs.length !== 1 ? 's' : ''}</span>. Select a style and elements to generate more variations.</p>
              ) : (
                <p>AI will analyze your garden photos and create a realistic design focused only on your garden space. Select specific elements to include in the design.</p>
              )}
            </div>
            {project.photos.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                <p className="text-sm text-amber-700">Upload garden photos to enable AI design generation.</p>
              </div>
            )}
          </div>
        </div>

        {/* Generated Designs Section */}
        {designs.length > 0 && (
          <div className="mb-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Generated Design Concepts</h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">AI-generated designs based on your garden photos</p>
                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-0">
                  {designs.length} design{designs.length !== 1 ? 's' : ''} saved
                </Badge>
              </div>
            </div>
            {/* Group designs by style and sort newest first */}
            {Object.entries(
              designs
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort newest first
                .reduce((acc: any, design: any) => {
                  if (!acc[design.style]) acc[design.style] = []
                  acc[design.style].push(design)
                  return acc
                }, {})
            ).map(([style, styleDesigns]) => {
              const designs = styleDesigns as any[]
              return (
              <div key={style} className="mb-10">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {style} Style
                  <span className="text-sm font-normal text-gray-500">({designs.length} design{designs.length !== 1 ? 's' : ''})</span>
                </h3>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {designs.map((design, index) => (
                    <div key={design.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                      <div className="aspect-video relative cursor-pointer overflow-hidden" onClick={() => design.imageUrl && !design.imageUrl.includes('/mock-designs/') && setSelectedDesignImage(design)}>
                        {design.imageUrl && !design.imageUrl.includes('/mock-designs/') ? (
                          <img
                            src={design.imageUrl}
                            alt={`${design.style} Garden Design`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                parent.innerHTML =
                                  '<div class="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">' +
                                    '<div class="text-center text-gray-600">' +
                                      '<div class="font-medium">' + design.style + ' Style</div>' +
                                      '<div class="text-sm">AI Generated Design</div>' +
                                    '</div>' +
                                  '</div>'
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                            <div className="text-center text-gray-600">
                              <Image className="h-12 w-12 mx-auto mb-2 text-primary" />
                              <div className="font-medium">{design.style} Style</div>
                              <div className="text-sm">Design Concept {index + 1}</div>
                              {design.error && (
                                <div className="text-xs text-amber-600 mt-1">Processing...</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{design.title}</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteDesign(design.id)
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete design"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{design.description}</p>
                        <div className="flex justify-end items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDesign(design)}
                            className="hover:bg-primary hover:text-white transition-colors"
                          >
                            View Design & Quote
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )})}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Multi-Step Quote Builder Modal */}
      {selectedDesign && <QuoteBuilderModal />}
      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
            {selectedPhoto.base64 ? (
              <img
                src={selectedPhoto.base64}
                alt={selectedPhoto.name || 'Garden photo'}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Image className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">{selectedPhoto.name || 'Garden Photo'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Design Image Modal */}
      {selectedDesignImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedDesignImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={selectedDesignImage.imageUrl}
              alt={`${selectedDesignImage.style} Garden Design`}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {renderEditDimensionsModal()}
    </div>
  );

  // Multi-Step Quote Builder Modal Component
  function QuoteBuilderModal() {
    const [step, setStep] = useState(1)
    const [selectedFeatures, setSelectedFeatures] = useState<Array<{
      type: string
      size: number
      unit: string
      notes: string
      id: string
    }>>([])
    const [selectedProducts, setSelectedProducts] = useState<Array<{
      featureId: string
      productId: string
      productName: string
      quantity: number
      unitPrice: number
      total: number
    }>>([])

    const availableFeatures = [
      { type: 'PATIO', label: 'Patio', unit: 'SQM', basePrice: 150 },
      { type: 'TURF', label: 'Turf/Lawn', unit: 'SQM', basePrice: 45 },
      { type: 'DECKING', label: 'Decking', unit: 'SQM', basePrice: 120 },
      { type: 'PERGOLA', label: 'Pergola', unit: 'UNIT', basePrice: 1200 },
      { type: 'FENCING', label: 'Fencing', unit: 'METRE', basePrice: 85 },
      { type: 'RAISED_BED', label: 'Raised Bed', unit: 'SQM', basePrice: 95 },
      { type: 'LIGHTING', label: 'Garden Lighting', unit: 'UNIT', basePrice: 180 },
      { type: 'WATER_FEATURE', label: 'Water Feature', unit: 'UNIT', basePrice: 1500 },
      { type: 'PATHWAY', label: 'Pathway', unit: 'SQM', basePrice: 75 },
      { type: 'PLANTING_BED', label: 'Planting Bed', unit: 'SQM', basePrice: 65 },
      { type: 'GRAVEL_AREA', label: 'Gravel Area', unit: 'SQM', basePrice: 35 },
      { type: 'FIRE_PIT', label: 'Fire Pit', unit: 'UNIT', basePrice: 800 }
    ]

    const availableProducts = [
      { id: 'p1', name: 'Premium Paving Slabs', category: 'PATIO', price: 45.99, unit: 'SQM' },
      { id: 'p2', name: 'Natural Stone Blocks', category: 'PATIO', price: 65.50, unit: 'SQM' },
      { id: 'p3', name: 'Quality Turf Roll', category: 'TURF', price: 8.99, unit: 'SQM' },
      { id: 'p4', name: 'Grass Seed Premium', category: 'TURF', price: 12.50, unit: 'KG' },
      { id: 'p5', name: 'Composite Decking Boards', category: 'DECKING', price: 85.00, unit: 'SQM' },
      { id: 'p6', name: 'Hardwood Decking', category: 'DECKING', price: 120.00, unit: 'SQM' },
      { id: 'p7', name: 'LED Path Lights', category: 'LIGHTING', price: 45.99, unit: 'UNIT' },
      { id: 'p8', name: 'Solar Garden Lights', category: 'LIGHTING', price: 25.99, unit: 'UNIT' },
      { id: 'p9', name: 'Fence Panels 6ft', category: 'FENCING', price: 35.99, unit: 'UNIT' },
      { id: 'p10', name: 'Fence Posts', category: 'FENCING', price: 12.50, unit: 'UNIT' }
    ]

    const addFeature = (featureType: string) => {
      const feature = availableFeatures.find(f => f.type === featureType)
      if (feature) {
        setSelectedFeatures([...selectedFeatures, {
          type: feature.type,
          size: 1,
          unit: feature.unit,
          notes: '',
          id: `${feature.type}-${Date.now()}`
        }])
      }
    }

    const removeFeature = (id: string) => {
      setSelectedFeatures(selectedFeatures.filter(f => f.id !== id))
      setSelectedProducts(selectedProducts.filter(p => p.featureId !== id))
    }

    const updateFeature = (id: string, field: string, value: any) => {
      setSelectedFeatures(selectedFeatures.map(f =>
        f.id === id ? { ...f, [field]: value } : f
      ))
    }

    const addProduct = (featureId: string, product: any, quantity: number) => {
      setSelectedProducts([...selectedProducts, {
        featureId,
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        total: product.price * quantity
      }])
    }

    const updateProductQuantity = (featureId: string, productId: string, quantity: number) => {
      setSelectedProducts(selectedProducts.map(p =>
        p.featureId === featureId && p.productId === productId
          ? { ...p, quantity, total: p.unitPrice * quantity }
          : p
      ))
    }

    const removeProduct = (featureId: string, productId: string) => {
      setSelectedProducts(selectedProducts.filter(p =>
        !(p.featureId === featureId && p.productId === productId)
      ))
    }

    const calculateTotal = () => {
      const featuresTotal = selectedFeatures.reduce((sum, feature) => {
        const featureType = availableFeatures.find(f => f.type === feature.type)
        return sum + (featureType?.basePrice || 0) * feature.size
      }, 0)

      const productsTotal = selectedProducts.reduce((sum, product) =>
        sum + product.total, 0)

      const subtotal = featuresTotal + productsTotal
      const vat = subtotal * 0.2
      return { subtotal, vat, total: subtotal + vat }
    }

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)

    const handleGenerateQuote = async () => {
      const quoteData = {
        designId: selectedDesign?.id,
        features: selectedFeatures,
        products: selectedProducts,
        pricing: calculateTotal(),
        projectId: project?.id,
        clientName: project?.clientName,
        clientEmail: project?.clientEmail
      }

      console.log('Generating quote with data:', quoteData)
      // Here you would call your quote generation API
      setSelectedDesign(null)
      alert('Quote generated successfully!')
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="border-b p-6 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{selectedDesign?.style} Garden Design</h2>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <div className={`w-3 h-3 rounded-full mr-2 ${step === 1 ? 'bg-blue-600' : step > 1 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <span className={step === 1 ? 'font-medium' : ''}>Select Features</span>
                <div className="mx-3">→</div>
                <div className={`w-3 h-3 rounded-full mr-2 ${step === 2 ? 'bg-blue-600' : step > 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <span className={step === 2 ? 'font-medium' : ''}>Choose Products</span>
                <div className="mx-3">→</div>
                <div className={`w-3 h-3 rounded-full mr-2 ${step === 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <span className={step === 3 ? 'font-medium' : ''}>Generate Quote</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedDesign(null)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="flex">
            {/* AI Image Section */}
            <div className="w-1/3 p-6 border-r">
              <h3 className="font-semibold mb-3">AI Generated Design</h3>
              {selectedDesign?.imageUrl && (
                <img
                  src={selectedDesign.imageUrl}
                  alt={selectedDesign.style}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="text-sm text-gray-600">
                <p className="font-medium">Style: {selectedDesign?.style}</p>
                {selectedDesign?.designElements && (
                  <div className="mt-2">
                    <p className="font-medium">Detected Elements:</p>
                    <ul className="list-disc list-inside text-xs mt-1">
                      {selectedDesign.designElements.map((element: any, i: number) => (
                        <li key={i}>{element.elementType.replace('_', ' ')}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {step === 1 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Step 1: Select Garden Features</h3>

                  {/* Available Features */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {availableFeatures.map((feature) => (
                      <button
                        key={feature.type}
                        onClick={() => addFeature(feature.type)}
                        className="p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 text-left"
                      >
                        <div className="font-medium">{feature.label}</div>
                        <div className="text-sm text-gray-600">{formatCurrency(feature.basePrice)}/{feature.unit}</div>
                      </button>
                    ))}
                  </div>

                  {/* Selected Features */}
                  <div>
                    <h4 className="font-semibold mb-3">Selected Features</h4>
                    {selectedFeatures.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No features selected yet</p>
                    ) : (
                      <div className="space-y-4">
                        {selectedFeatures.map((feature) => {
                          const featureType = availableFeatures.find(f => f.type === feature.type)
                          return (
                            <div key={feature.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="font-medium">{featureType?.label}</div>
                                <button
                                  onClick={() => removeFeature(feature.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Size ({feature.unit})
                                  </label>
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={feature.size}
                                    onChange={(e) => updateFeature(feature.id, 'size', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">
                                    Estimated Cost
                                  </label>
                                  <div className="p-2 bg-gray-100 rounded">
                                    {formatCurrency((featureType?.basePrice || 0) * feature.size)}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-3">
                                <label className="block text-sm font-medium mb-1">
                                  Notes
                                </label>
                                <textarea
                                  value={feature.notes}
                                  onChange={(e) => updateFeature(feature.id, 'notes', e.target.value)}
                                  placeholder="Additional details or specifications..."
                                  className="w-full p-2 border rounded"
                                  rows={2}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Step 2: Add Products to Features</h3>

                  {selectedFeatures.map((feature) => {
                    const featureType = availableFeatures.find(f => f.type === feature.type)
                    const relatedProducts = availableProducts.filter(p => p.category === feature.type)
                    const featureProducts = selectedProducts.filter(p => p.featureId === feature.id)

                    return (
                      <div key={feature.id} className="border rounded-lg p-4 mb-4">
                        <h4 className="font-medium mb-3">
                          {featureType?.label} ({feature.size} {feature.unit})
                        </h4>

                        {/* Available Products for this feature */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {relatedProducts.map((product) => (
                            <div key={product.id} className="border rounded p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-sm">{product.name}</div>
                                  <div className="text-sm text-gray-600">
                                    {formatCurrency(product.price)}/{product.unit}
                                  </div>
                                </div>
                                <button
                                  onClick={() => addProduct(feature.id, product, 1)}
                                  className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Selected Products */}
                        {featureProducts.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Selected Products:</h5>
                            {featureProducts.map((product) => (
                              <div key={`${product.featureId}-${product.productId}`} className="flex justify-between items-center bg-gray-50 p-2 rounded mb-2">
                                <div>
                                  <div className="font-medium text-sm">{product.productName}</div>
                                  <div className="text-sm text-gray-600">{formatCurrency(product.unitPrice)} each</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    value={product.quantity}
                                    onChange={(e) => updateProductQuantity(product.featureId, product.productId, parseInt(e.target.value) || 1)}
                                    className="w-16 p-1 border rounded text-center"
                                  />
                                  <span className="text-sm font-medium">{formatCurrency(product.total)}</span>
                                  <button
                                    onClick={() => removeProduct(product.featureId, product.productId)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Step 3: Review & Generate Quote</h3>

                  <div className="space-y-4">
                    <h4 className="font-medium">Quote Summary</h4>

                    {/* Features Summary */}
                    <div>
                      <h5 className="font-medium mb-2">Garden Features:</h5>
                      {selectedFeatures.map((feature) => {
                        const featureType = availableFeatures.find(f => f.type === feature.type)
                        return (
                          <div key={feature.id} className="flex justify-between py-2 border-b">
                            <span>{featureType?.label} ({feature.size} {feature.unit})</span>
                            <span>{formatCurrency((featureType?.basePrice || 0) * feature.size)}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Products Summary */}
                    <div>
                      <h5 className="font-medium mb-2">Products:</h5>
                      {selectedProducts.map((product, index) => (
                        <div key={index} className="flex justify-between py-2 border-b">
                          <span>{product.productName} (x{product.quantity})</span>
                          <span>{formatCurrency(product.total)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between py-2">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(calculateTotal().subtotal)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>VAT (20%):</span>
                        <span>{formatCurrency(calculateTotal().vat)}</span>
                      </div>
                      <div className="flex justify-between py-2 font-bold text-lg border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(calculateTotal().total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quote Total Sidebar */}
            <div className="w-1/4 p-6 bg-gray-50 border-l">
              <h3 className="font-semibold mb-4">Quote Total</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Features:</span>
                  <span>{formatCurrency(selectedFeatures.reduce((sum, feature) => {
                    const featureType = availableFeatures.find(f => f.type === feature.type)
                    return sum + (featureType?.basePrice || 0) * feature.size
                  }, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Products:</span>
                  <span>{formatCurrency(selectedProducts.reduce((sum, product) => sum + product.total, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT (20%):</span>
                  <span>{formatCurrency(calculateTotal().vat)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal().total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-6 flex justify-between">
            <div className="flex gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDesign(null)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && selectedFeatures.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleGenerateQuote}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Generate Quote
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
