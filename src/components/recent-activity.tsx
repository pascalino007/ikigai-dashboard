'use client'

import { useState, useEffect } from 'react'
import { Clock, User, Scissors, MapPin } from 'lucide-react'
import { API_BASE_URL } from '@/services/api'

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

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  const weeks = Math.floor(days / 7)
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`
}

function statusLabel(status: number): string {
  switch (status) {
    case 0: return 'Pending'
    case 1: return 'Confirmed'
    case 2: return 'Cancelled'
    case 3: return 'Payment Failed'
    case 4: return 'In Progress'
    case 5: return 'Completed'
    case 6: return 'No Show'
    default: return 'Unknown'
  }
}

function statusColor(status: number): string {
  switch (status) {
    case 0: return 'bg-yellow-100 text-yellow-800'
    case 1: return 'bg-green-100 text-green-800'
    case 2: return 'bg-red-100 text-red-800'
    case 3: return 'bg-orange-100 text-orange-800'
    case 4: return 'bg-blue-100 text-blue-800'
    case 5: return 'bg-gray-100 text-gray-800'
    case 6: return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('ikigai_token') : null
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await fetch(`${API_BASE_URL}/bookings?limit=5`, { headers })
        if (!res.ok) throw new Error(`Failed (${res.status})`)
        const json = await res.json()
        setActivities(json.data ?? [])
      } catch {
        setActivities([])
      } finally {
        setLoading(false)
      }
    }
    fetchRecent()
  }, [])

  const getIcon = () => <Clock className="h-4 w-4" />

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No recent activity</div>
        ) : (
          activities.map((booking) => (
            <div key={booking.id} className="px-6 py-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-ikigai-light flex items-center justify-center">
                    {getIcon()}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {booking.client_name ?? `Client #${booking.user_id}`}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(booking.booking_status)}`}>
                      {statusLabel(booking.booking_status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {booking.service_name ?? 'Service'} — {booking.amount.toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {timeAgo(`${booking.booking_date}T${booking.booking_time}`)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
