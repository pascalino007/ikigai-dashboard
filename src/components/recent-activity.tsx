'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarDays, ChevronRight, Clock, Store, User, Wallet } from 'lucide-react'
import { API_BASE_URL } from '@/services/api'
import { cn } from '@/lib/utils'
import { formatFcfa } from '@/lib/dashboard-data'

interface Booking {
  id: number
  user_id: string
  provider_id: string
  booking_date: string
  booking_time: string
  booking_status: number
  service_name?: string
  client_name?: string
  shop_name?: string
  amount: number
  created_at?: string
}

// Decorative only — bookings carry no per-row type, so the icons just vary the list.
const ICONS = [User, Store, Wallet, CalendarDays]

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (Number.isNaN(seconds)) return ''
  if (seconds < 60) return "À l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  const weeks = Math.floor(days / 7)
  return `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`
}

const POSITIVE = 'bg-positive-soft text-positive dark:bg-emerald-500/10 dark:text-emerald-400'
const NEGATIVE = 'bg-negative-soft text-negative dark:bg-rose-500/10 dark:text-rose-400'

const STATUS: Record<number, { label: string; className: string }> = {
  0: { label: 'En attente', className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  1: { label: 'Confirmée', className: POSITIVE },
  2: { label: 'Annulée', className: NEGATIVE },
  3: { label: 'Paiement échoué', className: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' },
  4: { label: 'En cours', className: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' },
  5: { label: 'Complété', className: POSITIVE },
  6: { label: 'Absent', className: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' },
}
const UNKNOWN_STATUS = { label: 'Inconnu', className: 'bg-muted text-muted-foreground' }

export function RecentActivity() {
  const [activities, setActivities] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('ikigai_token') : null
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await fetch(`${API_BASE_URL}/bookings?limit=4`, { headers })
        if (!res.ok) throw new Error(`Failed (${res.status})`)
        const json = await res.json()
        setActivities(json.data ?? [])
      } catch {
        setFailed(true)
      } finally {
        setLoading(false)
      }
    }
    fetchRecent()
  }, [])

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-2 flex items-center gap-3">
        <Clock className="h-5 w-5 text-ikigai-primary dark:text-ikigai-teal" strokeWidth={2.25} />
        <h3 className="text-lg font-bold text-foreground">Activité récente</h3>
        <Link
          href="/bookings"
          className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-ikigai-primary dark:hover:text-ikigai-teal"
        >
          Voir tout <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 py-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted/60" />
          ))}
        </div>
      ) : failed ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Impossible de charger l&apos;activité.</div>
      ) : activities.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">Aucune activité récente</div>
      ) : (
        <ul className="divide-y divide-border">
          {activities.map((booking, i) => {
            const Icon = ICONS[i % ICONS.length]
            const status = STATUS[booking.booking_status] ?? UNKNOWN_STATUS
            return (
              <li key={booking.id}>
                <Link href="/bookings" className="group flex items-center gap-3.5 py-3.5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card text-ikigai-primary dark:text-ikigai-teal">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-foreground">
                      {booking.client_name ?? `Client #${booking.user_id}`}
                    </p>
                    <p className="truncate text-xs text-ikigai-primary/70 dark:text-ikigai-teal/80">
                      {booking.service_name ?? 'Service'} — {formatFcfa(booking.amount ?? 0)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {timeAgo(`${booking.booking_date}T${booking.booking_time}`)}
                    </p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold', status.className)}>
                    {status.label}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
