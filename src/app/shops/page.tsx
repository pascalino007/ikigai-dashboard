'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Search, MapPin, Phone, Mail, Edit, Trash2, Eye, Scissors, Filter, List, Grid } from 'lucide-react'
import { Shop } from '@/types'
import { ShopForm } from '@/components/forms/shop-form'
import { ShopViewModal } from '@/components/modals/shop-view-modal'
import { ShopEditModal } from '@/components/modals/shop-edit-modal'
import { DashboardLayout } from '@/components/dashboard-layout'
import { shopApi, handleApiError, handleApiSuccess } from '@/services/api'
import { RouteGuard } from '@/components/auth/route-guard'


export default function ShopsPage() {
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>([])
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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
    const response = await fetch(`http://localhost:4040/shops`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch shops: ${response.status}`)
    }

    const data = await response.json()
    setShops(data)
  } catch (error) {
    console.error('Error loading shops:', error)
    // Fallback to mock data if API fails
    setShops([])
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Shops</h1>
            <p className="text-gray-600 mt-2">Manage beauty shops and salons</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shop
          </Button>
        </div>
      </div>

      {/* Search and Location Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
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
                <option value="Togo">Togo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value)
                  setSelectedArea('') // Reset area when city changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              >
                <option value="">All Cities</option>
                 <option value="">Lome</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Arrondissement</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              >
                <option value="">All Areas</option>
                <option value="">1</option>
                <option value="">2</option>
                <option value="">3</option>
                <option value="">4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              >
                <option value="">All Areas</option>
                <option value="">Adidogome</option>
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
      

      {/* View Mode Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`${
              viewMode === 'grid'
                ? 'bg-ikigai-primary text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            <Grid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={`${
              viewMode === 'list'
                ? 'bg-ikigai-primary text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      {/* Shops Display */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredShops.map((shop) => (
         <div
  key={shop.id}
  className={`bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden ${
    viewMode === 'grid' ? 'flex flex-col md:flex-row' : 'flex flex-row'
  }`}
>
  {/* Left: Image Section */}
  <div className={`${
    viewMode === 'grid' ? 'md:w-1/2 w-full h-48 md:h-auto' : 'w-24 h-24 flex-shrink-0'
  } relative`}>
    <img
      src={`https://myikigai.sfo2.digitaloceanspaces.com/uploads/`+shop.profileImageUrl}
      alt={shop.name}
      className="object-cover w-full h-full"
    />
    <span
      className={`absolute ${
        viewMode === 'grid' ? 'top-3 right-3' : 'top-1 right-1'
      } inline-flex items-center ${
        viewMode === 'grid' ? 'px-2.5 py-0.5' : 'px-1.5 py-0.5'
      } rounded-full text-xs font-medium shadow-md ${
        shop.isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {shop.isActive ? 'Active' : 'Inactive'}
    </span>
  </div>

  {/* Right: Content Section */}
  <div className={`${
    viewMode === 'grid' ? 'md:w-2/3 w-full p-6' : 'flex-1 p-4'
  } flex flex-col justify-between`}>
    <div>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {shop.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{shop.description}</p>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
          {shop.address}, {shop.area}, {shop.city}, {shop.country}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-4 w-4 mr-2 text-gray-500" />
          {shop.phone}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="h-4 w-4 mr-2 text-gray-500" />
          {shop.email}
        </div>
      </div>
    </div>

    <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
      <div className="text-xs text-gray-500">
        Created on {shop.createdAt.toString().slice(0, 10)}
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
