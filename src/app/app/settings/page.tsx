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
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState('')
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

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

  const handleLogoUpload = async (file: File) => {
    if (!file) return null

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        alert('Failed to upload logo: ' + (error.error || 'Unknown error'))
        return null
      }

      const result = await response.json()
      setLogoPreview(result.logoUrl)
      return result.logoUrl
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Failed to upload logo. Please try again.')
      return null
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleCreateOrganization = async () => {
    try {
      const response = await fetch('/api/organisations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: orgName,
          logoUrl: logoPreview
        }),
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
      setLogoPreview(null)
      setIsEditingOrg(false)
      alert('Organization created successfully!')
      // Refresh the organizations list
      fetchOrganizations()
    } catch (error) {
      console.error('Error creating organization:', error)
      alert('Failed to create organization. Please try again.')
    }
  }

  const handleUpdateOrganization = async () => {
    try {
      const response = await fetch('/api/organisations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingOrgId,
          name: orgName,
          logoUrl: logoPreview
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('Error updating organization:', error)
        alert('Failed to update organization: ' + (error.error || 'Unknown error'))
        return
      }

      const organization = await response.json()
      console.log('Organization updated:', organization)
      setOrgName('')
      setLogoPreview(null)
      setIsEditingOrg(false)
      setEditingOrgId(null)
      alert('Organization updated successfully!')
      // Refresh the organizations list
      fetchOrganizations()
    } catch (error) {
      console.error('Error updating organization:', error)
      alert('Failed to update organization. Please try again.')
    }
  }

  const handleEditOrganization = (org: any) => {
    setEditingOrgId(org.id)
    setOrgName(org.name)
    setLogoPreview(org.logoUrl)
    setIsEditingOrg(true)
  }

  const handleCancelEdit = () => {
    setIsEditingOrg(false)
    setEditingOrgId(null)
    setOrgName('')
    setLogoPreview(null)
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
                      <div className="flex gap-4">
                        {org.logoUrl && (
                          <div className="flex-shrink-0">
                            <img
                              src={org.logoUrl}
                              alt={`${org.name} logo`}
                              className="w-16 h-16 object-contain rounded border"
                            />
                          </div>
                        )}
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
                          {org.logoUrl && (
                            <p className="text-sm text-blue-600 mt-1">
                              ✓ Logo uploaded
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div>
                          <span className="text-xs text-gray-500">ID: {org.id.slice(-6)}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditOrganization(org)}
                        >
                          Edit
                        </Button>
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

                <div className="space-y-2">
                  <Label htmlFor="orgLogo">Company Logo (Optional)</Label>
                  <div className="space-y-3">
                    <Input
                      id="orgLogo"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          await handleLogoUpload(file)
                        }
                      }}
                      disabled={uploadingLogo}
                    />
                    {uploadingLogo && (
                      <p className="text-sm text-blue-600">Uploading logo...</p>
                    )}
                    {logoPreview && (
                      <div className="flex items-center gap-3">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-16 h-16 object-contain rounded border"
                        />
                        <div>
                          <p className="text-sm text-green-600">✓ Logo uploaded</p>
                          <button
                            type="button"
                            onClick={() => setLogoPreview(null)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove logo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={editingOrgId ? handleUpdateOrganization : handleCreateOrganization}
                    disabled={!orgName.trim()}
                  >
                    {editingOrgId ? 'Update Organization' : 'Create Organization'}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
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