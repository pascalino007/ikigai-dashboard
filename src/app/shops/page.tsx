'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Search, MapPin, Phone, Mail, Edit, Trash2, Eye, Scissors, Filter, List, Grid, Calendar, Tag, Star, ToggleLeft, ToggleRight, TrendingUp, Store } from 'lucide-react'
import { Shop } from '@/types'
import { ShopForm } from '@/components/forms/shop-form'
import { ShopViewModal } from '@/components/modals/shop-view-modal'
import { ShopEditModal } from '@/components/modals/shop-edit-modal'
import { DashboardLayout } from '@/components/dashboard-layout'
import { shopApi, handleApiError, handleApiSuccess } from '@/services/api'
import { RouteGuard } from '@/components/auth/route-guard'


interface GeoEntry { id: string; countryId: string; regionId: string; cityId?: string; districtId?: string; name: string }
interface GeoCategory { id: string; name: string }

// A shop's effective open/closed state (backend already computes `status` as open|closed).
const isShopOnline = (s: any) => {
  const st = String(s?.status ?? '').toLowerCase().trim()
  return st === 'open' || st === 'ouvert' || st === 'free' || st === 'occupé'
}
const shopViews = (s: any) => Number(s?.views ?? 0) || 0

export default function ShopsPage() {
  const router = useRouter()
  const [shops, setShops] = useState<Shop[]>([])
  const [geovilles, setGeovilles] = useState<GeoEntry[]>([])
  const [geoCategories, setGeoCategories] = useState<GeoCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedArrondissement, setSelectedArrondissement] = useState('')
  const [selectedQuartier, setSelectedQuartier] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // --- Derived geo options with cascading: Pays -> Region -> Ville -> Arrondissement -> Quartier ---
  const paysList = useMemo(() =>
    Array.from(new Set(geovilles.map(g => g.countryId).filter(Boolean))).sort(),
    [geovilles])

  const regionsList = useMemo(() =>
    Array.from(new Set(
      geovilles
        .filter(g => !selectedCountry || g.countryId === selectedCountry)
        .map(g => g.regionId)
        .filter(Boolean)
    )).sort(),
    [geovilles, selectedCountry])

  const villesList = useMemo(() =>
    Array.from(new Set(
      geovilles
        .filter(g => (!selectedCountry || g.countryId === selectedCountry) &&
                     (!selectedRegion || g.regionId === selectedRegion))
        .map(g => g.cityId)
        .filter(Boolean) as string[]
    )).sort(),
    [geovilles, selectedCountry, selectedRegion])

  const arrondissementsList = useMemo(() =>
    Array.from(new Set(
      geovilles
        .filter(g => (!selectedCountry || g.countryId === selectedCountry) &&
                     (!selectedRegion || g.regionId === selectedRegion) &&
                     (!selectedCity || g.cityId === selectedCity))
        .map(g => g.districtId)
        .filter(Boolean) as string[]
    )).sort(),
    [geovilles, selectedCountry, selectedRegion, selectedCity])

  const quartiersList = useMemo(() =>
    geovilles
      .filter(g => (!selectedCountry || g.countryId === selectedCountry) &&
                   (!selectedRegion || g.regionId === selectedRegion) &&
                   (!selectedCity || g.cityId === selectedCity) &&
                   (!selectedArrondissement || g.districtId === selectedArrondissement))
      .map(g => g.name)
      .filter(Boolean)
      .sort(),
    [geovilles, selectedCountry, selectedRegion, selectedCity, selectedArrondissement])

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

  // Online/closed counts + the single most-visited shop, for the insights bar.
  const insights = useMemo(() => {
    const online = shops.filter(isShopOnline).length
    let mostVisited: any = null
    for (const s of shops) {
      if (!mostVisited || shopViews(s) > shopViews(mostVisited)) mostVisited = s
    }
    if (mostVisited && shopViews(mostVisited) <= 0) mostVisited = null
    return { online, closed: shops.length - online, mostVisited }
  }, [shops])
  const topVisitedId = insights.mostVisited ? String(insights.mostVisited.id) : null

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
      handleApiSuccess(`Shop ${currentActive ? 'disabled' : 'enabled'}`)
      loadShops()
    } catch (err) {
      handleApiError(err, 'Failed to toggle shop status')
    }
  }

  const handleToggleVerification = async (shopId: string, shop: Shop) => {
    // Check if shop has certification image
    const certImage = (shop as any).certificationImage || shop.certificationImage
    if (!certImage) {
      handleApiError(new Error('Shop cannot be verified without a certification image'), 'Verification failed')
      return
    }
    try {
      const res = await fetch(`${API_BASE_URL}/shops/${shopId}/toggle-verification`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to toggle verification')
      const result = await res.json()
      handleApiSuccess(result.is_verified ? 'Shop verified' : 'Shop unverified')
      loadShops()
    } catch (err) {
      handleApiError(err, 'Failed to toggle verification')
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Région</label>
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value)
                  setSelectedCity('')
                  setSelectedArrondissement('')
                  setSelectedQuartier('')
                }}
                disabled={regionsList.length === 0}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800 disabled:opacity-50"
              >
                <option value="">Toutes</option>
                {regionsList.map(r => <option key={r} value={r}>{r}</option>)}
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
                  setSelectedRegion('')
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
      

      {/* Visits & online/closed insights */}
      {shops.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-ikigai-primary/10 flex items-center justify-center shrink-0"><Store className="h-5 w-5 text-ikigai-primary" /></div>
            <div><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{shops.length}</p><p className="text-xs text-gray-500">Salons</p></div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /></div>
            <div><p className="text-2xl font-bold text-green-600">{insights.online}</p><p className="text-xs text-gray-500">En ligne</p></div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /></div>
            <div><p className="text-2xl font-bold text-red-500">{insights.closed}</p><p className="text-xs text-gray-500">Fermés</p></div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"><TrendingUp className="h-5 w-5 text-amber-500" /></div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{insights.mostVisited ? insights.mostVisited.name : '—'}</p>
              <p className="text-xs text-gray-500 truncate">Plus visité{insights.mostVisited ? ` · ${shopViews(insights.mostVisited)} visites` : ''}</p>
            </div>
          </div>
        </div>
      )}

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
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-4'}>
        {filteredShops.map((shop) => (
          <div
            key={shop.id}
            className={`bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
              viewMode === 'grid' ? 'flex flex-col' : 'flex flex-row'
            }`}
          >
            {viewMode === 'grid' ? (
              <>
                {/* Grid: Image 100% width at top */}
                <div className="relative w-full h-52 flex-shrink-0">
                  <img
                    src={`https://myikigai.sfo2.digitaloceanspaces.com/uploads/` + ((shop as any).profileImageUrl || shop.profileImage || '')}
                    alt={shop.name}
                    className="object-cover w-full h-full"
                  />
                  <span
                    className={`absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-md ${
                      shop.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {shop.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {(shop as any).grade && (
                    <span className="absolute top-3 left-3 inline-flex items-center px-2 py-1 bg-white/90 dark:bg-black/70 rounded-full text-xs font-bold shadow-sm">
                      {(() => {
                        const g = (shop as any).grade as 'basic' | 'pro' | 'elite'
                        const stars = { basic: 1, pro: 3, elite: 5 }[g]
                        return <>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</>
                      })()}
                    </span>
                  )}
                  {/* Online/closed + visits overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-md ${isShopOnline(shop) ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isShopOnline(shop) ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {isShopOnline(shop) ? 'En ligne' : 'Fermé'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white shadow-md">
                      <Eye className="h-3 w-3" />{shopViews(shop)}
                    </span>
                  </div>
                  {topVisitedId === String(shop.id) && (
                    <span className="absolute top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-400 text-amber-900 shadow-md">
                      <TrendingUp className="h-3 w-3" /> Plus visité
                    </span>
                  )}
                </div>

                {/* Grid: Content at bottom */}
                <div className="flex flex-col flex-1 p-5">
                  {/* Title & Category */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">
                        {shop.name}
                      </h3>
                      {((shop as any).is_verified || shop.is_verified) && (
                        <img 
                          src="https://s.alicdn.com/@img/imgextra/i2/O1CN01YDryn81prCbNwab4Q_!!6000000005413-2-tps-168-42.png_q60.jpg" 
                          alt="Verified" 
                          className="h-4 w-auto object-contain"
                        />
                      )}
                      {(shop as any).grade && (() => {
                        const g = (shop as any).grade as 'basic' | 'pro' | 'elite'
                        const cfg = { 
                          basic: { stars: 1, color: 'bg-gray-100 text-gray-700', label: 'Basic' }, 
                          pro: { stars: 3, color: 'bg-blue-100 text-blue-700', label: 'Pro' }, 
                          elite: { stars: 5, color: 'bg-yellow-100 text-yellow-700', label: 'Elite' } 
                        }
                        const { stars, color, label } = cfg[g]
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-bold ${color}`}>
                            {Array(stars).fill('★').join('')}{Array(5 - stars).fill('☆').join('')} {label}
                          </span>
                        )
                      })()}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {shop.category && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-ikigai-primary/10 text-ikigai-primary text-xs rounded-full font-medium">
                          <Tag className="h-3 w-3" />
                          {shop.category}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(shop.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                    <MapPin className="h-3.5 w-3.5 inline mr-1 text-gray-400" />
                    {shop.address || 'Adresse non disponible'}
                  </p>

                  {/* Info row */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{shop.city}, {shop.country}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{shop.phone}</span>
                    </div>
                  </div>

                  {/* Action buttons at bottom */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageServices(shop.id)}
                      className="flex-1 text-ikigai-primary border-ikigai-primary hover:bg-ikigai-primary hover:text-white text-xs"
                    >
                      <Scissors className="h-3.5 w-3.5 mr-1.5" />
                      Services
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewShopDetails(shop.id)}
                      title="View"
                      className="text-gray-500 hover:text-gray-700 px-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditShop(shop)}
                      title="Edit"
                      className="text-gray-500 hover:text-gray-700 px-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(shop.id, shop.isActive ?? false)}
                      title={shop.isActive ? 'Disable' : 'Enable'}
                      className={`px-2 ${shop.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {shop.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </Button>

                    {/* Verification Toggle */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleVerification(shop.id, shop)}
                      disabled={!(shop as any).certificationImage && !shop.certificationImage}
                      className={`text-xs px-2 ${
                        (shop as any).is_verified || shop.is_verified
                          ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                          : ((shop as any).certificationImage || shop.certificationImage)
                            ? 'text-gray-600 border-gray-300 hover:text-blue-600 hover:border-blue-300'
                            : 'text-gray-300 cursor-not-allowed border-gray-200'
                      }`}
                    >
                      {(shop as any).is_verified || shop.is_verified ? 'Déverifier' : 'Verifier'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 px-2"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this shop?')) {
                          handleDeleteShop(shop.id)
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* List view - keep compact horizontal layout */}
                <div className="w-24 h-24 flex-shrink-0 relative">
                  <img
                    src={`https://myikigai.sfo2.digitaloceanspaces.com/uploads/` + ((shop as any).profileImageUrl || shop.profileImage || '')}
                    alt={shop.name}
                    className="object-cover w-full h-full"
                  />
                  <span
                    className={`absolute top-1 right-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium shadow-md ${
                      shop.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {shop.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {topVisitedId === String(shop.id) && (
                    <span className="absolute bottom-1 left-1 right-1 inline-flex items-center justify-center gap-1 px-1 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-amber-900 shadow">
                      <TrendingUp className="h-2.5 w-2.5" /> Top
                    </span>
                  )}
                </div>

                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {shop.name}
                          </h3>
                          {((shop as any).is_verified || shop.is_verified) && (
                            <img 
                              src="https://s.alicdn.com/@img/imgextra/i2/O1CN01YDryn81prCbNwab4Q_!!6000000005413-2-tps-168-42.png_q60.jpg" 
                              alt="Verified" 
                              className="h-3 w-auto object-contain"
                            />
                          )}
                          {(shop as any).grade && (() => {
                            const g = (shop as any).grade as 'basic' | 'pro' | 'elite'
                            const cfg = { 
                              basic: { stars: 1, color: 'bg-gray-100 text-gray-700', label: 'Basic' }, 
                              pro: { stars: 3, color: 'bg-blue-100 text-blue-700', label: 'Pro' }, 
                              elite: { stars: 5, color: 'bg-yellow-100 text-yellow-700', label: 'Elite' } 
                            }
                            const { stars, color, label } = cfg[g]
                            return (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-bold ${color}`}>
                                {Array(stars).fill('★').join('')}{Array(5 - stars).fill('☆').join('')} {label}
                              </span>
                            )
                          })()}
                        </div>
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
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" />{shop.city}</span>
                      <span className="flex items-center"><Phone className="h-3 w-3 mr-1" />{shop.phone}</span>
                      <span className={`inline-flex items-center gap-1 ${isShopOnline(shop) ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isShopOnline(shop) ? 'bg-green-500' : 'bg-red-400'}`} />
                        {isShopOnline(shop) ? 'En ligne' : 'Fermé'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-gray-500"><Eye className="h-3 w-3" />{shopViews(shop)} visites</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{new Date(shop.createdAt).toLocaleDateString('fr-FR')}</span>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleManageServices(shop.id)} className="h-7 text-xs px-2 text-ikigai-primary">
                        <Scissors className="h-3 w-3 mr-1" />Services
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleViewShopDetails(shop.id)} className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditShop(shop)} className="h-7 w-7 p-0"><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleActive(shop.id, shop.isActive ?? false)} className={`h-7 w-7 p-0 ${shop.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {shop.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </Button>
                      {/* Verification Toggle */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVerification(shop.id, shop)}
                        disabled={!(shop as any).certificationImage && !shop.certificationImage}
                        className={`h-7 text-xs px-2 ${
                          (shop as any).is_verified || shop.is_verified
                            ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                            : ((shop as any).certificationImage || shop.certificationImage)
                              ? 'text-gray-600 border-gray-300 hover:text-blue-600 hover:border-blue-300'
                              : 'text-gray-300 cursor-not-allowed border-gray-200'
                        }`}
                      >
                        {(shop as any).is_verified || shop.is_verified ? 'Déverifier' : 'Verifier'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => confirm('Delete?') && handleDeleteShop(shop.id)} className="h-7 w-7 p-0 text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </div>
              </>
            )}
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
