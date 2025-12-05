'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Save, X } from 'lucide-react'

// Mock data - in real app this would come from API
const mockRateCard = {
  labourRatePerHour: 45.00,
  defaultProfitMarginPercent: 20.0,
  wasteDisposalRate: 150.00,
  travelCostPerMile: 0.50,
}

const mockRateItems = [
  { id: '1', elementType: 'PATIO', unit: 'SQM', baseMaterialCost: 50, baseLabourHoursPerUnit: 2 },
  { id: '2', elementType: 'TURF', unit: 'SQM', baseMaterialCost: 15, baseLabourHoursPerUnit: 0.5 },
  { id: '3', elementType: 'PERGOLA', unit: 'UNIT', baseMaterialCost: 800, baseLabourHoursPerUnit: 8 },
  { id: '4', elementType: 'LIGHTING', unit: 'UNIT', baseMaterialCost: 120, baseLabourHoursPerUnit: 2 },
]

export default function RateCardPage() {
  const [isEditingGeneral, setIsEditingGeneral] = useState(false)
  const [rateCard, setRateCard] = useState(mockRateCard)
  const [rateItems, setRateItems] = useState(mockRateItems)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const elementTypes = [
    'PATIO', 'TURF', 'DECKING', 'PERGOLA', 'FENCING', 'RAISED_BED',
    'LIGHTING', 'WATER_FEATURE', 'PATHWAY', 'PLANTING_BED', 'GRAVEL_AREA', 'FIRE_PIT', 'OTHER'
  ]

  const units = ['SQM', 'METRE', 'UNIT']

  const handleSaveGeneral = () => {
    // TODO: Save to API
    setIsEditingGeneral(false)
  }

  const handleSaveItem = (itemId: string) => {
    // TODO: Save to API
    setEditingItem(null)
  }

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Rate Card</h1>
        <p className="text-gray-600">
          Configure your pricing structure for materials, labour, and overhead costs.
        </p>
      </div>

      {/* General Settings */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Set your basic rates and profit margins.
            </CardDescription>
          </div>
          {!isEditingGeneral ? (
            <Button variant="outline" onClick={() => setIsEditingGeneral(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSaveGeneral}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditingGeneral(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="labourRate">Labour Rate (per hour)</Label>
              <Input
                id="labourRate"
                type="number"
                value={rateCard.labourRatePerHour}
                onChange={(e) => setRateCard({
                  ...rateCard,
                  labourRatePerHour: parseFloat(e.target.value) || 0
                })}
                disabled={!isEditingGeneral}
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profitMargin">Profit Margin (%)</Label>
              <Input
                id="profitMargin"
                type="number"
                value={rateCard.defaultProfitMarginPercent}
                onChange={(e) => setRateCard({
                  ...rateCard,
                  defaultProfitMarginPercent: parseFloat(e.target.value) || 0
                })}
                disabled={!isEditingGeneral}
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wasteDisposal">Waste Disposal (fixed rate)</Label>
              <Input
                id="wasteDisposal"
                type="number"
                value={rateCard.wasteDisposalRate}
                onChange={(e) => setRateCard({
                  ...rateCard,
                  wasteDisposalRate: parseFloat(e.target.value) || 0
                })}
                disabled={!isEditingGeneral}
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="travelCost">Travel Cost (per mile)</Label>
              <Input
                id="travelCost"
                type="number"
                value={rateCard.travelCostPerMile}
                onChange={(e) => setRateCard({
                  ...rateCard,
                  travelCostPerMile: parseFloat(e.target.value) || 0
                })}
                disabled={!isEditingGeneral}
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Element Pricing</CardTitle>
            <CardDescription>
              Set material costs and labour hours for each design element.
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Element
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Element Type</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Material Cost</TableHead>
                <TableHead>Labour Hours/Unit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rateItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {editingItem === item.id ? (
                      <Select defaultValue={item.elementType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {elementTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      item.elementType.replace('_', ' ')
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItem === item.id ? (
                      <Select defaultValue={item.unit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      item.unit
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItem === item.id ? (
                      <Input
                        type="number"
                        defaultValue={item.baseMaterialCost}
                        step="0.01"
                        min="0"
                      />
                    ) : (
                      `£${item.baseMaterialCost.toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItem === item.id ? (
                      <Input
                        type="number"
                        defaultValue={item.baseLabourHoursPerUnit}
                        step="0.1"
                        min="0"
                      />
                    ) : (
                      `${item.baseLabourHoursPerUnit}h`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingItem === item.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveItem(item.id)}>
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingItem(item.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}