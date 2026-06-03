'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Store, Calendar, CreditCard, UserCheck, TrendingUp, Users, Plus, Pencil, Ban, CheckCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RouteGuard } from '@/components/auth/route-guard'
import { API_BASE_URL } from '@/services/api'

type TabType = 'overview' | 'bookings' | 'payments' | 'workers'

interface RealShop {
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
  grade: string
  category: string
  owner: string
  registered_by: string
  profileImageUrl: string | null
  createdAt: string
}

interface Booking {
  id: number
  user_id: number
  provider_id: number
  booking_date: string | null
  booking_time: string
  booking_status: number
  payement_status: number
  service_id: number
  amount: number
  currency: string
  created_at: string
  service_name?: string | null
  client_name?: string | null
  client_phone?: string | null
  shop_name?: string | null
  service?: { id: number; name: string; price: number; duration: string } | null
  shop?: { name: string } | null
  user?: { id: number; firstname: string; lastname: string; phone: string } | null
  transaction?: { id: number; paymentMethod: string; paymentProvider: string; status: number } | null
}

interface TxRecord {
  id: number
  label: string
  fromUserId: number
  toUserId: number
  amount: number
  currency: string
  status: number
  paymentMethod: string
  paymentProvider: string | null
  transactionRef: string
  createdAt: string
}

const BOOKING_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  1: { label: 'Confirmé', color: 'bg-green-100 text-green-800' },
  2: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
  3: { label: 'Paiement échoué', color: 'bg-red-100 text-red-800' },
  4: { label: 'En service', color: 'bg-blue-100 text-blue-800' },
  5: { label: 'Terminé', color: 'bg-gray-100 text-gray-800' },
}

const TX_STATUS: Record<number, { label: string; color: string }> = {
  '-1': { label: 'Échoué', color: 'bg-red-100 text-red-800' },
  0: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  1: { label: 'Succès', color: 'bg-green-100 text-green-800' },
} as any

