'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Store,
  Users,
  ArrowRight,
  CreditCard,
  CalendarCheck,
  CalendarX,
  Loader2,
  Inbox,
  Filter,
  Eye,
  Tag,
  Phone,
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

interface Booking {
  id: number
  userId: number
  providerId: number
  serviceId: number
  bookingDate: string
  bookingTime: string
  bookingStatus: BookingStatus
  paymentStatus: number
  amount: number
  currency: string
  serviceName?: string | null
  clientName?: string | null
  clientPhone?: string | null
  shopName?: string | null
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const STATUS_META: Record<BookingStatus, { label: string; badge: string; dot: string; Icon: typeof CheckCircle2 }> = {
  confirmed: {
    label: 'Confirmé',
    badge: 'ik-badge-green',
    dot: 'bg-green-500',
    Icon: CheckCircle2,
  },
  pending: {
    label: 'En attente',
    badge: 'ik-badge-amber',
    dot: 'bg-amber-500',
    Icon: AlertCircle,
  },
  cancelled: {
    label: 'Annulé',
    badge: 'ik-badge-red',
    dot: 'bg-red-500',
    Icon: XCircle,
  },
}

function convertStatus(raw: number): BookingStatus {
  switch (raw) {
    case 1: return 'confirmed'
    case 2: case 3: return 'cancelled'
    default: return 'pending'
  }
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return iso }
}

