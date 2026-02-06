'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import {
  Search,
  Calendar,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Store
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'

type Booking = {
  id: string
  userId: string
  providerId: string
  serviceId: string
  bookingDate: Date
  bookingTime: string
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  paymentStatus: number
}

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterShop, setFilterShop] = useState<string>('all')

  // -----------------------------
  // FETCH BOOKINGS
  // -----------------------------
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('ikigai_token')
        const res = await fetch('http://168.231.101.119:4040/bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()

        const formatted: Booking[] = data.map((b: any) => ({
          id: String(b.id),
          userId: String(b.user_id),
          providerId: String(b.provider_id),
          serviceId: String(b.service_id),

          bookingDate: new Date(b.booking_date),
          bookingTime: new Date(b.booking_time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),

          bookingStatus: convertStatus(b.booking_status),
          paymentStatus: b.payement_status
        }))

        setBookings(formatted)
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  // -----------------------------
  // STATUS MAPPING
  // -----------------------------
  const convertStatus = (status: number) => {
    switch (status) {
      case 0:
        return 'pending'
      case 2:
        return 'confirmed'
      case 3:
        return 'completed'
      case -1:
        return 'cancelled'
      default:
        return 'pending'
    }
  }

  // -----------------------------
  // FILTERING
  // -----------------------------
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b.userId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || b.bookingStatus === filterStatus
    const matchesShop = filterShop === 'all' || b.providerId === filterShop
    return matchesSearch && matchesStatus && matchesShop
  })

  // -----------------------------
  // STATUS UI
  // -----------------------------
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <p className="p-6">Loading bookings...</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bookings</h1>
          <p className="text-gray-600 mt-2">
            Manage customer bookings 
            {user?.role && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role}
              </span>
            )}
          </p>
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user id..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2 border rounded-md"
            value={filterShop}
            onChange={(e) => setFilterShop(e.target.value)}
          >
            <option value="all">All Providers</option>
            {[...new Set(bookings.map((b) => b.providerId))].map((id) => (
              <option key={id} value={id}>Provider {id}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border rounded-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">User {b.userId}</td>

                  <td className="px-6 py-4 flex items-center">
                    <Store className="h-4 w-4 mr-2" /> Provider {b.providerId}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      {b.bookingDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      {b.bookingTime}
                    </div>
                  </td>

                  <td className="px-6 py-4">Service {b.serviceId}</td>

                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(b.bookingStatus)}
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getStatusColor(b.bookingStatus)}`}>
                        {b.bookingStatus}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 space-x-2">
                    <Button size="sm" variant="ghost">View</Button>
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                      <Button size="sm" variant="ghost">Edit</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </DashboardLayout>
  )
}
