'use client'

import { API_BASE_URL } from '@/services/api'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Search,
  Calendar,
  Store,
  CreditCard,
  Wallet,
  Smartphone,
  Loader2,
  Inbox,
  Filter,
  ArrowLeft,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Hash,
  Users,
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Transaction {
  id: number
  label: string
  fromUserId: number
  toUserId: number
  amount: number
  currency: string
  status: number            // -1 failed | 0 pending | 1 success
  transactionMotifId: number // 1 deposit | 2 sub | 3 order | 9 booking
  transactionRef: string
  paymentMethod: string      // wallet | card | mobile_money
  paymentProvider: string | null // stripe | kkiapay | sandbox | null
  balanceBefore: number
  balanceAfter: number
  bookingId: number | null
  createdAt: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const MOTIF_LABELS: Record<number, string> = {
  1: 'Dépôt portefeuille',
  2: 'Abonnement',
  3: 'Commande',
  9: 'Paiement réservation',
}

const METHOD_META: Record<string, { label: string; Icon: typeof CreditCard; color: string }> = {
  wallet:       { label: 'Portefeuille', Icon: Wallet,     color: 'bg-ikigai-primary/10 text-ikigai-primary dark:bg-ikigai-teal/10 dark:text-ikigai-teal' },
  card:         { label: 'Carte',        Icon: CreditCard, color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
  mobile_money: { label: 'Mobile Money', Icon: Smartphone, color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' },
}

const STATUS_META: Record<number, { label: string; badge: string; dot: string }> = {
  1:  { label: 'Complété', badge: 'ik-badge-green', dot: 'bg-green-500' },
  0:  { label: 'En attente', badge: 'ik-badge-amber', dot: 'bg-amber-500' },
  [-1]: { label: 'Échoué', badge: 'ik-badge-red', dot: 'bg-red-500' },
}

function fmtAmount(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return iso }
}

function fmtDateTime(iso: string) {
  try {
    const d = new Date(iso)
    return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
  } catch { return iso }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [motifFilter, setMotifFilter] = useState('all')

  /* ── Fetch ────────────────────────────────────────────────────── */
  useEffect(() => {
    ;(async () => {
      try {
        const token = localStorage.getItem('ikigai_token')
        const res = await fetch(`${API_BASE_URL}/transactions/admin/all`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
        const data = await res.json()
        setTransactions(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching transactions', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  /* ── Derived ──────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (search) {
        const q = search.toLowerCase()
        const match =
          (tx.transactionRef ?? '').toLowerCase().includes(q) ||
          String(tx.fromUserId).includes(q) ||
          String(tx.toUserId).includes(q) ||
          String(tx.id).includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all') {
        const num = Number(statusFilter)
        if (tx.status !== num) return false
      }
      if (methodFilter !== 'all' && tx.paymentMethod !== methodFilter) return false
      if (motifFilter !== 'all' && String(tx.transactionMotifId) !== motifFilter) return false
      return true
    })
  }, [transactions, search, statusFilter, methodFilter, motifFilter])

  const stats = useMemo(() => {
    const s = { total: transactions.length, completed: 0, pending: 0, failed: 0, revenue: 0, deposits: 0 }
    transactions.forEach((tx) => {
      if (tx.status === 1) { s.completed++; s.revenue += tx.amount }
      else if (tx.status === 0) s.pending++
      else s.failed++
      if (tx.transactionMotifId === 1 && tx.status === 1) s.deposits += tx.amount
    })
    return s
  }, [transactions])

  /* ── Loading ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-ikigai-teal" />
        </div>
      </DashboardLayout>
    )
  }

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold ik-heading">Transactions</h1>
            <p className="ik-muted text-sm mt-1">Historique des paiements et dépôts</p>
          </div>
          <Link href="/bookings">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour aux réservations
            </Button>
          </Link>
        </div>

        {/* ── Stat cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Banknote}
            label="Revenu confirmé"
            value={`${fmtAmount(stats.revenue)} FCFA`}
            color="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Total transactions"
            value={String(stats.total)}
            color="bg-ikigai-primary/10 text-ikigai-primary dark:bg-ikigai-teal/10 dark:text-ikigai-teal"
          />
          <StatCard
            icon={Clock}
            label="En attente"
            value={String(stats.pending)}
            color="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
          />
          <StatCard
            icon={ArrowDownRight}
            label="Dépôts confirmés"
            value={`${fmtAmount(stats.deposits)} FCFA`}
            color="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          />
        </div>

        {/* ── Filters ────────────────────────────────────────── */}
        <div className="ik-filter-bar">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par référence, ID utilisateur…"
                className="ik-input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Status */}
            <select className="ik-input w-full lg:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous statuts</option>
              <option value="1">Complété</option>
              <option value="0">En attente</option>
              <option value="-1">Échoué</option>
            </select>

            {/* Method */}
            <select className="ik-input w-full lg:w-44" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              <option value="all">Toutes méthodes</option>
              <option value="wallet">Portefeuille</option>
              <option value="card">Carte</option>
              <option value="mobile_money">Mobile Money</option>
            </select>

            {/* Motif */}
            <select className="ik-input w-full lg:w-48" value={motifFilter} onChange={(e) => setMotifFilter(e.target.value)}>
              <option value="all">Tous les types</option>
              <option value="1">Dépôt portefeuille</option>
              <option value="9">Paiement réservation</option>
              <option value="2">Abonnement</option>
              <option value="3">Commande</option>
            </select>
          </div>

          {(statusFilter !== 'all' || methodFilter !== 'all' || motifFilter !== 'all' || search) && (
            <div className="flex items-center gap-2 mt-3 text-xs ik-muted">
              <Filter className="h-3.5 w-3.5" />
              <span>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''} sur {transactions.length}</span>
              <button
                className="ml-auto text-ikigai-teal hover:underline"
                onClick={() => { setSearch(''); setStatusFilter('all'); setMethodFilter('all'); setMotifFilter('all') }}
              >
                Réinitialiser
              </button>
            </div>
          )}
        </div>

        {/* ── Table ──────────────────────────────────────────── */}
        <div className="ik-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="ik-th">Réf</th>
                  <th className="ik-th">Payeur</th>
                  <th className="ik-th">Destinataire</th>
                  <th className="ik-th">Type</th>
                  <th className="ik-th">Montant</th>
                  <th className="ik-th">Méthode</th>
                  <th className="ik-th">Statut</th>
                  <th className="ik-th">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Inbox className="h-10 w-10 mx-auto ik-muted mb-3" />
                      <p className="ik-muted text-sm">Aucune transaction trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => {
                    const sMeta = STATUS_META[tx.status] ?? STATUS_META[-1]
                    const mMeta = METHOD_META[tx.paymentMethod] ?? { label: tx.paymentMethod, Icon: CreditCard, color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' }
                    const MethodIcon = mMeta.Icon

                    return (
                      <tr key={tx.id} className="ik-tr-hover border-b border-gray-50 dark:border-gray-800/50">
                        {/* Ref */}
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-mono ik-muted block truncate max-w-[140px]" title={tx.transactionRef}>
                            {tx.transactionRef}
                          </span>
                          {tx.bookingId && (
                            <span className="text-[10px] ik-muted">Résa #{tx.bookingId}</span>
                          )}
                        </td>

                        {/* From user */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-ikigai-primary/10 dark:bg-ikigai-teal/10 flex items-center justify-center flex-shrink-0">
                              <Users className="h-3.5 w-3.5 text-ikigai-primary dark:text-ikigai-teal" />
                            </div>
                            <span className="text-sm font-medium ik-heading">#{tx.fromUserId}</span>
                          </div>
                        </td>

                        {/* To user (provider) */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4 ik-muted flex-shrink-0" />
                            <span className="text-sm ik-heading">
                              {tx.fromUserId === tx.toUserId ? <span className="ik-muted italic">Soi-même</span> : `#${tx.toUserId}`}
                            </span>
                          </div>
                        </td>

                        {/* Motif */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium ik-heading">
                            {tx.transactionMotifId === 1 ? (
                              <ArrowDownRight className="h-3.5 w-3.5 text-blue-500" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                            )}
                            {MOTIF_LABELS[tx.transactionMotifId] ?? `Motif #${tx.transactionMotifId}`}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-3.5 text-sm font-semibold ik-heading">
                          {fmtAmount(tx.amount)} <span className="text-xs font-normal ik-muted">FCFA</span>
                        </td>

                        {/* Method */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${mMeta.color}`}>
                            <MethodIcon className="h-3.5 w-3.5" />
                            {mMeta.label}
                          </span>
                          {tx.paymentProvider && (
                            <span className="block text-[10px] ik-muted mt-0.5 capitalize">{tx.paymentProvider}</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sMeta.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${sMeta.dot}`} />
                            {sMeta.label}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5">
                          <span className="text-sm ik-heading whitespace-nowrap">{fmtDateTime(tx.createdAt)}</span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs ik-muted">
              <span>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
              <span>
                Volume filtré :{' '}
                <strong className="ik-heading">
                  {fmtAmount(filtered.reduce((s, t) => s + (t.status === 1 ? t.amount : 0), 0))} FCFA
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({ icon: Icon, label, value, color }: { icon: typeof Banknote; label: string; value: string; color: string }) {
  return (
    <div className="ik-stat">
      <div className={`ik-stat-icon ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold ik-heading truncate">{value}</p>
        <p className="text-xs ik-muted">{label}</p>
      </div>
    </div>
  )
}