function fmtTime(raw: string) {
  if (/^\d{1,2}:\d{2}/.test(raw)) return raw
  try {
    return new Date(raw).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch { return raw }
}

function fmtAmount(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  /* ── Fetch ────────────────────────────────────────────────────── */
  useEffect(() => {
    ;(async () => {
      try {
        const token = localStorage.getItem('ikigai_token')
        const res = await fetch(`${API_BASE_URL}/bookings`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        })
        if (!res.ok) throw new Error('fetch failed')
        const payload = await res.json()
        const rawList = Array.isArray(payload) ? payload : (payload.data ?? [])

        setBookings(
          rawList.map((b: any) => ({
            id: b.id,
            userId: b.user_id,
            providerId: b.provider_id,
            serviceId: b.service_id,
            bookingDate: b.booking_date ?? '',
            bookingTime: b.booking_time ?? '',
            bookingStatus: convertStatus(b.booking_status),
            paymentStatus: b.payement_status ?? 0,
            amount: b.amount ?? 0,
            currency: b.currency ?? 'XOF',
            serviceName: b.service_name ?? b.service?.name ?? null,
            clientName: b.client_name ?? (b.user ? `${b.user.firstname ?? ''} ${b.user.lastname ?? ''}`.trim() || null : null),
            clientPhone: b.client_phone ?? b.user?.phone ?? null,
            shopName: b.shop_name ?? b.shop?.name ?? null,
          }))
        )
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  /* ── Derived ──────────────────────────────────────────────────── */
  const providerIds = useMemo(() => {
    const s = new Set<number>()
    bookings.forEach((b) => s.add(b.providerId))
    const arr: number[] = []
    s.forEach((v) => arr.push(v))
    return arr.sort()
  }, [bookings])

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (search) {
        const q = search.toLowerCase()
        const match =
          String(b.id).includes(q) ||
          String(b.userId).includes(q) ||
          String(b.providerId).includes(q) ||
          (b.clientName?.toLowerCase() ?? '').includes(q) ||
          (b.serviceName?.toLowerCase() ?? '').includes(q) ||
          (b.shopName?.toLowerCase() ?? '').includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all' && b.bookingStatus !== statusFilter) return false
      if (providerFilter !== 'all' && String(b.providerId) !== providerFilter) return false
      if (dateFrom && b.bookingDate < dateFrom) return false
      if (dateTo && b.bookingDate > dateTo) return false
      return true
    })
  }, [bookings, search, statusFilter, providerFilter, dateFrom, dateTo])

  const counts = useMemo(() => {
    const c = { total: bookings.length, pending: 0, confirmed: 0, cancelled: 0, revenue: 0 }
    bookings.forEach((b) => {
      c[b.bookingStatus]++
      if (b.bookingStatus === 'confirmed') c.revenue += b.amount
    })
    return c
  }, [bookings])

  /* ── Loading state ────────────────────────────────────────────── */
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
            <h1 className="text-2xl font-bold ik-heading">Réservations</h1>
            <p className="ik-muted text-sm mt-1">Vue d&apos;ensemble des réservations clients</p>
          </div>
          <Link href="/payments">
            <Button variant="outline" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Voir les transactions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* ── Stat cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Calendar} label="Total" value={counts.total} color="bg-ikigai-primary/10 text-ikigai-primary dark:bg-ikigai-teal/10 dark:text-ikigai-teal" />
          <StatCard icon={AlertCircle} label="En attente" value={counts.pending} color="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" />
          <StatCard icon={CalendarCheck} label="Confirmés" value={counts.confirmed} color="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400" />
          <StatCard icon={CalendarX} label="Annulés" value={counts.cancelled} color="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" />
        </div>

        {/* ── Filters ────────────────────────────────────────── */}
        <div className="ik-filter-bar">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par client, service ou prestataire…"
                className="ik-input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Status */}
            <select className="ik-input w-full lg:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="cancelled">Annulé</option>
            </select>

            {/* Provider */}
            <select className="ik-input w-full lg:w-44" value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}>
              <option value="all">Tous les prestataires</option>
              {providerIds.map((id) => {
                const b = bookings.find((b) => String(b.providerId) === String(id))
                const label = b?.shopName ? `${b.shopName} (#${id})` : `Prestataire #${id}`
                return (
                  <option key={id} value={id}>{label}</option>
                )
              })}
            </select>

            {/* Date range */}
            <div className="flex gap-2">
              <input type="date" className="ik-input w-full lg:w-40" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title="Date début" />
              <input type="date" className="ik-input w-full lg:w-40" value={dateTo} onChange={(e) => setDateTo(e.target.value)} title="Date fin" />
            </div>
          </div>

          {/* Active filter count */}
          {(statusFilter !== 'all' || providerFilter !== 'all' || dateFrom || dateTo || search) && (
            <div className="flex items-center gap-2 mt-3 text-xs ik-muted">
              <Filter className="h-3.5 w-3.5" />
              <span>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''} sur {bookings.length}</span>
              <button
                className="ml-auto text-ikigai-teal hover:underline"
                onClick={() => { setSearch(''); setStatusFilter('all'); setProviderFilter('all'); setDateFrom(''); setDateTo('') }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* ── Package Cards ────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 py-16 text-center shadow-sm">
            <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Aucune réservation trouvée</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || statusFilter !== 'all' || providerFilter !== 'all' || dateFrom || dateTo
                ? 'Modifiez vos filtres.'
                : 'Les réservations apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((b) => {
              const meta = STATUS_META[b.bookingStatus]
              const headerColor =
                b.bookingStatus === 'confirmed'
                  ? 'bg-green-500'
                  : b.bookingStatus === 'cancelled'
                    ? 'bg-red-500'
                    : 'bg-amber-500'
              return (
                <div
                  key={b.id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className={`h-24 ${headerColor} flex items-center justify-center relative`}>
                    <span className="text-2xl font-bold text-white">#{b.id}</span>
                    <span
                      className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-white/90 backdrop-blur`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      <span className={b.bookingStatus === 'confirmed' ? 'text-green-700' : b.bookingStatus === 'cancelled' ? 'text-red-700' : 'text-amber-700'}>
                        {meta.label}
                      </span>
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-3 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {b.clientName ?? `Client #${b.userId}`}
                      </span>
                    </div>
                    {b.clientPhone && (
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{b.clientPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <Store className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {b.shopName ?? `Prestataire #${b.providerId}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {b.serviceName ?? `Service #${b.serviceId}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {fmtDate(b.bookingDate)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      <Clock className="h-3.5 w-3.5" />
                      {fmtTime(b.bookingTime)}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {b.amount > 0 ? `${fmtAmount(b.amount)} ${b.currency}` : '—'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${b.paymentStatus === 1 ? 'ik-badge-green' : 'ik-badge-gray'}`}
                      >
                        {b.paymentStatus === 1 ? 'Payé' : 'Non payé'}
                      </span>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 dark:border-gray-800">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        Détails
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1 text-ikigai-primary">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmer
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer summary */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between text-xs ik-muted">
            <span>{filtered.length} réservation{filtered.length !== 1 ? 's' : ''}</span>
            <span>Revenu confirmé : <strong className="ik-heading">{fmtAmount(counts.revenue)} FCFA</strong></span>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */
function StatCard({ icon: Icon, label, value, color }: { icon: typeof Calendar; label: string; value: number; color: string }) {
  return (
    <div className="ik-stat">
      <div className={`ik-stat-icon ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold ik-heading">{value}</p>
        <p className="text-xs ik-muted">{label}</p>
      </div>
    </div>
  )
}
