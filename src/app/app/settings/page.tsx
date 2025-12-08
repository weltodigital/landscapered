'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useSession } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [isEditingOrg, setIsEditingOrg] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organisations')
      if (response.ok) {
        const orgs = await response.json()
        setOrganizations(orgs)
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganization = async () => {
    try {
      const response = await fetch('/api/organisations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: orgName }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Error creating organization:', error)
        alert('Failed to create organization: ' + (error.error || 'Unknown error'))
        return
      }

      const organization = await response.json()
      console.log('Organization created:', organization)
      setOrgName('')
      setIsEditingOrg(false)
      alert('Organization created successfully!')
      // Refresh the organizations list
      fetchOrganizations()
    } catch (error) {
      console.error('Error creating organization:', error)
      alert('Failed to create organization. Please try again.')
    }
  }

  return (
    <div className="container mx-auto py-8 px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account and organization settings.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your personal account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={session?.user?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={session?.user?.email || ''} disabled />
            </div>
            <p className="text-sm text-gray-600">
              To update your profile information, please contact support.
            </p>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>
              Set up your landscaping business organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-600">Loading organizations...</p>
            ) : organizations.length > 0 ? (
              <div className="space-y-4">
                {organizations.map((org: any) => (
                  <div key={org.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{org.name}</h3>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(org.createdAt).toLocaleDateString()}
                        </p>
                        {org.rateCards && org.rateCards.length > 0 && (
                          <p className="text-sm text-green-600 mt-1">
                            ✓ Rate cards configured ({org.rateCards[0].rateItems?.length || 0} items)
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500">ID: {org.id.slice(-6)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !isEditingOrg ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  You haven&apos;t set up an organization yet. Create one to start managing projects and rate cards.
                </p>
                <Button onClick={() => setIsEditingOrg(true)}>
                  Create Organization
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g., Green Thumb Landscaping"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleCreateOrganization} disabled={!orgName.trim()}>
                    Create Organization
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingOrg(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your account and data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Export Data</h4>
              <p className="text-sm text-gray-600 mb-3">
                Download all your project data, quotes, and settings.
              </p>
              <Button variant="outline">
                Export Data
              </Button>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2 text-red-600">Danger Zone</h4>
              <p className="text-sm text-gray-600 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="destructive">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}