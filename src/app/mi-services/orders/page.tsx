'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Filter, ClipboardList, Loader2, ChevronLeft, ChevronRight, CalendarDays, List, PackageCheck, Truck } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'

interface Order {
  id: number
  mi_service_id: number
  mi_service_name?: string | null
  shop_id: number
  user_id: number | null
  amount: number
  status: string
  transaction_ref: string
  payment_method: string | null
  payment_provider: string | null
  external_payment_id: string | null
  expected_delivery_date: string | null
  delivered_at: string | null
  createdAt: string
}

const ymd = (d: Date | string) => {
  const date = typeof d === 'string' ? new Date(d) : d
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function MiServiceOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'failed' | 'delivered'>('all')
  const [view, setView] = useState<'list' | 'calendar'>('calendar')
  const [month, setMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1) })
  const [selectedDate, setSelectedDate] = useState<string | null>(ymd(new Date()))

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

  const markDelivered = async (id: number) => {
    if (!confirm('Marquer cette commande comme livrée ?')) return
    try {
      await fetch(`${API_BASE_URL}/mi-services/orders/${id}/deliver`, { method: 'PATCH' })
      await loadAll()
    } catch (e) { /* ignore */ }
  }

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (!searchTerm) return true
    const s = searchTerm.toLowerCase()
    return o.transaction_ref.toLowerCase().includes(s) || String(o.shop_id).includes(s) || (o.mi_service_name || '').toLowerCase().includes(s)
  })

  const statusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" />Payé</span>
      case 'delivered': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"><span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5" />Livré</span>
      case 'failed': return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700"><span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5" />Échoué</span>
      default: return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500 mr-1.5" />En attente</span>
    }
  }

  // ── Calendar matrix ──
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const startOffset = (firstDay.getDay() + 6) % 7 // make Monday=0
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells: (string | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(ymd(new Date(month.getFullYear(), month.getMonth(), d)))

  const placedOn = (day: string) => orders.filter(o => ymd(o.createdAt) === day)
  const dueOn = (day: string) => orders.filter(o => o.expected_delivery_date && o.expected_delivery_date.slice(0, 10) === day)

  const monthLabel = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const todayStr = ymd(new Date())

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Commandes Mi Services</h1>
            <p className="text-sm text-gray-500 mt-1">Suivi des commandes et des livraisons</p>
          </div>
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setView('calendar')} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-ikigai-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}><CalendarDays className="h-4 w-4" />Calendrier</button>
            <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${view === 'list' ? 'bg-ikigai-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}><List className="h-4 w-4" />Liste</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', val: orders.length, color: 'bg-ikigai-primary/10 text-ikigai-primary' },
            { label: 'Payés', val: orders.filter(o => o.status === 'paid').length, color: 'bg-green-50 text-green-600' },
            { label: 'En attente', val: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Livrés', val: orders.filter(o => o.status === 'delivered').length, color: 'bg-blue-50 text-blue-600' },
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

        {loading && <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="h-6 w-6 animate-spin mr-3" />Chargement...</div>}

        {/* ── CALENDAR VIEW ── */}
        {!loading && view === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500"><ChevronLeft className="h-4 w-4" /></button>
                <h2 className="text-lg font-bold text-gray-900 capitalize">{monthLabel}</h2>
                <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500"><ChevronRight className="h-4 w-4" /></button>
              </div>
              <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-ikigai-primary" />Commandées</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />À livrer</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-1">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} className="py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />
                  const placed = placedOn(day).length
                  const due = dueOn(day).length
                  const isSelected = day === selectedDate
                  const isToday = day === todayStr
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square rounded-lg border p-1 flex flex-col items-center justify-start text-sm transition-colors ${isSelected ? 'border-ikigai-primary bg-ikigai-primary/5' : 'border-gray-100 hover:bg-gray-50'} ${isToday ? 'ring-1 ring-ikigai-primary/40' : ''}`}
                    >
                      <span className={`font-medium ${isToday ? 'text-ikigai-primary' : 'text-gray-700'}`}>{parseInt(day.slice(8))}</span>
                      <span className="flex gap-1 mt-auto pb-0.5">
                        {placed > 0 && <span className="h-1.5 w-1.5 rounded-full bg-ikigai-primary" />}
                        {due > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Day detail panel */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Sélectionnez un jour'}
              </h3>
              {selectedDate && (
                <div className="space-y-5">
                  <DayGroup
                    title="Commandées ce jour"
                    icon={<PackageCheck className="h-4 w-4 text-ikigai-primary" />}
                    orders={placedOn(selectedDate)}
                    statusBadge={statusBadge}
                    onDeliver={markDelivered}
                  />
                  <DayGroup
                    title="À livrer ce jour"
                    icon={<Truck className="h-4 w-4 text-amber-500" />}
                    orders={dueOn(selectedDate)}
                    statusBadge={statusBadge}
                    onDeliver={markDelivered}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {!loading && view === 'list' && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Rechercher par ref, shop ou service..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="h-4 w-4 text-gray-400" />
                  {(['all', 'pending', 'paid', 'delivered', 'failed'] as const).map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-ikigai-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {s === 'all' ? 'Tous' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Service</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Shop ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Montant</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Statut</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Commandée</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Livraison prévue</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o, idx) => (
                      <tr key={o.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="px-4 py-3 font-medium text-gray-900">{o.id}</td>
                        <td className="px-4 py-3 text-gray-700">{o.mi_service_name || `#${o.mi_service_id}`}</td>
                        <td className="px-4 py-3 text-gray-700">{o.shop_id}</td>
                        <td className="px-4 py-3 font-semibold text-ikigai-primary">{o.amount.toLocaleString('fr-FR')} FCFA</td>
                        <td className="px-4 py-3">{statusBadge(o.status)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{o.expected_delivery_date ? new Date(o.expected_delivery_date).toLocaleDateString('fr-FR') : '—'}</td>
                        <td className="px-4 py-3">
                          {o.status !== 'delivered' && o.status !== 'failed' ? (
                            <button onClick={() => markDelivered(o.id)} className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline">Marquer livré</button>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Aucune commande trouvée</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function DayGroup({ title, icon, orders, statusBadge, onDeliver }: {
  title: string
  icon: React.ReactNode
  orders: Order[]
  statusBadge: (s: string) => React.ReactNode
  onDeliver: (id: number) => void
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">{title}</h4>
        <span className="text-xs text-gray-400">({orders.length})</span>
      </div>
      {orders.length === 0 ? (
        <p className="text-xs text-gray-400 pl-6">Aucune</p>
      ) : (
        <div className="space-y-2">
          {orders.map(o => (
            <div key={o.id} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">{o.mi_service_name || `Service #${o.mi_service_id}`}</span>
                {statusBadge(o.status)}
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-gray-500">Shop {o.shop_id} · {o.amount.toLocaleString('fr-FR')} FCFA</span>
                {o.status !== 'delivered' && o.status !== 'failed' && (
                  <button onClick={() => onDeliver(o.id)} className="text-xs font-medium text-blue-600 hover:underline">Marquer livré</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
