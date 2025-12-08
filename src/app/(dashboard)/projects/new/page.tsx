'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Upload, X, Check, Ruler, Search, User, Plus } from 'lucide-react'
import Link from 'next/link'
import { Customer } from '@/types/crm'

export default function NewProjectPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerForm, setShowCustomerForm] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    clientCity: '',
    clientPostcode: '',
    description: '',
    preferredStyle: '',
    gardenLength: '',
    gardenWidth: '',
    unit: 'metres', // 'metres' or 'feet'
  })
  const router = useRouter()

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers()
  }, [])

  // Search customers when search term changes
  useEffect(() => {
    if (customerSearch.trim()) {
      searchCustomers(customerSearch)
    } else {
      fetchCustomers()
    }
  }, [customerSearch])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const searchCustomers = async (query: string) => {
    try {
      const response = await fetch(`/api/customers?search=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error searching customers:', error)
    }
  }

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData(prev => ({
      ...prev,
      clientName: customer.name,
      clientEmail: customer.email,
      clientPhone: customer.phone || '',
      clientAddress: customer.address || '',
      clientCity: customer.city || '',
      clientPostcode: customer.postcode || '',
    }))
    setCustomerSearch('')
    setShowCustomerForm(false)
  }

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null)
    setFormData(prev => ({
      ...prev,
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      clientCity: '',
      clientPostcode: '',
    }))
    setShowCustomerForm(true)
  }

  // Calculate garden area
  const calculateArea = () => {
    const length = parseFloat(formData.gardenLength)
    const width = parseFloat(formData.gardenWidth)
    if (isNaN(length) || isNaN(width)) return 0
    return length * width
  }

  // Convert area to other unit for display
  const getAreaInOtherUnit = () => {
    const area = calculateArea()
    if (area === 0) return 0
    return formData.unit === 'metres'
      ? (area * 10.764).toFixed(1) // sq m to sq ft
      : (area * 0.0929).toFixed(1)  // sq ft to sq m
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const validFiles = Array.from(files).filter(file => {
      return file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit
    })

    setPhotos(prev => [...prev, ...validFiles].slice(0, 3)) // Max 3 photos
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // First, create or update the customer if not already selected
      let customerId = selectedCustomer?.id

      if (!selectedCustomer) {
        // Create new customer
        const customerResponse = await fetch('/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.clientName,
            email: formData.clientEmail,
            phone: formData.clientPhone,
            address: formData.clientAddress,
            city: formData.clientCity,
            postcode: formData.clientPostcode,
          }),
        })

        if (!customerResponse.ok) {
          throw new Error('Failed to create customer')
        }

        const customer = await customerResponse.json()
        customerId = customer.id
      }

      // Create project with customer information
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('clientName', formData.clientName)
      formDataToSend.append('clientEmail', formData.clientEmail)
      formDataToSend.append('clientPhone', formData.clientPhone)
      formDataToSend.append('clientAddress', formData.clientAddress)
      formDataToSend.append('clientCity', formData.clientCity)
      formDataToSend.append('clientPostcode', formData.clientPostcode)
      formDataToSend.append('customerId', customerId || '')
      formDataToSend.append('description', formData.description)
      formDataToSend.append('preferredStyle', formData.preferredStyle)
      formDataToSend.append('gardenLength', formData.gardenLength)
      formDataToSend.append('gardenWidth', formData.gardenWidth)
      formDataToSend.append('unit', formData.unit)

      photos.forEach((photo, index) => {
        formDataToSend.append(`photo${index}`, photo)
      })

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const project = await response.json()
      router.push(`/app/projects/${project.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <Link href="/app">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
        <p className="text-gray-600">
          Start a new garden design project for your client.
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Garden Photos</CardTitle>
            <CardDescription>
              Upload 1-3 photos of the current garden space. AI will analyze these to generate 3 design variations in your preferred style.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Garden Photos
              </h3>
              <p className="text-gray-600 mb-4">
                Drag and drop your photos here, or click to browse
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="photo-upload"
                disabled={photos.length >= 3}
              />
              <div className="flex justify-center">
                <Label htmlFor="photo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    disabled={photos.length >= 3}
                    asChild
                  >
                    <span>Choose Files</span>
                  </Button>
                </Label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Maximum 3 photos, 10MB each. JPG, PNG, or WebP format.
              </p>
            </div>

            {/* Photo Preview */}
            {photos.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Selected Photos ({photos.length}/3)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Garden photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                        {photo.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Enter the basic information for your new project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Johnson Family Garden Redesign"
                />
              </div>

              {/* Customer Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Customer Information</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCustomerForm(!showCustomerForm)}
                  >
                    {showCustomerForm ? (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search Existing
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        New Customer
                      </>
                    )}
                  </Button>
                </div>

                {selectedCustomer && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-primary mr-2" />
                        <div>
                          <div className="font-medium text-primary">{selectedCustomer.name}</div>
                          <div className="text-sm text-primary/80">{selectedCustomer.email}</div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSelectedCustomer}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {!showCustomerForm && !selectedCustomer && (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search for existing customers..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {customerSearch && customers.length > 0 && (
                      <div className="border rounded-lg max-h-48 overflow-y-auto">
                        {customers.map((customer) => (
                          <div
                            key={customer.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => selectCustomer(customer)}
                          >
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-600">{customer.email}</div>
                            {customer.phone && (
                              <div className="text-sm text-gray-500">{customer.phone}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {customerSearch && customers.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No customers found.
                        <Button
                          type="button"
                          variant="link"
                          className="pl-1"
                          onClick={() => setShowCustomerForm(true)}
                        >
                          Create new customer
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {(showCustomerForm || selectedCustomer) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Name *</Label>
                      <Input
                        id="clientName"
                        name="clientName"
                        type="text"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Sarah Johnson"
                        disabled={!!selectedCustomer}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">Email *</Label>
                      <Input
                        id="clientEmail"
                        name="clientEmail"
                        type="email"
                        value={formData.clientEmail}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., sarah.johnson@email.com"
                        disabled={!!selectedCustomer}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">Phone</Label>
                      <Input
                        id="clientPhone"
                        name="clientPhone"
                        type="tel"
                        value={formData.clientPhone}
                        onChange={handleInputChange}
                        placeholder="e.g., +44 123 456 7890"
                        disabled={!!selectedCustomer}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientPostcode">Postcode</Label>
                      <Input
                        id="clientPostcode"
                        name="clientPostcode"
                        type="text"
                        value={formData.clientPostcode}
                        onChange={handleInputChange}
                        placeholder="e.g., SW1A 1AA"
                        disabled={!!selectedCustomer}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientAddress">Address</Label>
                      <Input
                        id="clientAddress"
                        name="clientAddress"
                        type="text"
                        value={formData.clientAddress}
                        onChange={handleInputChange}
                        placeholder="e.g., 123 Garden Lane"
                        disabled={!!selectedCustomer}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientCity">City</Label>
                      <Input
                        id="clientCity"
                        name="clientCity"
                        type="text"
                        value={formData.clientCity}
                        onChange={handleInputChange}
                        placeholder="e.g., London"
                        disabled={!!selectedCustomer}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-gray-500" />
                  <Label>Garden Dimensions</Label>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="gardenLength">Length</Label>
                    <Input
                      id="gardenLength"
                      name="gardenLength"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.gardenLength}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gardenWidth">Width</Label>
                    <Input
                      id="gardenWidth"
                      name="gardenWidth"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.gardenWidth}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metres">Metres</SelectItem>
                        <SelectItem value="feet">Feet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(formData.gardenLength && formData.gardenWidth) && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total Garden Area</div>
                    <div className="font-medium">
                      {calculateArea().toFixed(1)} {formData.unit === 'metres' ? 'sq m' : 'sq ft'}
                      <span className="text-gray-500 text-sm ml-2">
                        ({getAreaInOtherUnit()} {formData.unit === 'metres' ? 'sq ft' : 'sq m'})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the project goals..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Garden Style</Label>
                <p className="text-sm text-gray-600">Choose a style that will be prioritized for AI design generation</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'Modern', label: 'Modern', description: 'Clean lines, minimal plantings' },
                    { key: 'Cottage', label: 'Cottage', description: 'Informal, abundant flowers' },
                    { key: 'Luxury', label: 'Luxury', description: 'Premium materials, sophisticated' },
                    { key: 'Minimalist', label: 'Minimalist', description: 'Simple, uncluttered design' },
                  ].map((style) => (
                    <div
                      key={style.key}
                      className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all hover:border-primary/50 ${
                        formData.preferredStyle === style.key
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, preferredStyle: style.key }))}
                    >
                      {formData.preferredStyle === style.key && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      <h4 className="font-semibold text-gray-900 mb-1">{style.label}</h4>
                      <p className="text-xs text-gray-600">{style.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isLoading || photos.length === 0 || !formData.preferredStyle}
                  className="flex-1"
                >
                  {isLoading ? 'Creating...' : 'Create Project'}
                </Button>
                <Link href="/app">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
// Force dynamic rendering
export const dynamic = 'force-dynamic'
