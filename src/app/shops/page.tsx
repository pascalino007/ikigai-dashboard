'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Search, MapPin, Phone, Mail, Edit, Trash2, Eye, Scissors, Filter } from 'lucide-react'
import { Shop } from '@/types'
import { ShopForm } from '@/components/forms/shop-form'
import { ShopViewModal } from '@/components/modals/shop-view-modal'
import { ShopEditModal } from '@/components/modals/shop-edit-modal'
import { DashboardLayout } from '@/components/dashboard-layout'
import { shopApi, handleApiError, handleApiSuccess } from '@/services/api'
import { RouteGuard } from '@/components/auth/route-guard'

// Mock data for demonstration
const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Downtown Beauty Studio',
    address: '123 Main Street',
    country: 'USA',
    city: 'New York',
    area: 'Manhattan',
    phone: '+1 (555) 123-4567',
    email: 'info@downtownbeauty.com',
    description: 'Full-service beauty salon in the heart of downtown',
    isActive: true,
    ownerId: 'owner1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    services: []
  },
  {
    id: '2',
    name: 'Elite Hair & Spa',
    address: '456 Oak Avenue',
    country: 'USA',
    city: 'Los Angeles',
    area: 'Beverly Hills',
    phone: '+1 (555) 234-5678',
    email: 'contact@elitehairspa.com',
    description: 'Luxury hair salon and spa services',
    isActive: true,
    ownerId: 'owner2',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    services: []
  },
  {
    id: '3',
    name: 'Modern Cuts Barbershop',
    address: '789 Pine Street',
    country: 'USA',
    city: 'Chicago',
    area: 'Downtown',
    phone: '+1 (555) 345-6789',
    email: 'hello@moderncuts.com',
    description: 'Contemporary barbershop with traditional techniques',
    isActive: false,
    ownerId: 'owner3',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    services: []
  },
  {
    id: '4',
    name: 'Paris Beauty Center',
    address: '12 Rue de la Paix',
    country: 'France',
    city: 'Paris',
    area: '1st Arrondissement',
    phone: '+33 1 42 60 30 30',
    email: 'contact@parisbeauty.fr',
    description: 'Elegant beauty center in the heart of Paris',
    isActive: true,
    ownerId: 'owner4',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    services: []
  },
  {
    id: '5',
    name: 'London Hair Studio',
    address: '45 Oxford Street',
    country: 'UK',
    city: 'London',
    area: 'Westminster',
    phone: '+44 20 7946 0958',
    email: 'info@londonhair.co.uk',
    description: 'Modern hair studio in central London',
    isActive: true,
    ownerId: 'owner5',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05'),
    services: []
  }
]

