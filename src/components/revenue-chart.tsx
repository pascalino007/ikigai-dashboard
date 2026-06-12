'use client'

import { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import { API_BASE_URL } from '@/services/api'

function getMonthLabel(offset: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - offset)
  return d.toLocaleString('default', { month: 'short', year: '2-digit' })
}

function getMonthRange(offset: number) {
  const d = new Date()
  d.setMonth(d.getMonth() - offset)
  const year = d.getFullYear()
  const month = d.getMonth()
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const fmt = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return { startDate: fmt(start), endDate: fmt(end) }
}

export function RevenueChart() {
  const [data, setData] = useState<{ label: string; revenue: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('ikigai_token') : null
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

        const months = Array.from({ length: 6 }, (_, i) => ({
          label: getMonthLabel(5 - i),
          ...getMonthRange(5 - i),
        }))

        const results = await Promise.all(
          months.map(async (m) => {
            const res = await fetch(
              `${API_BASE_URL}/bookings/stats/revenue?startDate=${m.startDate}&endDate=${m.endDate}`,
              { headers }
            )
            const json = res.ok ? await res.json() : { revenue: 0 }
            return { label: m.label, revenue: json.revenue ?? 0 }
          })
        )

        setData(results)
      } catch {
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchRevenue()
  }, [])

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Revenue Overview</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading revenue data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Revenue Overview</h3>
        <div className="flex items-center text-green-600 dark:text-green-400">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">{totalRevenue.toLocaleString()} FCFA</span>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-2">
        {data.map((item) => {
          const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0
          return (
            <div key={item.label} className="flex flex-col items-center flex-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {item.revenue > 0 ? `${(item.revenue / 1000).toFixed(0)}k` : '0'}
              </div>
              <div
                className="w-full bg-ikigai-primary rounded-t transition-all duration-700 ease-out"
                style={{ height: `${Math.max(heightPercent, 4)}%` }}
                title={`${item.label}: ${item.revenue.toLocaleString()} FCFA`}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{item.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
