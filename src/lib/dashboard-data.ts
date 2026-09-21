import { useEffect, useState } from 'react'
import { API_BASE_URL } from '@/services/api'

export interface MonthPoint {
  label: string
  value: number
}

type SeriesKind = 'revenue' | 'bookings'

const ENDPOINTS: Record<SeriesKind, { path: string; field: string }> = {
  revenue: { path: 'bookings/stats/revenue', field: 'revenue' },
  bookings: { path: 'bookings/stats/count', field: 'count' },
}

export const formatNumber = (n: number) => n.toLocaleString('fr-FR')
export const formatFcfa = (n: number) => `${formatNumber(n)} FCFA`

const pad = (n: number) => n.toString().padStart(2, '0')
const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** `offset` months before the current one. */
function monthWindow(offset: number) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1)
  const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0)
  return {
    label: start.toLocaleString('fr-FR', { month: 'short', year: '2-digit' }),
    startDate: fmtDate(start),
    endDate: fmtDate(end),
  }
}

async function fetchSeries(kind: SeriesKind, months: number): Promise<MonthPoint[]> {
  const token = localStorage.getItem('ikigai_token')
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
  const { path, field } = ENDPOINTS[kind]

  return Promise.all(
    Array.from({ length: months }, async (_, i) => {
      const { label, startDate, endDate } = monthWindow(months - 1 - i)
      const res = await fetch(`${API_BASE_URL}/${path}?startDate=${startDate}&endDate=${endDate}`, { headers })
      // A failed month is an error, not a zero — otherwise a 401 reads as "no revenue".
      if (!res.ok) throw new Error(`${path} failed (${res.status})`)
      const json = await res.json()
      return { label, value: Number(json?.[field] ?? 0) }
    }),
  )
}

// The stat-card sparklines and the revenue chart ask for the same 6 months, and every page
// re-creates the layout on navigation — share in-flight requests and keep results briefly.
const TTL_MS = 60_000
const cache = new Map<string, { at: number; promise: Promise<MonthPoint[]> }>()

export function getMonthlySeries(kind: SeriesKind, months: number): Promise<MonthPoint[]> {
  const key = `${kind}:${months}`
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.promise

  const promise = fetchSeries(kind, months)
  cache.set(key, { at: Date.now(), promise })
  promise.catch(() => cache.delete(key))
  return promise
}

export function useMonthlySeries(kind: SeriesKind, months: number) {
  const [state, setState] = useState<{ data: MonthPoint[] | null; failed: boolean }>({ data: null, failed: false })

  useEffect(() => {
    let alive = true
    setState({ data: null, failed: false })
    getMonthlySeries(kind, months)
      .then((data) => alive && setState({ data, failed: false }))
      .catch(() => alive && setState({ data: null, failed: true }))
    return () => {
      alive = false
    }
  }, [kind, months])

  return { data: state.data, failed: state.failed, loading: !state.data && !state.failed }
}

/** Total for a "stats/count" endpoint (admin/manager only). */
export function useCount(path: string) {
  const [state, setState] = useState<{ value: number | null; failed: boolean }>({ value: null, failed: false })

  useEffect(() => {
    let alive = true
    const token = localStorage.getItem('ikigai_token')
    fetch(`${API_BASE_URL}/${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => {
        if (!res.ok) throw new Error(`${path} failed (${res.status})`)
        return res.json()
      })
      .then((json) => alive && setState({ value: Number(json?.count ?? 0), failed: false }))
      .catch(() => alive && setState({ value: null, failed: true }))
    return () => {
      alive = false
    }
  }, [path])

  return { value: state.value, failed: state.failed, loading: state.value === null && !state.failed }
}
