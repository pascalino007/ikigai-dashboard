'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
import { ServiceProvider } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProviderForm } from '@/components/forms/provider-form'
import { ProviderEditModal } from '@/components/modals/provider-edit-modal'
import { AdminOnly } from '@/components/auth/route-guard'

// Mock data for demonstration
const shopIdToName: Record<string, string> = {
  '1': 'Downtown Beauty Studio',
  '2': 'Elite Hair & Spa',
  '3': 'Modern Cuts Barbershop',
}

const mockProviders: ServiceProvider[] = []

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>(mockProviders)
  const [loadingProviders, setLoadingProviders] = useState<boolean>(false)
  const [providersError, setProvidersError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null)

  // fetch providers from backend
  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoadingProviders(true)
      setProvidersError(null)
      try {
        const res = await fetch(`${API_BASE_URL}/proownners`)
        if (!res.ok) throw new Error(`Failed to fetch providers (${res.status})`)
        const data = await res.json()

        const mapType = (n: number | string) => {
          switch (Number(n)) {
            case 1: return 'barber'
            case 2: return 'hairdresser'
            case 3: return 'makeup_artist'
            case 4: return 'nail_technician'
            case 5: return 'esthetician'
            default: return 'barber'
          }
        }

        const arr = Array.isArray(data) ? data.map((d: any, i: number) => ({
          id: d.id || d._id || String(d._key || `prov-${Date.now()}-${i}`),
          name: `${d.firstname || ''} ${d.lastname || ''}`.trim() || (d.name || 'Unknown'),
          firstName: d.firstname || '',
          lastName: d.lastname || '',
          email: d.email || '',
          phone: d.phone_number || d.phone || '',
          idCardNumber: d.CNI_number || d.CNI_number || '',
          profilePicture: d.profileImageUrl || d.profileImageUrl || '',
          idCardPicture: Array.isArray(d.idcards) && d.idcards.length ? d.idcards[0] : undefined,
          type: mapType(d.service_type),
          experience: d.year_expe || 0,
          description: d.description || '',
          rating: d.rating || 0,
          isActive: typeof d.is_active !== 'undefined' ? Boolean(d.is_active) : true,
          createdAt: d.createdAt ? new Date(d.createdAt) : new Date(),
          updatedAt: d.updatedAt ? new Date(d.updatedAt) : new Date(),
          shopId: d.shopId || d.shop_id || ''
        })) : []

        if (mounted) setProviders(arr)
      } catch (err) {
        console.error('Failed to load providers:', err)
        if (mounted) setProvidersError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (mounted) setLoadingProviders(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || provider.type === filterType
    return matchesSearch && matchesFilter
  })

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'barber': return 'Barber'
      case 'hairdresser': return 'Hairdresser'
      case 'makeup_artist': return 'Makeup Artist'
      case 'nail_technician': return 'Nail Technician'
      case 'esthetician': return 'Esthetician'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'barber': return 'bg-blue-100 text-blue-800'
      case 'hairdresser': return 'bg-purple-100 text-purple-800'
      case 'makeup_artist': return 'bg-pink-100 text-pink-800'
      case 'nail_technician': return 'bg-green-100 text-green-800'
      case 'esthetician': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800 dark:text-gray-200'
    }
  }

  const handleAddProvider = async (formData: any) => {
    // Simulate API call
    console.log('Adding new provider:', formData)
    
    // Create new provider object
    const newProvider: ServiceProvider = {
      id: Date.now().toString(),
      name: `${formData.firstName} ${formData.lastName}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phoneNumber,
      idCardNumber: formData.idCardNumber,
      profilePicture: formData.profilePicture ? URL.createObjectURL(formData.profilePicture) : undefined,
      idCardPicture: formData.idCardPicture ? URL.createObjectURL(formData.idCardPicture) : undefined,
      type: formData.type,
      experience: formData.experience,
      description: formData.description,
      rating: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Add to providers list
    setProviders(prev => [newProvider, ...prev])
    
    // Show success message
    console.log('Provider created successfully!')
  }

  const handleUpdateProvider = async (providerId: string, data: any) => {
    setProviders(prev =>
      prev.map(p =>
        p.id === providerId
          ? {
              ...p,
              firstName: data.firstName,
              lastName: data.lastName,
              name: `${data.firstName} ${data.lastName}`,
              email: data.email,
              phone: data.phoneNumber,
              idCardNumber: data.idCardNumber,
              type: data.type,
              experience: data.experience,
              description: data.description,
              isActive: data.isActive,
              profilePicture: data.profilePicture || p.profilePicture,
              idCardPicture: data.idCardPicture || p.idCardPicture,
              updatedAt: new Date()
            }
          : p
      )
    )
    setEditingProvider(null)
  }

  return (
    <AdminOnly>
      <DashboardLayout>
      <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Service Providers</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage barbers, hairdressers, and beauty professionals</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-800 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search providers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="barber">Barbers</option>
              <option value="hairdresser">Hairdressers</option>
              <option value="makeup_artist">Makeup Artists</option>
              <option value="nail_technician">Nail Technicians</option>
              <option value="esthetician">Estheticians</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {loadingProviders && (
        <div className="mb-4 text-sm text-gray-600">Loading providers...</div>
      )}
      {providersError && (
        <div className="mb-4 text-sm text-red-600">Error loading providers: {providersError}</div>
      )}

      {/* Providers Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                 Rating 
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Owner of Shop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProviders.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden">
                        {provider.profilePicture ? (
                          <img 
                            src={provider.profilePicture} 
                            alt={provider.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-white">
                            {provider.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{provider.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{provider.email}</div>
                        {provider.idCardNumber && (
                          <div className="text-xs text-gray-400">ID: {provider.idCardNumber}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(provider.type)}`}>
                      {getTypeLabel(provider.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {provider.experience} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{provider.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {provider.shopId ? (
                      <span className="text-gray-800 dark:text-gray-200">{shopIdToName[provider.shopId] || provider.shopId}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      provider.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {provider.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProvider(provider)}
                        title="Edit provider"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Provider Form */}
      <ProviderForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProvider}
      />

      {/* Edit Provider Modal */}
      <ProviderEditModal
        isOpen={!!editingProvider}
        onClose={() => setEditingProvider(null)}
        provider={editingProvider}
        onSubmit={handleUpdateProvider}
      />
      </div>
    </DashboardLayout>
    </AdminOnly>
  )
}
