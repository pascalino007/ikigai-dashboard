'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { API_BASE_URL } from '@/services/api'
import {
  ShoppingBag, Search, RefreshCw, Loader2, ChevronDown, ChevronUp,
  MapPin, CreditCard, Truck, Wallet, Package
} from 'lucide-react'

interface CommandeItem {
  product: { id: string; name: string; imageUrl: string; price: number; category: string }
  quantity: number
}

interface Commande {
  id: number
  items: CommandeItem[]
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: string
  shipping_address: string
  latitude?: number
  longitude?: number
  status: string
  user_id?: number
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

const PAYMENT_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  wallet:              { label: 'Wallet',             icon: <Wallet className="h-4 w-4" /> },
  credit_card:         { label: 'Carte bancaire',     icon: <CreditCard className="h-4 w-4" /> },
  payer_a_la_livraison:{ label: 'Payer à la livraison', icon: <Truck className="h-4 w-4" /> },
}

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => { loadCommandes() }, [])

  const loadCommandes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/commandes`)
      if (!res.ok) throw new Error('Failed to fetch commandes')
      const data = await res.json()
      setCommandes(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`${API_BASE_URL}/commandes/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Update failed')
      const updated = await res.json()
      setCommandes(prev => prev.map(c => c.id === id ? updated : c))
    } catch (err: any) {
      alert('Erreur: ' + err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = commandes.filter(c => {
    const matchSearch =
      String(c.id).includes(search) ||
      (c.shipping_address || '').toLowerCase().includes(search.toLowerCase()) ||
      c.items.some(i => i.product.name.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: commandes.length,
    pending: commandes.filter(c => c.status === 'pending').length,
    confirmed: commandes.filter(c => c.status === 'confirmed').length,
    delivered: commandes.filter(c => c.status === 'delivered').length,
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-ikigai-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Commandes</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5">Gérez les commandes de la marketplace</p>
            </div>
          </div>
          <Button variant="outline" onClick={loadCommandes} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-900 dark:text-gray-100' },
            { label: 'En attente', value: stats.pending, color: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300' },
            { label: 'Confirmées', value: stats.confirmed, color: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300' },
            { label: 'Livrées', value: stats.delivered, color: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300' },
          ].map(({ label, value, color, text }) => (
            <div key={label} className={`${color} rounded-lg p-4`}>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${text}`}>{isLoading ? '…' : value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ID, adresse, produit…"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ikigai-primary focus:border-transparent text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-ikigai-primary"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
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
            <p className="font-medium mb-2">Erreur de chargement</p>
            <p className="text-sm mb-4">{error}</p>
            <Button variant="outline" onClick={loadCommandes}>Réessayer</Button>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {search || statusFilter !== 'all' ? 'Aucune commande ne correspond aux filtres.' : 'Aucune commande pour l\'instant.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {filtered.map(c => {
                  const pm = PAYMENT_LABELS[c.payment_method] ?? { label: c.payment_method, icon: <CreditCard className="h-4 w-4" /> }
                  const isExpanded = expanded === c.id
                  return (
                    <div key={c.id}>
                      {/* Row */}
                      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex flex-wrap items-center gap-3">
                          {/* ID + Date */}
                          <div className="w-20">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">#{c.id}</p>
                            <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>

                          {/* Items summary */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {c.items.map(i => `${i.product.name} ×${i.quantity}`).join(', ')}
                            </p>
                            {c.shipping_address && (
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                {c.shipping_address}
                              </p>
                            )}
                          </div>

                          {/* Payment */}
                          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 min-w-[120px]">
                            {pm.icon}
                            <span>{pm.label}</span>
                          </div>

                          {/* Total */}
                          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 min-w-[80px] text-right">
                            {Number(c.total).toLocaleString()} CFA
                          </div>

                          {/* Status badge */}
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-700'}`}>
                            {STATUS_LABELS[c.status] ?? c.status}
                          </span>

                          {/* Status selector */}
                          <div className="flex items-center gap-2">
                            {updatingId === c.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            ) : (
                              <select
                                value={c.status}
                                onChange={e => updateStatus(c.id, e.target.value)}
                                className="text-xs border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-ikigai-primary"
                              >
                                <option value="pending">En attente</option>
                                <option value="confirmed">Confirmée</option>
                                <option value="delivered">Livrée</option>
                                <option value="cancelled">Annulée</option>
                              </select>
                            )}
                            <button
                              onClick={() => setExpanded(isExpanded ? null : c.id)}
                              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="px-6 pb-5 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800">
                          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Items */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Articles</h4>
                              <div className="space-y-2">
                                {c.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-3">
                                    {item.product.imageUrl ? (
                                      <img src={item.product.imageUrl} className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-700" alt={item.product.name} />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <Package className="h-4 w-4 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.product.name}</p>
                                      <p className="text-xs text-gray-500">×{item.quantity} · {Number(item.product.price).toLocaleString()} CFA</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                      {(item.product.price * item.quantity).toLocaleString()} CFA
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Summary */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Récapitulatif</h4>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                  <span>Sous-total</span><span>{Number(c.subtotal).toLocaleString()} CFA</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                  <span>Livraison</span><span>{Number(c.delivery_fee).toLocaleString()} CFA</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700 pt-1.5 mt-1.5">
                                  <span>Total</span><span>{Number(c.total).toLocaleString()} CFA</span>
                                </div>
                              </div>
                              {c.shipping_address && (
                                <div className="mt-4">
                                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Adresse</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">{c.shipping_address}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
