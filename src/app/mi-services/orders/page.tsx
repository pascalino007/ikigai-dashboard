'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Filter, ClipboardList, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'

interface Order {
  id: number
  mi_service_id: number
  shop_id: number
  user_id: number | null
  amount: number
  status: string
  transaction_ref: string
  payment_method: string | null
  payment_provider: string | null
  external_payment_id: string | null
  createdAt: string
}

export default function MiServiceOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'failed'>('all')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/mi-services/orders`)
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) { setOrders([]) }
    finally { setLoading(false) }
  }

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (!searchTerm) return true
    const s = searchTerm.toLowerCase()
    return o.transaction_ref.toLowerCase().includes(s) || String(o.shop_id).includes(s)
  })

  const statusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" />Payé</span>
      case 'failed': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700"><span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5" />Échoué</span>
      default: return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500 mr-1.5" />En attente</span>
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Commandes Mi Services</h1>
            <p className="text-sm text-gray-500 mt-1">Suivi des commandes des prestataires</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', val: orders.length, color: 'bg-ikigai-primary/10 text-ikigai-primary' },
            { label: 'Payés', val: orders.filter(o => o.status === 'paid').length, color: 'bg-green-50 text-green-600' },
            { label: 'En attente', val: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Échoués', val: orders.filter(o => o.status === 'failed').length, color: 'bg-red-50 text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
              <div className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center`}>
                <ClipboardList className="h-5 w-5" />
              </div>
              <div><p className="text-2xl font-bold text-gray-900">{s.val}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Rechercher par ref ou shop..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              {(['all', 'pending', 'paid', 'failed'] as const).map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-ikigai-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s === 'all' ? 'Tous' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-3" />Chargement...</div>}

        {!loading && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Ref Transaction</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Shop ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Montant</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Paiement</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, idx) => (
                    <tr key={o.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{o.id}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.transaction_ref}</td>
                      <td className="px-4 py-3 text-gray-700">{o.shop_id}</td>
                      <td className="px-4 py-3 font-semibold text-ikigai-primary">{o.amount.toLocaleString('fr-FR')} FCFA</td>
                      <td className="px-4 py-3">{statusBadge(o.status)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs capitalize">{o.payment_provider || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Aucune commande trouvée</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
