'use client'

import { useState, useEffect } from 'react'
import { Users, Store, Scissors, Calendar, TrendingUp, DollarSign } from 'lucide-react'

const API_BASE = 'http://168.231.101.119:4040'

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

export function DashboardStats() {
  const [providersCount, setProvidersCount] = useState<number | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProvidersCount = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('ikigai_token') : null
        const headers: HeadersInit = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        const res = await fetch(`${API_BASE}/proownners/count`, { headers })
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`)
        const data = await res.json()
        const count = typeof data === 'number' ? data : data?.count ?? data?.total ?? 0
        setProvidersCount(count)
      } catch (err) {
        setStatsError(err instanceof Error ? err.message : 'Failed to load stats')
        setProvidersCount(0)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchProvidersCount()
  }, [])

  const stats = [
    {
      title: 'Total Providers',
      value: statsLoading ? '...' : statsError ? '—' : (providersCount ?? 0).toLocaleString(),
      change: '+12% from last month',
      icon: Users,
      color: 'bg-ikigai-primary'
    },
    {
      title: 'Active Shops',
      value: '89',
      change: '+5% from last month',
      icon: Store,
      color: 'bg-ikigai-secondary'
    },
    {
      title: 'Total Services',
      value: '2,456',
      change: '+8% from last month',
      icon: Scissors,
      color: 'bg-ikigai-accent'
    },
    {
      title: 'Monthly Bookings',
      value: '5,678',
      change: '+15% from last month',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Monthly Revenue',
      value: '$45,678',
      change: '+22% from last month',
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
