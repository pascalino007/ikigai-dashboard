'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Search, MapPin, Phone, Mail, Edit, Trash2, Eye, Scissors, Filter, List, Grid, Calendar, Tag, Star, ToggleLeft, ToggleRight } from 'lucide-react'
import { Shop } from '@/types'
import { ShopForm } from '@/components/forms/shop-form'
import { ShopViewModal } from '@/components/modals/shop-view-modal'
import { ShopEditModal } from '@/components/modals/shop-edit-modal'
import { DashboardLayout } from '@/components/dashboard-layout'
import { shopApi, handleApiError, handleApiSuccess } from '@/services/api'
import { RouteGuard } from '@/components/auth/route-guard'


interface GeoEntry { id: string; countryId: string; regionId: string; cityId?: string; districtId?: string; name: string }
interface GeoCategory { id: string; name: string }

export default function ShopsPage() {
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>([])
  const [geovilles, setGeovilles] = useState<GeoEntry[]>([])
  const [geoCategories, setGeoCategories] = useState<GeoCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedArrondissement, setSelectedArrondissement] = useState('')
  const [selectedQuartier, setSelectedQuartier] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // --- Derived geo options with cascading ---
  const paysList = useMemo(() =>
    Array.from(new Set(geovilles.map(g => g.countryId).filter(Boolean))).sort(),
    [geovilles])

  const villesList = useMemo(() =>
    Array.from(new Set(
      geovilles
        .filter(g => !selectedCountry || g.countryId === selectedCountry)
        .map(g => g.regionId)
        .filter(Boolean)
    )).sort(),
    [geovilles, selectedCountry])

  const arrondissementsList = useMemo(() =>
    Array.from(new Set(
      geovilles
        .filter(g => (!selectedCountry || g.countryId === selectedCountry) &&
                     (!selectedCity || g.regionId === selectedCity))
        .map(g => g.districtId)
        .filter(Boolean) as string[]
    )).sort(),
    [geovilles, selectedCountry, selectedCity])

  const quartiersList = useMemo(() =>
    geovilles
      .filter(g => (!selectedCountry || g.countryId === selectedCountry) &&
                   (!selectedCity || g.regionId === selectedCity) &&
                   (!selectedArrondissement || g.districtId === selectedArrondissement))
      .map(g => g.name)
      .filter(Boolean)
      .sort(),
    [geovilles, selectedCountry, selectedCity, selectedArrondissement])

  const filteredShops = useMemo(() => shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || shop.category === selectedCategory
    const matchesCountry = !selectedCountry || shop.country === selectedCountry
    const matchesCity = !selectedCity || shop.city === selectedCity
    const matchesArrondissement = !selectedArrondissement || (shop as any).arrondissement === selectedArrondissement
    const matchesQuartier = !selectedQuartier || shop.area === selectedQuartier
    return matchesSearch && matchesCategory && matchesCountry && matchesCity && matchesArrondissement && matchesQuartier
  }), [shops, searchTerm, selectedCategory, selectedCountry, selectedCity, selectedArrondissement, selectedQuartier])

  // Load shops + geo data on mount
  useEffect(() => {
    loadShops()
    Promise.all([
      fetch(`${API_BASE_URL}/geoville`).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE_URL}/categories/`).then(r => r.ok ? r.json() : []),
    ]).then(([gv, cats]) => {
      setGeovilles(Array.isArray(gv) ? gv.map((g: any) => ({ id: String(g.id), countryId: g.countryId || '', regionId: g.regionId || '', cityId: g.cityId, districtId: g.districtId, name: g.name || '' })) : [])
      setGeoCategories(Array.isArray(cats) ? cats.map((c: any) => ({ id: String(c.id), name: c.name })) : [])
    }).catch(() => {})
  }, [])



  const loadShops = async () => {
  setIsLoading(true)
  try {
    const response = await fetch(`${API_BASE_URL}/shops`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch shops: ${response.status}`)
    }

    const data = await response.json()
    setShops((data as any[]).map(s => ({
      ...s,
      isActive: s.isActive !== undefined ? Boolean(s.isActive) : Number(s.is_active) === 1,
      country: s.country || s.pays || '',
      city: s.city || s.ville || '',
      area: s.area || s.quartier || '',
      profileImage: s.profileImage || s.profileImageUrl || '',
      profileImageUrl: s.profileImageUrl || s.profileImage || '',
    })))
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

  const handleToggleActive = async (shopId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/shops/${shopId}/toggle-active`, { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed to toggle')
      setShops(prev => prev.map(s => s.id === shopId ? { ...s, isActive: !currentActive } : s))
    } catch (error) {
      console.error('Error toggling shop visibility:', error)
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
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un salon..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800"
              >
                <option value="">Toutes</option>
                {geoCategories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pays</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value)
                  setSelectedCity('')
                  setSelectedArrondissement('')
                  setSelectedQuartier('')
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800"
              >
                <option value="">Tous</option>
                {paysList.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Ville</label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value)
                  setSelectedArrondissement('')
                  setSelectedQuartier('')
                }}
                disabled={villesList.length === 0}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800 disabled:opacity-50"
              >
                <option value="">Toutes</option>
                {villesList.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Arrondissement</label>
              <select
                value={selectedArrondissement}
                onChange={(e) => {
                  setSelectedArrondissement(e.target.value)
                  setSelectedQuartier('')
                }}
                disabled={arrondissementsList.length === 0}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800 disabled:opacity-50"
              >
                <option value="">Tous</option>
                {arrondissementsList.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Quartier</label>
              <select
                value={selectedQuartier}
                onChange={(e) => setSelectedQuartier(e.target.value)}
                disabled={quartiersList.length === 0}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800 disabled:opacity-50"
              >
                <option value="">Tous</option>
                {quartiersList.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory('')
                  setSelectedCountry('')
                  setSelectedCity('')
                  setSelectedArrondissement('')
                  setSelectedQuartier('')
                  setSearchTerm('')
                }}
                className="w-full text-sm"
              >
                Réinitialiser
              </Button>
            </div>
          </div>

          {/* Active filter count */}
          {(selectedCategory || selectedCountry || selectedCity || selectedArrondissement || selectedQuartier || searchTerm) && (
            <p className="text-xs text-gray-500 pt-1 border-t border-gray-100">
              <span className="font-semibold text-ikigai-primary">{filteredShops.length}</span> salon{filteredShops.length !== 1 ? 's' : ''} trouvé{filteredShops.length !== 1 ? 's' : ''}
            </p>
          )}
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
      src={`https://myikigai.sfo2.digitaloceanspaces.com/uploads/` + ((shop as any).profileImageUrl || shop.profileImage || '')}
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
          <div className="flex flex-wrap gap-1 mt-1">
            {shop.category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ikigai-primary/10 text-ikigai-primary text-xs rounded-full font-medium">
                <Tag className="h-2.5 w-2.5" />{shop.category}
              </span>
            )}
            {(shop as any).grade && (() => {
              const g = (shop as any).grade as 'basic' | 'pro' | 'elite'
              const cfg = { basic: { stars: 1, color: 'bg-gray-100 text-gray-700' }, pro: { stars: 3, color: 'bg-blue-100 text-blue-700' }, elite: { stars: 5, color: 'bg-yellow-100 text-yellow-700' } }
              const { stars, color } = cfg[g]
              return (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-bold ${color}`}>
                  {Array(stars).fill('★').join('')}{Array(5 - stars).fill('☆').join('')} {g.charAt(0).toUpperCase() + g.slice(1)}
                </span>
              )
            })()}
          </div>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{shop.description}</p>
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
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Calendar className="h-3 w-3" />
        {new Date(shop.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
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
          onClick={() => handleToggleActive(shop.id, shop.isActive ?? false)}
          title={shop.isActive ? 'Désactiver la boutique' : 'Activer la boutique'}
          className={shop.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
        >
          {shop.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
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
