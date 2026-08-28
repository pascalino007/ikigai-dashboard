'use client'

import { useState, useEffect } from 'react'
import { Search, Check, X, ArrowUpRight, RefreshCw, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RouteGuard } from '@/components/auth/route-guard'
import { API_BASE_URL } from '@/services/api'

interface Withdrawal {
  id: number
  label: string
  amount: number
  status: number
  fromUserId: number
  toUserId: number
  transactionRef: string
  paymentMethod: string
  metadata?: { phone?: string; shopId?: number } | null
  createdAt: string
}

interface Shop {
  id: number
  name: string
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [filtered, setFiltered] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all')
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [shops, setShops] = useState<Shop[]>([])

  useEffect(() => { load(); fetchShops() }, [filter])

  const shopMap = new Map(shops.map((s) => [s.id, s.name]))

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      withdrawals.filter((w) =>
        w.label.toLowerCase().includes(q) ||
        w.transactionRef.toLowerCase().includes(q) ||
        String(shopMap.get(w.metadata?.shopId ?? 0) ?? '').toLowerCase().includes(q)
      )
    )
  }, [search, withdrawals, shops])

  async function load() {
    setLoading(true)
    try {
      const statusParam = filter === 'all' ? '' : `?status=${filter}`
      const res = await fetch(`${API_BASE_URL}/transactions/withdrawals${statusParam}`)
      if (res.ok) {
        const data = await res.json()
        setWithdrawals(data || [])
        setFiltered(data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function fetchShops() {
    try {
      const res = await fetch(`${API_BASE_URL}/shops`)
      if (res.ok) setShops(await res.json() || [])
    } catch (e) { console.error(e) }
  }

  async function confirmWithdrawal(id: number) {
    setProcessingId(id)
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/withdrawals/${id}/confirm`, { method: 'POST' })
      if (res.ok) await load()
      else alert('Erreur lors de la confirmation')
    } catch (e) {
      console.error(e)
    } finally {
      setProcessingId(null)
    }
  }

  async function reject(id: number) {
    if (!window.confirm('Rejeter cette demande ? Les fonds seront restitues au portefeuille.')) return
    setProcessingId(id)
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/withdrawals/${id}/reject`, { method: 'POST' })
      if (res.ok) await load()
      else alert('Erreur lors du rejet')
    } catch (e) {
      console.error(e)
    } finally {
      setProcessingId(null)
    }
  }

  const statusBadge = (status: number) => {
    if (status === 0) return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
        <Clock className="h-3 w-3 mr-1" />En attente
      </span>
    )
    if (status === 1) return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
        <Check className="h-3 w-3 mr-1" />Valide
      </span>
    )
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
        <X className="h-3 w-3 mr-1" />Rejete
      </span>
    )
  }

  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleString('fr-FR') } catch { return iso }
  }

  const pendingCount = withdrawals.filter((w) => w.status === 0).length

  return (
    <RouteGuard allowedRoles={["admin", "manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Retraits</h1>
              <p className="text-sm text-gray-500 mt-1">
                {pendingCount > 0 ? `${pendingCount} demande(s) en attente de traitement` : 'Aucune demande en attente'}
              </p>
            </div>
            <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4 mr-2" /> Rafraichir</Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'pending', 'success', 'failed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    filter === f
                      ? 'bg-ikigai-primary text-white border-ikigai-primary'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : f === 'success' ? 'Valides' : 'Rejetes'}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Boutique</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Montant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telephone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((w) => (
                    <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300">{w.transactionRef}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{w.metadata?.shopId ? (shopMap.get(w.metadata.shopId) ?? `Boutique #${w.metadata.shopId}`) : '—'}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{w.amount.toLocaleString()} FCFA</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{w.metadata?.phone ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{fmtDate(w.createdAt)}</td>
                      <td className="px-4 py-3">{statusBadge(w.status)}</td>
                      <td className="px-4 py-3 text-right">
                        {w.status === 0 && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => confirmWithdrawal(w.id)}
                              disabled={processingId === w.id}
                            >
                              {processingId === w.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                              <span className="ml-1">Valider</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => reject(w.id)}
                              disabled={processingId === w.id}
                            >
                              <X className="h-3 w-3" />
                              <span className="ml-1">Rejeter</span>
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        Aucun retrait trouve
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {loading && (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">Chargement...</div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}
