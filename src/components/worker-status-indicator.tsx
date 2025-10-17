'use client'

import { useState, useEffect } from 'react'
import { Clock, Wifi, WifiOff } from 'lucide-react'

interface WorkerStatusIndicatorProps {
  workerId: string
  status: 'available' | 'busy' | 'break' | 'offline'
  lastSeen?: Date
  isOnline?: boolean
  className?: string
}

export function WorkerStatusIndicator({ 
  workerId, 
  status, 
  lastSeen, 
  isOnline = true,
  className = '' 
}: WorkerStatusIndicatorProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'busy': return 'bg-red-500'
      case 'break': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available'
      case 'busy': return 'Busy'
      case 'break': return 'On Break'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  const getTimeSinceLastSeen = () => {
    if (!lastSeen) return 'Never'
    
    const diffInSeconds = Math.floor((currentTime.getTime() - lastSeen.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Status Dot */}
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
        {isOnline && (
          <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${getStatusColor(status)} animate-pulse`} />
        )}
      </div>

      {/* Status Text */}
      <span className="text-sm font-medium text-gray-700">
        {getStatusText(status)}
      </span>

      {/* Online/Offline Indicator */}
      <div className="flex items-center">
        {isOnline ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-gray-400" />
        )}
      </div>

      {/* Last Seen */}
      {lastSeen && (
        <span className="text-xs text-gray-500">
          {getTimeSinceLastSeen()}
        </span>
      )}
    </div>
  )
}

// Real-time status update hook
export function useWorkerStatus(workerId: string) {
  const [status, setStatus] = useState<'available' | 'busy' | 'break' | 'offline'>('offline')
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<Date | null>(null)

  useEffect(() => {
    // Simulate real-time status updates
    // In a real app, this would connect to WebSocket or use Server-Sent Events
    const interval = setInterval(() => {
      // Simulate status changes
      const statuses: Array<'available' | 'busy' | 'break' | 'offline'> = ['available', 'busy', 'break', 'offline']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      
      setStatus(randomStatus)
      setIsOnline(Math.random() > 0.1) // 90% chance of being online
      setLastSeen(new Date())
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [workerId])

  return { status, isOnline, lastSeen }
}

// Worker status badge component
export function WorkerStatusBadge({ 
  status, 
  size = 'sm' 
}: { 
  status: 'available' | 'busy' | 'break' | 'offline'
  size?: 'sm' | 'md' | 'lg'
}) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          text: 'Available',
          icon: '🟢'
        }
      case 'busy':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          text: 'Busy',
          icon: '🔴'
        }
      case 'break':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'On Break',
          icon: '🟡'
        }
      case 'offline':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'Offline',
          icon: '⚫'
        }
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'Unknown',
          icon: '❓'
        }
    }
  }

  const config = getStatusConfig(status)
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  )
}

// Live worker status list component
export function LiveWorkerStatusList({ workers }: { workers: Array<{ id: string; name: string; status: string }> }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Live Worker Status</h3>
      {workers.map((worker) => (
        <div key={worker.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-900">{worker.name}</span>
          <WorkerStatusBadge status={worker.status as any} size="sm" />
        </div>
      ))}
    </div>
  )
}