export default function ShopsPage() {
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>(mockShops)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Get unique values for filters
  const categories = Array.from(new Set(shops.map(shop => shop.category).filter(Boolean)))
  const countries = Array.from(new Set(shops.map(shop => shop.country)))
  const cities = selectedCountry 
    ? Array.from(new Set(shops.filter(shop => shop.country === selectedCountry).map(shop => shop.city)))
    : Array.from(new Set(shops.map(shop => shop.city)))
  const areas = selectedCity
    ? Array.from(new Set(shops.filter(shop => shop.city === selectedCity).map(shop => shop.area)))
    : Array.from(new Set(shops.map(shop => shop.area)))

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || shop.category === selectedCategory
    const matchesCountry = !selectedCountry || shop.country === selectedCountry
    const matchesCity = !selectedCity || shop.city === selectedCity
    const matchesArea = !selectedArea || shop.area === selectedArea
    
    return matchesSearch && matchesCategory && matchesCountry && matchesCity && matchesArea
  })

  // Load shops from API on component mount
  useEffect(() => {
    loadShops()
  }, [])

  const loadShops = async () => {
    setIsLoading(true)
    try {
      const response = await shopApi.getAll({
        search: searchTerm,
        category: selectedCategory,
        country: selectedCountry,
        city: selectedCity,
        area: selectedArea
      })
      setShops(response)
    } catch (error) {
      console.error('Error loading shops:', error)
      // Fallback to mock data if API fails
      setShops(mockShops)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddShop = async (data: any) => {
    setIsLoading(true)
    try {
      const response = await shopApi.create(data)
      setShops(prev => [response, ...prev])
      setShowAddModal(false)
    } catch (error) {
      console.error('Error creating shop:', error)
      // Fallback to local state update
      const newShop: Shop = {
        id: Date.now().toString(),
        name: data.name,
        category: data.category,
        tags: data.tags,
        profileImage: data.profileImage ? URL.createObjectURL(data.profileImage) : undefined,
        images: (data.images || []).map((f: File) => URL.createObjectURL(f)),
        address: data.address,
        country: data.country || 'USA',
        city: data.city,
        area: data.area || data.city,
        phone: data.phone,
        email: data.email || '',
        description: data.description,
        isActive: true,
        ownerId: 'owner-new',
        openingHours: data.openingHours,
        createdAt: new Date(),
        updatedAt: new Date(),
        services: []
      }
      setShops(prev => [newShop, ...prev])
      setShowAddModal(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewShop = (shop: Shop) => {
    setSelectedShop(shop)
    setShowViewModal(true)
  }

  const handleEditShop = (shop: Shop) => {
    setSelectedShop(shop)
    setShowEditModal(true)
  }

  const handleUpdateShop = async (shopId: string, data: any) => {
    setIsLoading(true)
    try {
      const response = await shopApi.update(shopId, data)
      setShops(prev => prev.map(shop => shop.id === shopId ? response : shop))
      setShowEditModal(false)
      setSelectedShop(null)
    } catch (error) {
      console.error('Error updating shop:', error)
      // Fallback to local state update
      setShops(prev => prev.map(shop => 
        shop.id === shopId 
          ? { ...shop, ...data, updatedAt: new Date() }
          : shop
      ))
      setShowEditModal(false)
      setSelectedShop(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteShop = async (shopId: string) => {
    setIsLoading(true)
    try {
      await shopApi.delete(shopId)
      setShops(prev => prev.filter(shop => shop.id !== shopId))
      setShowViewModal(false)
      setSelectedShop(null)
    } catch (error) {
      console.error('Error deleting shop:', error)
      // Fallback to local state update
      setShops(prev => prev.filter(shop => shop.id !== shopId))
      setShowViewModal(false)
      setSelectedShop(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageServices = (shopId: string) => {
    router.push(`/shops/${shopId}/services`)
  }

  const handleViewShopDetails = (shopId: string) => {
    router.push(`/shops/${shopId}`)
  }

  return (
    <RouteGuard allowedRoles={['admin', 'manager', 'enroller']}>
      <DashboardLayout>
      <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shops</h1>
            <p className="text-gray-600 mt-2">Manage beauty shops and salons</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shop
          </Button>
        </div>
      </div>

      {/* Search and Location Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value)
                  setSelectedCity('') // Reset city when country changes
                  setSelectedArea('') // Reset area when country changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              >
                <option value="">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value)
                  setSelectedArea('') // Reset area when city changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              >
                <option value="">All Areas</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategory('')
                  setSelectedCountry('')
                  setSelectedCity('')
                  setSelectedArea('')
                  setSearchTerm('')
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
      

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShops.map((shop) => (
          <div key={shop.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{shop.description}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  shop.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {shop.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {shop.address}, {shop.area}, {shop.city}, {shop.country}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {shop.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {shop.email}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Created {shop.createdAt.toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleManageServices(shop.id)}
                    className="text-ikigai-primary border-ikigai-primary hover:bg-ikigai-primary hover:text-white"
                  >
                    <Scissors className="h-4 w-4 mr-1" />
                    Services
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewShopDetails(shop.id)}
                    title="View Shop Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditShop(shop)}
                    title="Edit Shop"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this shop?')) {
                        handleDeleteShop(shop.id)
                      }
                    }}
                    title="Delete Shop"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <ShopForm isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddShop} />
      
      <ShopViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedShop(null)
        }}
        shop={selectedShop}
        onEdit={handleEditShop}
        onDelete={handleDeleteShop}
      />
      
      <ShopEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedShop(null)
        }}
        shop={selectedShop}
        onSubmit={handleUpdateShop}
      />
      </div>
    </DashboardLayout>
    </RouteGuard>
  )
}
