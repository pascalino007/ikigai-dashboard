'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Filter, Calendar, Clock, User, Phone, CheckCircle, XCircle, AlertCircle, MapPin, Store } from 'lucide-react'
import { Booking, Shop } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'

// Mock data for demonstration
const mockBookings: Booking[] = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com',
    customerPhone: '+1 (555) 123-4567',
    serviceId: 'service1',
    providerId: 'provider1',
    shopId: 'shop1',
    date: new Date('2024-01-15'),
    time: '10:00 AM',
    status: 'confirmed',
    notes: 'First time customer',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: '2',
    customerName: 'Mike Wilson',
    customerEmail: 'mike@example.com',
    customerPhone: '+1 (555) 234-5678',
    serviceId: 'service2',
    providerId: 'provider2',
    shopId: 'shop2',
    date: new Date('2024-01-16'),
    time: '2:30 PM',
    status: 'pending',
    notes: 'Regular customer',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    customerName: 'Lisa Brown',
    customerEmail: 'lisa@example.com',
    customerPhone: '+1 (555) 345-6789',
    serviceId: 'service3',
    providerId: 'provider3',
    shopId: 'shop3',
    date: new Date('2024-01-14'),
    time: '11:00 AM',
    status: 'completed',
    notes: 'Wedding makeup',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: '4',
    customerName: 'John Davis',
    customerEmail: 'john@example.com',
    customerPhone: '+1 (555) 456-7890',
    serviceId: 'service4',
    providerId: 'provider1',
    shopId: 'shop1',
    date: new Date('2024-01-17'),
    time: '3:00 PM',
    status: 'cancelled',
    notes: 'Customer cancelled due to emergency',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-17')
  }
]

// Mock shops data for demonstration
const mockShops: Shop[] = [
  {
    id: 'shop1',
    name: 'Downtown Beauty Studio',
    address: '123 Main Street',
    country: 'USA',
    city: 'New York',
    area: 'Manhattan',
    phone: '+1 (555) 123-4567',
    email: 'info@downtownbeauty.com',
    description: 'Full-service beauty salon in the heart of downtown',
    isActive: true,
    ownerId: 'owner1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    services: []
  },
  {
    id: 'shop2',
    name: 'Elite Hair & Spa',
    address: '456 Oak Avenue',
    country: 'USA',
    city: 'Los Angeles',
    area: 'Beverly Hills',
    phone: '+1 (555) 234-5678',
    email: 'contact@elitehairspa.com',
    description: 'Luxury hair salon and spa services',
    isActive: true,
    ownerId: 'owner2',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    services: []
  },
  {
    id: 'shop3',
    name: 'Modern Cuts Barbershop',
    address: '789 Pine Street',
    country: 'USA',
    city: 'Chicago',
    area: 'Downtown',
    phone: '+1 (555) 345-6789',
    email: 'hello@moderncuts.com',
    description: 'Contemporary barbershop with traditional techniques',
    isActive: true,
    ownerId: 'owner3',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    services: []
  }
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [shops] = useState<Shop[]>(mockShops)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterShop, setFilterShop] = useState<string>('all')

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    const matchesShop = filterShop === 'all' || booking.shopId === filterShop
    return matchesSearch && matchesStatus && matchesShop
  })

  const getShopInfo = (shopId: string) => {
    return shops.find(shop => shop.id === shopId)
  }

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
        return <AlertCircle className="h-4 w-4 text-gray-500" />
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
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
            <p className="text-gray-600 mt-2">Manage customer appointments and bookings</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              value={filterShop}
              onChange={(e) => setFilterShop(e.target.value)}
            >
              <option value="all">All Shops</option>
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
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
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-ikigai-primary flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {booking.customerName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                        <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {booking.customerPhone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const shop = getShopInfo(booking.shopId)
                      return shop ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <Store className="h-4 w-4 mr-2" />
                            {shop.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {shop.city}, {shop.area}
                          </div>
                          <div className="text-sm text-gray-500">
                            {shop.phone}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Shop not found</div>
                      )
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {booking.date.toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {booking.time}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Haircut & Styling
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(booking.status)}
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}
