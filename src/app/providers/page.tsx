'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
import { ServiceProvider } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ProviderForm } from '@/components/forms/provider-form'

// Mock data for demonstration
const shopIdToName: Record<string, string> = {
  '1': 'Downtown Beauty Studio',
  '2': 'Elite Hair & Spa',
  '3': 'Modern Cuts Barbershop',
}

const mockProviders: ServiceProvider[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    type: 'barber',
    experience: 5,
    rating: 4.8,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    shopId: '1'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    phone: '+1 (555) 234-5678',
    type: 'hairdresser',
    experience: 8,
    rating: 4.9,
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    shopId: '2'
  },
  {
    id: '3',
    name: 'Lisa Brown',
    email: 'lisa@example.com',
    phone: '+1 (555) 345-6789',
    type: 'makeup_artist',
    experience: 3,
    rating: 4.7,
    isActive: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    shopId: '3'
  }
]

export default function ProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>(mockProviders)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

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
      default: return 'bg-gray-100 text-gray-800'
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

  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
            <p className="text-gray-600 mt-2">Manage barbers, hairdressers, and beauty professionals</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
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

      {/* Providers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner of
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
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
                        <div className="text-sm font-medium text-gray-900">{provider.name}</div>
                        <div className="text-sm text-gray-500">{provider.email}</div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {provider.experience} years
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1">{provider.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {provider.shopId ? (
                      <span className="text-gray-800">{shopIdToName[provider.shopId] || provider.shopId}</span>
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
                      <Button variant="ghost" size="sm">
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
      </div>
    </DashboardLayout>
  )
}
