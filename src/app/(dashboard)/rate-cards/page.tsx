'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface RateItem {
  id: string
  elementType: string
  unit: string
  baseMaterialCost: number
  baseLabourHoursPerUnit: number
}

interface RateCard {
  id: string
  labourRatePerHour: number
  defaultProfitMarginPercent: number
  wasteDisposalRate: number
  travelCostPerMile: number
  rateItems: RateItem[]
}

export default function RateCardsPage() {
  const [rateCard, setRateCard] = useState<RateCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [isEditingGeneral, setIsEditingGeneral] = useState(false)

  // Form states
  const [labourRate, setLabourRate] = useState(0)
  const [profitMargin, setProfitMargin] = useState(0)
  const [wasteDisposal, setWasteDisposal] = useState(0)
  const [travelCost, setTravelCost] = useState(0)

  // Item form states
  const [editItemData, setEditItemData] = useState({
    materialCost: 0,
    labourHours: 0
  })

  useEffect(() => {
    fetchRateCard()
  }, [])

  const fetchRateCard = async () => {
    try {
      const response = await fetch('/api/rate-cards')
      if (response.ok) {
        const data = await response.json()
        setRateCard(data)
        if (data) {
          setLabourRate(data.labourRatePerHour)
          setProfitMargin(data.defaultProfitMarginPercent)
          setWasteDisposal(data.wasteDisposalRate)
          setTravelCost(data.travelCostPerMile)
        }
      }
    } catch (error) {
      console.error('Error fetching rate card:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateGeneral = async () => {
    try {
      const response = await fetch('/api/rate-cards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          labourRatePerHour: labourRate,
          defaultProfitMarginPercent: profitMargin,
          wasteDisposalRate: wasteDisposal,
          travelCostPerMile: travelCost,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert('Failed to update rates: ' + (error.error || 'Unknown error'))
        return
      }

      setIsEditingGeneral(false)
      alert('General rates updated successfully!')
      fetchRateCard()
    } catch (error) {
      console.error('Error updating general rates:', error)
      alert('Failed to update rates. Please try again.')
    }
  }

  const handleEditItem = (item: RateItem) => {
    setEditingItem(item.id)
    setEditItemData({
      materialCost: item.baseMaterialCost,
      labourHours: item.baseLabourHoursPerUnit
    })
  }

  const handleUpdateItem = async (itemId: string) => {
    try {
      const response = await fetch('/api/rate-cards/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          baseMaterialCost: editItemData.materialCost,
          baseLabourHoursPerUnit: editItemData.labourHours,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert('Failed to update item: ' + (error.error || 'Unknown error'))
        return
      }

      setEditingItem(null)
      alert('Rate item updated successfully!')
      fetchRateCard()
    } catch (error) {
      console.error('Error updating rate item:', error)
      alert('Failed to update item. Please try again.')
    }
  }

  const formatElementType = (elementType: string) => {
    return elementType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatUnit = (unit: string) => {
    switch (unit) {
      case 'SQM': return 'm²'
      case 'METRE': return 'm'
      case 'UNIT': return 'unit'
      default: return unit.toLowerCase()
    }
  }

  const calculateTotalCost = (item: RateItem) => {
    const labourCost = item.baseLabourHoursPerUnit * (rateCard?.labourRatePerHour || 0)
    return item.baseMaterialCost + labourCost
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-6">
        <div className="text-center">
          <p className="text-gray-600">Loading rate card...</p>
        </div>
      </div>
    )
  }

  if (!rateCard) {
    return (
      <div className="container mx-auto py-8 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Rate Card Found</h1>
          <p className="text-gray-600 mb-4">You need to create an organization first to access rate cards.</p>
          <Button onClick={() => window.location.href = '/app/settings'}>
            Go to Settings
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rate Cards</h1>
        <p className="text-gray-600">
          Manage your pricing structure for garden design elements and services.
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* General Rates */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>General Rates</CardTitle>
                <CardDescription>
                  Base rates applied across all projects and quotes.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditingGeneral(!isEditingGeneral)}
              >
                {isEditingGeneral ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditingGeneral ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="labourRate">Labour Rate (£/hour)</Label>
                  <Input
                    id="labourRate"
                    type="number"
                    step="0.01"
                    value={labourRate}
                    onChange={(e) => setLabourRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                  <Input
                    id="profitMargin"
                    type="number"
                    step="0.1"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wasteDisposal">Waste Disposal Rate (£)</Label>
                  <Input
                    id="wasteDisposal"
                    type="number"
                    step="0.01"
                    value={wasteDisposal}
                    onChange={(e) => setWasteDisposal(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="travelCost">Travel Cost (£/mile)</Label>
                  <Input
                    id="travelCost"
                    type="number"
                    step="0.01"
                    value={travelCost}
                    onChange={(e) => setTravelCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={handleUpdateGeneral}>
                    Update General Rates
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Labour Rate</p>
                  <p className="font-medium">£{rateCard.labourRatePerHour}/hour</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className="font-medium">{rateCard.defaultProfitMarginPercent}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Waste Disposal</p>
                  <p className="font-medium">£{rateCard.wasteDisposalRate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Travel Cost</p>
                  <p className="font-medium">£{rateCard.travelCostPerMile}/mile</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rate Items */}
        <Card>
          <CardHeader>
            <CardTitle>Element Pricing</CardTitle>
            <CardDescription>
              Individual pricing for different garden design elements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rateCard.rateItems.map((item, index) => (
                <div key={item.id}>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{formatElementType(item.elementType)}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Material Cost:</span> £{item.baseMaterialCost}/{formatUnit(item.unit)}
                        </div>
                        <div>
                          <span className="font-medium">Labour Hours:</span> {item.baseLabourHoursPerUnit}h/{formatUnit(item.unit)}
                        </div>
                        <div>
                          <span className="font-medium">Labour Cost:</span> £{(item.baseLabourHoursPerUnit * rateCard.labourRatePerHour).toFixed(2)}/{formatUnit(item.unit)}
                        </div>
                        <div>
                          <span className="font-medium">Total Cost:</span> £{calculateTotalCost(item).toFixed(2)}/{formatUnit(item.unit)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                    >
                      Edit
                    </Button>
                  </div>

                  {editingItem === item.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-3">Edit {formatElementType(item.elementType)}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Material Cost (£/{formatUnit(item.unit)})</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editItemData.materialCost}
                            onChange={(e) => setEditItemData({
                              ...editItemData,
                              materialCost: parseFloat(e.target.value) || 0
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Labour Hours (hours/{formatUnit(item.unit)})</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={editItemData.labourHours}
                            onChange={(e) => setEditItemData({
                              ...editItemData,
                              labourHours: parseFloat(e.target.value) || 0
                            })}
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button onClick={() => handleUpdateItem(item.id)}>
                          Update Item
                        </Button>
                        <Button variant="outline" onClick={() => setEditingItem(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {index < rateCard.rateItems.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}