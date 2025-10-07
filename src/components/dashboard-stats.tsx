'use client'

import { Users, Store, Scissors, Calendar, TrendingUp, DollarSign } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 flex items-center">
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
  const stats = [
    {
      title: 'Total Providers',
      value: '1,234',
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
