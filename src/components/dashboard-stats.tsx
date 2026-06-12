'use client'

import { useState, useEffect } from 'react'
import { Users, Store, Scissors, Calendar, TrendingUp, DollarSign } from 'lucide-react'
import { API_BASE_URL } from '@/services/api'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
          {change && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const pad = (n: number) => n.toString().padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return { startDate: fmt(start), endDate: fmt(end) }
}

export function DashboardStats() {
  const [providersCount, setProvidersCount] = useState<number | null>(null)
  const [shopsCount, setShopsCount] = useState<number | null>(null)
  const [servicesCount, setServicesCount] = useState<number | null>(null)
  const [bookingsCount, setBookingsCount] = useState<number | null>(null)
  const [revenue, setRevenue] = useState<number | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('ikigai_token') : null
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
        const { startDate, endDate } = getMonthRange()

        const [providersRes, shopsRes, servicesRes, bookingsRes, revenueRes] = await Promise.all([
          fetch(`${API_BASE_URL}/proownners/stats/count`, { headers }),
          fetch(`${API_BASE_URL}/shops/stats/count`, { headers }),
          fetch(`${API_BASE_URL}/services/stats/count`, { headers }),
          fetch(`${API_BASE_URL}/bookings/stats/count?startDate=${startDate}&endDate=${endDate}`, { headers }),
          fetch(`${API_BASE_URL}/bookings/stats/revenue?startDate=${startDate}&endDate=${endDate}`, { headers }),
        ])

        const [providersData, shopsData, servicesData, bookingsData, revenueData] = await Promise.all([
          providersRes.ok ? providersRes.json() : { count: 0 },
          shopsRes.ok ? shopsRes.json() : { count: 0 },
          servicesRes.ok ? servicesRes.json() : { count: 0 },
          bookingsRes.ok ? bookingsRes.json() : { count: 0 },
          revenueRes.ok ? revenueRes.json() : { revenue: 0 },
        ])

        setProvidersCount(providersData.count ?? 0)
        setShopsCount(shopsData.count ?? 0)
        setServicesCount(servicesData.count ?? 0)
        setBookingsCount(bookingsData.count ?? 0)
        setRevenue(revenueData.revenue ?? 0)
      } catch (err) {
        setStatsError(err instanceof Error ? err.message : 'Failed to load stats')
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const formatValue = (v: number | null) => {
    if (statsLoading) return '...'
    if (statsError) return '—'
    return (v ?? 0).toLocaleString()
  }

  const formatCurrency = (v: number | null) => {
    if (statsLoading) return '...'
    if (statsError) return '—'
    return `${(v ?? 0).toLocaleString()} FCFA`
  }

  const stats = [
    {
      title: 'Total Providers',
      value: formatValue(providersCount),
      change: '',
      icon: Users,
      color: 'bg-ikigai-primary'
    },
    {
      title: 'Active Shops',
      value: formatValue(shopsCount),
      change: '',
      icon: Store,
      color: 'bg-ikigai-secondary'
    },
    {
      title: 'Total Services',
      value: formatValue(servicesCount),
      change: '',
      icon: Scissors,
      color: 'bg-ikigai-accent'
    },
    {
      title: 'Monthly Bookings',
      value: formatValue(bookingsCount),
      change: '',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(revenue),
      change: '',
      icon: DollarSign,
      color: 'bg-yellow-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}
