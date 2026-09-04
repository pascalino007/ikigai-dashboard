'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Calendar, Percent, Clock } from 'lucide-react'
import { SpecialOffer, ShopService } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { SpecialOfferForm } from '@/components/forms/special-offer-form'
import { SpecialOfferEditModal } from '@/components/modals/special-offer-edit-modal'
import { AdminOrManager } from '@/components/auth/route-guard'




export default function SpecialOffersPage() {
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [shopServices, setShopServices] = useState<ShopService[]>([])
  // filters removed for now
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null)

  // date filters
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  // fetch specials from backend
  const loadSpecials = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      // include_inactive: the dashboard must list deactivated offers too
      const res = await fetch(`${API_BASE_URL}/specials?include_inactive=1`)
      if (!res.ok) throw new Error(`Failed to fetch specials (${res.status})`)
      const data = await res.json()

      // Normalize dates coming from backend (strings) into Date objects, and fill in
      // fields the backend doesn't return under the name the table expects: prices are
      // MySQL decimals (serialized as strings), used-count is `uses`, and shop/service
      // names come back snake_case (or, for service, only as a raw id) from `/specials`.
      const normalized = Array.isArray(data)
        ? data.map((d: any) => {
            const originalPrice = Number(d.originalPrice) || 0
            const discountedPrice = Number(d.discountedPrice) || 0
            return {
              ...d,
              // Backend column is is_active; older rows without it count as active.
              isActive: d.is_active ?? d.isActive ?? true,
              startDate: d.startDate ? new Date(d.startDate) : new Date(),
              endDate: d.endDate ? new Date(d.endDate) : new Date(),
              originalPrice,
              discountedPrice,
              discountPercentage: originalPrice > 0
                ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
                : 0,
              usedCount: d.uses ?? d.usedCount ?? 0,
              shopName: d.shop_name ?? d.shopName ?? '',
              serviceName: d.service_name ?? d.serviceName ?? '',
            }
          })
        : []
      setSpecialOffers(normalized)
    } catch (err) {
      console.error('Error fetching specials:', err)
      setFetchError(err instanceof Error ? err.message : 'Unknown error')
      // keep mock data as fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSpecials()
  }, [])

  const handleToggleActive = async (offer: SpecialOffer) => {
    try {
      const res = await fetch(`${API_BASE_URL}/specials/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !offer.isActive }),
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      setSpecialOffers(prev =>
        prev.map(o => (o.id === offer.id ? { ...o, isActive: !o.isActive } : o))
      )
    } catch (err) {
      console.error('Error toggling special:', err)
      alert("Échec du changement de statut de l'offre")
    }
  }

  const handleDeleteOffer = async (offer: SpecialOffer) => {
    if (!confirm(`Supprimer l'offre "${offer.title}" ?`)) return
    try {
      const res = await fetch(`${API_BASE_URL}/specials/${offer.id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error(`Erreur ${res.status}`)
      setSpecialOffers(prev => prev.filter(o => o.id !== offer.id))
    } catch (err) {
      console.error('Error deleting special:', err)
      alert("Échec de la suppression de l'offre")
    }
  }

  const stats = useMemo(() => {
    const now = new Date()
    const total = specialOffers.length
    const active = specialOffers.filter(o => o.isActive && now >= o.startDate && now <= o.endDate).length
    const finished = specialOffers.filter(o => now > o.endDate).length
    return { total, active, finished }
  }, [specialOffers])

  const filteredOffers = useMemo(() => {
    if (!dateFrom && !dateTo) return specialOffers
    const from = dateFrom ? new Date(dateFrom) : new Date(-8640000000000000)
    // include entire day for `to`
    const to = dateTo ? new Date(new Date(dateTo).setHours(23,59,59,999)) : new Date(8640000000000000000)
    return specialOffers.filter((o) => {
      const s = o.startDate instanceof Date ? o.startDate : new Date(o.startDate)
      const e = o.endDate instanceof Date ? o.endDate : new Date(o.endDate)
      // overlap test: offer ends on/after from AND offer starts on/before to
      return e >= from && s <= to
    })
  }, [specialOffers, dateFrom, dateTo])

  const getStatusColor = (offer: SpecialOffer) => {
    const now = new Date()
    if (!offer.isActive) return 'bg-red-100 text-red-800'
    if (now < offer.startDate) return 'bg-yellow-100 text-yellow-800'
    if (now > offer.endDate) return 'bg-gray-100 text-gray-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (offer: SpecialOffer) => {
    const now = new Date()
    if (!offer.isActive) return 'Inactive'
    if (now < offer.startDate) return 'Scheduled'
    if (now > offer.endDate) return 'Expired'
    return 'Active'
  }

  // `created` is the record the backend just persisted (real image URL, real id) —
  // re-derived fake fields here previously crashed on URL.createObjectURL(string).
  const handleAddSpecialOffer = (created: any) => {
    const originalPrice = Number(created.originalPrice) || 0
    const discountedPrice = Number(created.discountedPrice) || 0
    const newOffer: SpecialOffer = {
      ...created,
      isActive: created.is_active ?? created.isActive ?? true,
      startDate: created.startDate ? new Date(created.startDate) : new Date(),
      endDate: created.endDate ? new Date(created.endDate) : new Date(),
      originalPrice,
      discountedPrice,
      discountPercentage: originalPrice > 0
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0,
      usedCount: created.uses ?? created.usedCount ?? 0,
      shopName: created.shop_name ?? created.shopName ?? '',
      serviceName: created.service_name ?? created.serviceName ?? '',
    }

    setSpecialOffers(prev => [newOffer, ...prev])
    setShowAddModal(false)
  }

  // Accept Date | string | number and return readable string
  const formatDate = (dateInput?: Date | string | number) => {
    if (!dateInput) return '-'
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <AdminOrManager>
      <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Special Offers</h1>
              <p className="text-gray-600 mt-2">Manage special offers and promotions for shops</p>
            </div>
            <Button onClick={() => alert('Filter modal coming soon!')} variant="outline" className="mr-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Combo
            </Button>
          </div>
        </div>

        {/* Stats + Date range filter */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col justify-between">
            <div>
              <div className="text-sm text-gray-500">Active Offers</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.active}</div>
            </div>
            <div className="text-xs text-gray-400 mt-2">Currently running</div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 flex flex-col justify-between">
            <div>
              <div className="text-sm text-gray-500">Total Offers</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
            </div>
            <div className="text-xs text-gray-400 mt-2">All specials</div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-2">Finished Offers</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.finished}</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border rounded-md"
                aria-label="From date"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border rounded-md"
                aria-label="To date"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => { setDateFrom(''); setDateTo('') }}
                className="px-3 py-2 border rounded-md text-sm"
              >
                Clear
              </button>
              <div className="text-sm text-gray-500 self-center">Showing offers inside selected range</div>
            </div>
          </div>
        </div>

        {/* Special Offers Table */}
        {loading ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">Loading specials...</div>
        ) : fetchError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            Error loading specials: {fetchError}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Offer Details
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Service & Shop
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Pricing
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Duration
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Usage
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Status
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Actions
                     </th>
                   </tr>
                 </thead>
                 <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                   {filteredOffers.map((offer) => (
                     <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={offer.image || '/images/placeholder-rect.png'}
                            alt={offer.title}
                            className="w-20 h-12 object-cover rounded-md"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder-rect.png' }}
                          />
                        </div>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div>
                           <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{offer.title}</div>
                           <div className="text-sm text-gray-500">{offer.description}</div>
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div>
                           <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{offer.serviceName || offer.serviceId}</div>
                           <div className="text-sm text-gray-500">{offer.shopName || offer.shopId}</div>
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div>
                           <div className="text-sm text-gray-900 dark:text-gray-100">
                             <span className="line-through text-gray-400">{offer.originalPrice} FCFA</span>
                             <span className="ml-2 font-semibold text-green-600">{offer.discountedPrice} FCFA</span>
                           </div>
                           <div className="text-sm text-red-600 font-medium">
                             <Percent className="h-3 w-3 inline mr-1" />
                             {offer.discountPercentage}% OFF
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div>
                           <div className="text-sm text-gray-900 dark:text-gray-100">
                             <Calendar className="h-3 w-3 inline mr-1" />
                             {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                           </div>
                           <div className="text-sm text-gray-500">
                             <Clock className="h-3 w-3 inline mr-1" />
                             {offer.duration} days
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900 dark:text-gray-100">
                           {offer.usedCount} / {offer.maxUses || '∞'}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(offer)}`}>
                           {getStatusText(offer)}
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                         <div className="flex space-x-2">
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleToggleActive(offer)}
                             className={offer.isActive ? 'text-orange-500 hover:text-orange-600' : 'text-green-600 hover:text-green-700'}
                             title={offer.isActive ? 'Désactiver' : 'Activer'}
                           >
                             {offer.isActive ? 'Désactiver' : 'Activer'}
                           </Button>
                           <Button variant="ghost" size="sm" onClick={() => setEditingOffer(offer)} title="Modifier">
                             <Edit className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteOffer(offer)} title="Supprimer">
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
         )}

        {/* Add Special Offer Form */}
        {(() => {
          const AnySpecialOfferForm: any = SpecialOfferForm
          return (
            <AnySpecialOfferForm
              isOpen={showAddModal}
              onClose={() => setShowAddModal(false)}
              onSubmit={handleAddSpecialOffer}
              shopServices={shopServices}
            />
          )
        })()}

        {/* Edit Special Offer Modal */}
        <SpecialOfferEditModal
          offer={editingOffer}
          onClose={() => setEditingOffer(null)}
          onSaved={loadSpecials}
        />
      </div>
    </DashboardLayout>
    </AdminOrManager>
  )
}
