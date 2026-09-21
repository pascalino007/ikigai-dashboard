'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp, BarChart3, ChevronDown } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatFcfa, formatNumber, useMonthlySeries } from '@/lib/dashboard-data'

// recharts takes plain colour strings, not Tailwind classes: [top, bottom] of each bar's gradient.
const BAR_PAST = ['#2B969E', '#1B7884']
const BAR_CURRENT = ['#125F6E', '#074353']

const PERIODS = [3, 6, 12]

function ChartTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null
  const { label, value } = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{formatFcfa(value)}</p>
    </div>
  )
}

export function RevenueChart() {
  const [months, setMonths] = useState(6)
  const { data, loading, failed } = useMonthlySeries('revenue', months)

  const last = data ? data.length - 1 : -1
  const diff = data && data.length >= 2 ? data[last].value - data[last - 1].value : 0

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <BarChart3 className="h-5 w-5 text-ikigai-primary dark:text-ikigai-teal" strokeWidth={2.25} />
        <h3 className="text-lg font-bold text-foreground">Aperçu des revenus</h3>

        <div className="ml-auto flex items-center gap-3">
          {diff !== 0 && (
            <div
              className={
                diff > 0
                  ? 'rounded-lg bg-positive-soft px-3 py-1.5 text-center text-positive dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'rounded-lg bg-negative-soft px-3 py-1.5 text-center text-negative dark:bg-rose-500/10 dark:text-rose-400'
              }
            >
              <p className="flex items-center justify-center gap-1 text-[13px] font-bold leading-tight">
                {diff > 0 ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                {formatFcfa(Math.abs(diff))}
              </p>
              <p className="text-[11px] leading-tight opacity-80">vs mois dernier</p>
            </div>
          )}

          <div className="relative">
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              aria-label="Période"
              className="h-9 appearance-none rounded-lg border border-border bg-card pl-3 pr-8 text-xs font-medium text-foreground focus:border-ikigai-primary/40 focus:outline-none focus:ring-2 focus:ring-ikigai-primary/15"
            >
              {PERIODS.map((p) => (
                <option key={p} value={p}>
                  {p} derniers mois
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="h-[260px]">
        {loading ? (
          <div className="h-full animate-pulse rounded-lg bg-muted/60" />
        ) : failed || !data ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Impossible de charger les revenus.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bar-past" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BAR_PAST[0]} />
                  <stop offset="100%" stopColor={BAR_PAST[1]} />
                </linearGradient>
                <linearGradient id="bar-current" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BAR_CURRENT[0]} />
                  <stop offset="100%" stopColor={BAR_CURRENT[1]} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={52}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(v: number) => formatNumber(v)}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.6 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={72} isAnimationActive={false}>
                {data.map((_, i) => (
                  <Cell key={i} fill={`url(#${i === last ? 'bar-current' : 'bar-past'})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
