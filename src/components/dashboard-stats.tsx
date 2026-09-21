'use client'

import { ArrowDown, ArrowUp, CalendarDays, Coins, Scissors, Store, Users, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sparkline } from '@/components/ui/sparkline'
import { formatFcfa, formatNumber, useCount, useMonthlySeries, type MonthPoint } from '@/lib/dashboard-data'

const TONES = {
  teal: {
    icon: 'bg-stat-teal-soft text-stat-teal dark:bg-stat-teal-line/15 dark:text-stat-teal-line',
    line: 'text-stat-teal-line',
  },
  green: {
    icon: 'bg-stat-green-soft text-stat-green dark:bg-stat-green-line/15 dark:text-stat-green-line',
    line: 'text-stat-green-line',
  },
  purple: {
    icon: 'bg-stat-purple-soft text-stat-purple dark:bg-stat-purple-line/15 dark:text-stat-purple-line',
    line: 'text-stat-purple-line',
  },
  rose: {
    icon: 'bg-stat-rose-soft text-stat-rose dark:bg-stat-rose-line/15 dark:text-stat-rose-line',
    line: 'text-stat-rose-line',
  },
  amber: {
    icon: 'bg-stat-amber-soft text-stat-amber dark:bg-stat-amber-line/15 dark:text-stat-amber-line',
    line: 'text-stat-amber-line',
  },
}

interface Delta {
  text: string
  direction: 'up' | 'down'
}

interface StatCardProps {
  title: string
  /** undefined while loading */
  value?: string
  icon: LucideIcon
  tone: keyof typeof TONES
  delta?: Delta | null
  series?: number[]
}

function StatCard({ title, value, icon: Icon, tone, delta, series }: StatCardProps) {
  const t = TONES[tone]
  return (
    <div className="relative flex items-start gap-3.5 rounded-xl border border-border bg-card p-4 shadow-card">
      <span className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-full', t.icon)}>
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-foreground">{title}</p>
        <p className="mt-1.5 h-7 text-2xl font-bold leading-7 tabular-nums text-foreground">
          {value ?? <span className="inline-block h-6 w-14 animate-pulse rounded-md bg-muted align-middle" />}
        </p>
        {/* Reserved height keeps the numbers aligned across cards that have no delta */}
        <p
          className={cn(
            'mt-2 flex h-4 items-center gap-1 text-xs font-semibold',
            delta?.direction === 'down' ? 'text-negative dark:text-rose-400' : 'text-positive dark:text-emerald-400',
          )}
        >
          {delta &&
            (delta.direction === 'up' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />)}
          {delta?.text}
        </p>
      </div>
      {series && <Sparkline data={series} className={cn('absolute bottom-4 right-4 h-8 w-[76px]', t.line)} />}
    </div>
  )
}

const values = (s: MonthPoint[]) => s.map((p) => p.value)

/** This month vs last month, from the monthly series. */
function lastTwo(s: MonthPoint[] | null) {
  if (!s || s.length < 2) return null
  return { cur: s[s.length - 1].value, prev: s[s.length - 2].value }
}

function bookingsDelta(s: MonthPoint[] | null): Delta | null {
  const m = lastTwo(s)
  if (!m || m.cur === m.prev) return null
  const diff = m.cur - m.prev
  return { text: `${diff > 0 ? '+' : ''}${formatNumber(diff)} ce mois`, direction: diff > 0 ? 'up' : 'down' }
}

function revenueDelta(s: MonthPoint[] | null): Delta | null {
  const m = lastTwo(s)
  if (!m || m.cur === m.prev) return null
  if (m.prev === 0) return { text: 'Nouveau ce mois', direction: 'up' }
  const pct = Math.round(((m.cur - m.prev) / m.prev) * 100)
  return pct === 0 ? null : { text: `${pct > 0 ? '+' : ''}${pct}% ce mois`, direction: pct > 0 ? 'up' : 'down' }
}

export function DashboardStats() {
  const providers = useCount('proownners/stats/count')
  const shops = useCount('shops/stats/count')
  const services = useCount('services/stats/count')
  const revenue = useMonthlySeries('revenue', 6)
  const bookings = useMonthlySeries('bookings', 6)

  const count = (c: { value: number | null; failed: boolean; loading: boolean }) =>
    c.loading ? undefined : c.failed ? '—' : formatNumber(c.value ?? 0)
  const monthly = (
    s: { data: MonthPoint[] | null; failed: boolean; loading: boolean },
    format: (n: number) => string,
  ) => (s.loading ? undefined : s.failed || !s.data ? '—' : format(s.data[s.data.length - 1].value))

  // Providers / shops / services only expose all-time totals (no per-month figures), so those
  // cards carry no delta or trend line rather than an invented one.
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4">
      <StatCard title="Total prestataires" value={count(providers)} icon={Users} tone="teal" />
      <StatCard title="Boutiques actives" value={count(shops)} icon={Store} tone="green" />
      <StatCard title="Total services" value={count(services)} icon={Scissors} tone="purple" />
      <StatCard
        title="Réservations mensuelles"
        value={monthly(bookings, formatNumber)}
        icon={CalendarDays}
        tone="rose"
        delta={bookingsDelta(bookings.data)}
        series={bookings.data ? values(bookings.data) : undefined}
      />
      <StatCard
        title="Chiffre d'affaires mensuel"
        value={monthly(revenue, formatFcfa)}
        icon={Coins}
        tone="amber"
        delta={revenueDelta(revenue.data)}
        series={revenue.data ? values(revenue.data) : undefined}
      />
    </div>
  )
}
