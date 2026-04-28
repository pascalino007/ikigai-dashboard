'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, MapPin, Phone, Mail, Eye, Calendar, Users, TrendingUp, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAuth } from '@/lib/auth/auth-context'
import { EnrollerOnly } from '@/components/auth/route-guard'
import { API_BASE_URL } from '@/services/api'

interface EnrolledShop {
  id: number
  name: string
  address: string
  pays: string
  ville: string
  quartier: string
  phone: string
  email: string
  description_shop: string
  is_active: boolean
  enroller_id: number
  createdAt: string
}

export default function EnrolledShopsPage() {
  const { user } = useAuth()
  const [enrolledShops, setEnrolledShops] = useState<EnrolledShop[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) loadEnrolledShops()
  }, [user?.id])

  const loadEnrolledShops = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/enrollers/${user!.id}/shops`)
      if (!res.ok) throw new Error('Failed to fetch enrolled shops')
      const data = await res.json()
      setEnrolledShops(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Error loading enrolled shops:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredShops = enrolledShops.filter(shop => {
    const term = searchTerm.toLowerCase()
    return (
      shop.name.toLowerCase().includes(term) ||
      (shop.ville || '').toLowerCase().includes(term) ||
      (shop.address || '').toLowerCase().includes(term)
    )
  })

  const activeShops = enrolledShops.filter(shop => shop.is_active).length
  const totalShops = enrolledShops.length

  const thisMonth = enrolledShops.filter(shop => {
    const d = new Date(shop.createdAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  return (
    <EnrollerOnly>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Enrolled Shops</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and track the shops you have enrolled</p>
            </div>
            <Button onClick={() => window.location.href = '/register-shop'}>
              <Plus className="h-4 w-4 mr-2" />
              Register New Shop
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Users, color: 'blue', label: 'Total Shops', value: isLoading ? null : totalShops },
              { icon: TrendingUp, color: 'green', label: 'Active Shops', value: isLoading ? null : activeShops },
              { icon: Calendar, color: 'purple', label: 'This Month', value: isLoading ? null : thisMonth },
            ].map(({ icon: Icon, color, label, value }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-2 bg-${color}-100 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {value === null ? <Loader2 className="h-5 w-5 animate-spin" /> : value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, city or address..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}

          {/* Error */}
          {!isLoading && error && (
            <div className="text-center py-12 text-red-500">
              <p className="mb-2 font-medium">Failed to load shops</p>
              <p className="text-sm">{error}</p>
              <Button variant="outline" className="mt-4" onClick={loadEnrolledShops}>Retry</Button>
            </div>
          )}

          {/* Grid */}
          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShops.map((shop) => (
                  <div key={shop.id} className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{shop.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{shop.description_shop}</p>
                        </div>
                        <span className={`ml-2 flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          shop.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {shop.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          {[shop.address, shop.quartier, shop.ville, shop.pays].filter(Boolean).join(', ')}
                        </div>
                        {shop.phone && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-4 w-4 mr-2" />
                            {shop.phone}
                          </div>
                        )}
                        {shop.email && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="h-4 w-4 mr-2" />
                            {shop.email}
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500">
                          {new Date(shop.createdAt).toLocaleDateString()}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = `/shops`}
                          className="text-ikigai-primary border-ikigai-primary hover:bg-ikigai-primary hover:text-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredShops.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No shops found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm ? 'Try adjusting your search.' : "You haven't enrolled any shops yet."}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => window.location.href = '/register-shop'}>
                      <Plus className="h-4 w-4 mr-2" />
                      Register Your First Shop
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </EnrollerOnly>
  )
}