export default function ShopDetailPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.id as string

  const [shop, setShop] = useState<RealShop | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [transactions, setTransactions] = useState<TxRecord[]>([])
  const [workers, setWorkers] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shopId) return
    const fetchAll = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [shopRes, bookingsRes, txRes, workersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/shops/${shopId}`),
          fetch(`${API_BASE_URL}/bookings/provider/${shopId}`),
          fetch(`${API_BASE_URL}/transactions/shop/${shopId}`),
          fetch(`${API_BASE_URL}/workers/shop/${shopId}`),
        ])
        if (!shopRes.ok) throw new Error('Shop not found')
        const [shopData, bookingsData, txData, workersData] = await Promise.all([
          shopRes.json(),
          bookingsRes.ok ? bookingsRes.json() : [],
          txRes.ok ? txRes.json() : [],
          workersRes.ok ? workersRes.json() : [],
        ])
        setShop(shopData)
        setBookings(Array.isArray(bookingsData) ? bookingsData : [])
        setTransactions(Array.isArray(txData) ? txData : [])
        setWorkers(Array.isArray(workersData) ? workersData : [])
      } catch (e: any) {
        setError(e.message || 'Erreur lors du chargement')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [shopId])

  const tabs: { id: TabType; name: string; icon: any }[] = [
    { id: 'overview', name: 'Vue générale', icon: Store },
    { id: 'bookings', name: `Réservations (${bookings.length})`, icon: Calendar },
    { id: 'payments', name: `Paiements (${transactions.length})`, icon: CreditCard },
    { id: 'workers', name: `Équipe (${workers.length})`, icon: Users },
  ]

  const refreshWorkers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/workers/shop/${shopId}`)
      if (res.ok) {
        const data = await res.json()
        setWorkers(Array.isArray(data) ? data : [])
      }
    } catch {}
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return <ShopOverviewTab shop={shop} bookings={bookings} transactions={transactions} />
      case 'bookings': return <ShopBookingsTab bookings={bookings} />
      case 'payments': return <ShopPaymentsTab transactions={transactions} />
      case 'workers': return <ShopWorkersTab shopId={Number(shopId)} workers={workers} onRefresh={refreshWorkers} />
      default: return <ShopOverviewTab shop={shop} bookings={bookings} transactions={transactions} />
    }
  }

  if (isLoading) {
    return (
      <RouteGuard allowedRoles={['admin', 'manager', 'enroller']}>
        <DashboardLayout>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    )
  }

  if (error || !shop) {
    return (
      <RouteGuard allowedRoles={['admin', 'manager', 'enroller']}>
        <DashboardLayout>
          <div className="p-6 text-center py-12">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{error || 'Shop introuvable'}</h3>
            <Button onClick={() => router.push('/shops')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux shops
            </Button>
          </div>
        </DashboardLayout>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard allowedRoles={['admin', 'manager', 'enroller']}>
      <DashboardLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/shops')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center space-x-3">
                {shop.profileImageUrl && (
                  <img src={shop.profileImageUrl} alt={shop.name} className="h-12 w-12 rounded-full object-cover border" />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{shop.name}</h1>
                  <p className="text-gray-500 text-sm">{shop.address}, {shop.quartier}, {shop.ville}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${shop.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {shop.is_active ? 'Actif' : 'Inactif'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                {shop.grade}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-ikigai-primary text-ikigai-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="min-h-[600px]">{renderTabContent()}</div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}

// ─── Overview ────────────────────────────────────────────────────────────────
function ShopOverviewTab({ shop, bookings, transactions }: { shop: RealShop | null; bookings: Booking[]; transactions: TxRecord[] }) {
  if (!shop) return null

  const totalRevenue = transactions.filter(t => t.status === 1).reduce((s, t) => s + t.amount, 0)
  const confirmedBookings = bookings.filter(b => b.booking_status === 1 || b.booking_status === 5).length
  const pendingBookings = bookings.filter(b => b.booking_status === 0).length

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total réservations', value: bookings.length, icon: Calendar, color: 'bg-indigo-100 text-indigo-600' },
          { label: 'Confirmées', value: confirmedBookings, icon: UserCheck, color: 'bg-green-100 text-green-600' },
          { label: 'En attente', value: pendingBookings, icon: TrendingUp, color: 'bg-yellow-100 text-yellow-600' },
          { label: 'Revenu total (XOF)', value: totalRevenue.toLocaleString(), icon: CreditCard, color: 'bg-purple-100 text-purple-600' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-lg shadow p-5 flex items-center gap-4">
            <div className={`p-2 rounded-lg ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shop details */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informations du shop</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="space-y-2">
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Adresse :</span> {shop.address}</p>
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Ville :</span> {shop.ville}, {shop.quartier}</p>
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Pays :</span> {shop.pays}</p>
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Téléphone :</span> {shop.phone}</p>
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Email :</span> {shop.email}</p>
          </div>
          <div className="space-y-2">
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Catégorie :</span> {shop.category}</p>
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Grade :</span> <span className="capitalize">{shop.grade}</span></p>
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Propriétaire :</span> {shop.owner}</p>
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Enregistré par :</span> {shop.registered_by}</p>
            <p><span className="font-medium text-gray-800 dark:text-gray-200">Créé le :</span> {new Date(shop.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        {shop.description_shop && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500">{shop.description_shop}</p>
          </div>
        )}
      </div>

      {/* Recent bookings preview */}
      {bookings.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Dernières réservations</h3>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {bookings.slice(0, 5).map((b) => {
              const s = BOOKING_STATUS[b.booking_status] || { label: `Statut ${b.booking_status}`, color: 'bg-gray-100 text-gray-800' }
              return (
                <div key={b.id} className="py-3 flex items-center justify-between">
                  <div className="text-sm">
                    <p className="font-medium text-gray-800 dark:text-gray-200">#{b.id} — {b.service_name || b.service?.name || `Service #${b.service_id}`}</p>
                    <p className="text-gray-500">
                      {b.booking_date} · {b.client_name || (b.user ? `${b.user?.firstname ?? ''} ${b.user?.lastname ?? ''}`.trim() || `Client #${b.user_id}` : `Client #${b.user_id}`)}
                      {(b.client_phone || b.user?.phone) ? ` · ${b.client_phone || b.user?.phone}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{b.amount.toLocaleString()} {b.currency}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Bookings tab ────────────────────────────────────────────────────────────
function ShopBookingsTab({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Réservations ({bookings.length})</h3>
      {bookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune réservation pour ce shop</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['#', 'Client', 'Service', 'Date', 'Montant', 'Paiement', 'Statut'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {bookings.map((b) => {
                  const s = BOOKING_STATUS[b.booking_status] || { label: `${b.booking_status}`, color: 'bg-gray-100 text-gray-800' }
                  const clientLabel = b.client_name || (b.user ? `${b.user?.firstname ?? ''} ${b.user?.lastname ?? ''}`.trim() || `Client #${b.user_id}` : `Client #${b.user_id}`)
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">#{b.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        <div>{clientLabel}</div>
                        {(b.client_phone || b.user?.phone) && (
                          <div className="text-xs text-gray-400">{b.client_phone || b.user?.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{b.service_name || b.service?.name || `#${b.service_id}`}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{b.booking_date || '—'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{b.amount.toLocaleString()} {b.currency}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">{b.transaction?.paymentMethod || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Payments tab ────────────────────────────────────────────────────────────
function ShopPaymentsTab({ transactions }: { transactions: TxRecord[] }) {
  const totalSuccess = transactions.filter(t => t.status === 1).reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Paiements ({transactions.length})</h3>
        {transactions.length > 0 && (
          <div className="text-sm text-gray-500">
            Total confirmé : <span className="font-bold text-green-600">{totalSuccess.toLocaleString()} XOF</span>
          </div>
        )}
      </div>
      {transactions.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-12 text-center">
          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune transaction pour ce shop</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['#', 'Réf.', 'Libellé', 'Montant', 'Méthode', 'Fournisseur', 'Date', 'Statut'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((tx) => {
                  const s = TX_STATUS[tx.status] || { label: `${tx.status}`, color: 'bg-gray-100 text-gray-800' }
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">#{tx.id}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{tx.transactionRef.slice(0, 12)}…</td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{tx.label}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{tx.amount.toLocaleString()} {tx.currency}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">{tx.paymentMethod}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">{tx.paymentProvider || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(tx.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Workers tab ──────────────────────────────────────────────────────────────
interface WorkerFormData {
  first_name: string
  last_name: string
  phone: string
  email: string
  speciality: string
  buffer_minutes: number
  schedules: { day_of_week: number; start_time: string; end_time: string }[]
}

const DAY_LABELS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const defaultSchedules = () => [1, 2, 3, 4, 5].map(d => ({ day_of_week: d, start_time: '09:00', end_time: '18:00' }))

function ShopWorkersTab({ shopId, workers, onRefresh }: { shopId: number; workers: any[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [editingWorker, setEditingWorker] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<WorkerFormData>({
    first_name: '', last_name: '', phone: '', email: '', speciality: '', buffer_minutes: 5,
    schedules: defaultSchedules(),
  })

  const resetForm = () => {
    setForm({ first_name: '', last_name: '', phone: '', email: '', speciality: '', buffer_minutes: 5, schedules: defaultSchedules() })
    setEditingWorker(null)
    setShowForm(false)
  }

  const openEdit = (worker: any) => {
    setEditingWorker(worker)
    setForm({
      first_name: worker.first_name || '',
      last_name: worker.last_name || '',
      phone: worker.phone || '',
      email: worker.email || '',
      speciality: worker.speciality || '',
      buffer_minutes: worker.buffer_minutes || 5,
      schedules: worker.schedules?.length
        ? worker.schedules.map((s: any) => ({ day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time }))
        : defaultSchedules(),
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, shop_id: shopId }
      const url = editingWorker
        ? `${API_BASE_URL}/workers/${editingWorker.id}`
        : `${API_BASE_URL}/workers`
      const method = editingWorker ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        resetForm()
        onRefresh()
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Erreur lors de la sauvegarde')
      }
    } catch (e: any) {
      alert(e.message || 'Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (worker: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/workers/${worker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !worker.is_active }),
      })
      if (res.ok) onRefresh()
    } catch {}
  }

  const updateSchedule = (index: number, field: string, value: string | number) => {
    const updated = [...form.schedules]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, schedules: updated })
  }

  const addScheduleRow = () => {
    setForm({ ...form, schedules: [...form.schedules, { day_of_week: 0, start_time: '09:00', end_time: '18:00' }] })
  }

  const removeScheduleRow = (index: number) => {
    setForm({ ...form, schedules: form.schedules.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Équipe ({workers.length})</h3>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="h-4 w-4 mr-1" /> Ajouter un worker
        </Button>
      </div>

      {/* Add/Edit form modal-like */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {editingWorker ? `Modifier : ${editingWorker.first_name} ${editingWorker.last_name}` : 'Nouveau Worker'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom *</label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="Prénom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="Nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+229..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Spécialité</label>
              <input
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={form.speciality}
                onChange={(e) => setForm({ ...form, speciality: e.target.value })}
                placeholder="Ex: Coiffure, Massage..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tampon (minutes entre RDV)</label>
              <input
                type="number"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={form.buffer_minutes}
                onChange={(e) => setForm({ ...form, buffer_minutes: parseInt(e.target.value) || 5 })}
                min={0}
              />
            </div>
          </div>

          {/* Schedule section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Horaires de travail</label>
              <button
                type="button"
                onClick={addScheduleRow}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + Ajouter un jour
              </button>
            </div>
            <div className="space-y-2">
              {form.schedules.map((sched, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-32"
                    value={sched.day_of_week}
                    onChange={(e) => updateSchedule(idx, 'day_of_week', parseInt(e.target.value))}
                  >
                    {DAY_LABELS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                  <input
                    type="time"
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={sched.start_time}
                    onChange={(e) => updateSchedule(idx, 'start_time', e.target.value)}
                  />
                  <span className="text-gray-500 text-sm">→</span>
                  <input
                    type="time"
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={sched.end_time}
                    onChange={(e) => updateSchedule(idx, 'end_time', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeScheduleRow(idx)}
                    className="text-red-500 hover:text-red-700 text-sm ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving || !form.first_name || !form.last_name}>
              {saving ? 'Sauvegarde...' : editingWorker ? 'Mettre à jour' : 'Créer le worker'}
            </Button>
            <Button variant="outline" onClick={resetForm}>Annuler</Button>
          </div>
        </div>
      )}

      {/* Workers list */}
      {workers.length === 0 && !showForm ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-12 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun worker pour ce shop</p>
          <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter le premier worker
          </Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['#', 'Nom', 'Spécialité', 'Téléphone', 'Horaires', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {workers.map((w) => {
                  const scheduleSummary = w.schedules?.length
                    ? w.schedules.map((s: any) => `${DAY_LABELS[s.day_of_week]?.slice(0, 3)} ${s.start_time}-${s.end_time}`).join(', ')
                    : '—'
                  return (
                    <tr key={w.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${!w.is_active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">#{w.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                        <div className="flex items-center gap-2">
                          {w.avatar_url ? (
                            <img src={w.avatar_url} className="h-8 w-8 rounded-full object-cover" alt="" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                              {(w.first_name?.[0] || '')}{(w.last_name?.[0] || '')}
                            </div>
                          )}
                          <span className="font-medium">{w.first_name} {w.last_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{w.speciality || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{w.phone || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate" title={scheduleSummary}>{scheduleSummary}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${w.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {w.is_active ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(w)}
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleActive(w)}
                            className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${w.is_active ? 'text-red-500' : 'text-green-600'}`}
                            title={w.is_active ? 'Suspendre' : 'Réactiver'}
                          >
                            {w.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
