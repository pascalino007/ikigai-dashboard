'use client'

import { Clock, User, Scissors, MapPin } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'booking' | 'provider' | 'shop'
  title: string
  description: string
  time: string
  status?: string
}

export function RecentActivity() {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'booking',
      title: 'New Booking',
      description: 'Sarah Johnson booked a haircut with John Smith',
      time: '2 minutes ago',
      status: 'confirmed'
    },
    {
      id: '2',
      type: 'provider',
      title: 'New Provider',
      description: 'Maria Garcia joined as a makeup artist',
      time: '1 hour ago',
      status: 'active'
    },
    {
      id: '3',
      type: 'shop',
      title: 'New Shop',
      description: 'Beauty Studio opened in Downtown',
      time: '3 hours ago',
      status: 'active'
    },
    {
      id: '4',
      type: 'booking',
      title: 'Booking Completed',
      description: 'Mike Wilson completed his appointment',
      time: '5 hours ago',
      status: 'completed'
    },
    {
      id: '5',
      type: 'provider',
      title: 'Provider Updated',
      description: 'Lisa Brown updated her services',
      time: '1 day ago',
      status: 'updated'
    }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Clock className="h-4 w-4" />
      case 'provider':
        return <User className="h-4 w-4" />
      case 'shop':
        return <MapPin className="h-4 w-4" />
      default:
        return <Scissors className="h-4 w-4" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'updated':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="px-6 py-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-ikigai-light flex items-center justify-center">
                  {getIcon(activity.type)}
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  {activity.status && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
