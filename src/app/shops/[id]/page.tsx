'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Store, Users, BarChart3, Calendar, CreditCard, UserCheck, TrendingUp, Settings, Plus } from 'lucide-react'
import { Shop, Worker, WorkerPerformance, ShopPerformance } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RouteGuard } from '@/components/auth/route-guard'
import { WorkerStatusBadge } from '@/components/worker-status-indicator'

// Mock data for demonstration
const mockShop: Shop = {
  id: '1',
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
}

const mockWorkers: Worker[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    specialization: 'Hair Stylist',
    experience: 5,
    hourlyRate: 45,
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    isActive: true,
    status: 'available',
    rating: 4.8,
    totalBookings: 156,
    totalEarnings: 12500,
    workingHours: {
      start: '09:00',
      end: '18:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    firstName: 'Maria',
    lastName: 'Garcia',
    email: 'maria.garcia@example.com',
    phone: '+1 (555) 234-5678',
    specialization: 'Nail Technician',
    experience: 3,
    hourlyRate: 35,
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    isActive: true,
    status: 'busy',
    rating: 4.9,
    totalBookings: 89,
    totalEarnings: 8900,
    workingHours: {
      start: '10:00',
      end: '19:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
]

type TabType = 'overview' | 'workers' | 'performance' | 'bookings' | 'payments' | 'settings'

export default function ShopDetailPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.id as string
  
  const [shop, setShop] = useState<Shop | null>(null)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch shop data by ID
    setShop(mockShop)
    setWorkers(mockWorkers)
    setIsLoading(false)
  }, [shopId])

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Store },
    { id: 'workers', name: 'Workers', icon: UserCheck },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'settings', name: 'Settings', icon: Settings },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ShopOverviewTab shop={shop} workers={workers} />
      case 'workers':
        return <ShopWorkersTab shopId={shopId} workers={workers} />
      case 'performance':
        return <ShopPerformanceTab shopId={shopId} shop={shop} />
      case 'bookings':
        return <ShopBookingsTab shopId={shopId} shop={shop} />
      case 'payments':
        return <ShopPaymentsTab shopId={shopId} shop={shop} />
      case 'settings':
        return <ShopSettingsTab shop={shop} />
      default:
        return <ShopOverviewTab shop={shop} workers={workers} />
    }
  }

  if (isLoading) {
    return (
      <RouteGuard allowedRoles={['admin', 'manager', 'enroller']}>
        <DashboardLayout>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    )
  }

  if (!shop) {
    return (
      <RouteGuard allowedRoles={['admin', 'manager', 'enroller']}>
        <DashboardLayout>
          <div className="p-6">
            <div className="text-center py-12">
              <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Shop not found</h3>
              <p className="text-gray-600 mb-4">The shop you're looking for doesn't exist.</p>
              <Button onClick={() => router.push('/shops')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shops
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard allowedRoles={['admin', 'manager', 'enroller']}>
      <DashboardLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/shops')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shops
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
                  <p className="text-gray-600 mt-1">{shop.address}, {shop.city}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  shop.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {shop.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-ikigai-primary text-ikigai-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {renderTabContent()}
          </div>
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}

// Tab Components
function ShopOverviewTab({ shop, workers }: { shop: Shop | null, workers: Worker[] }) {
  if (!shop) return null

  const stats = {
    totalWorkers: workers.length,
    activeWorkers: workers.filter(w => w.isActive).length,
    availableWorkers: workers.filter(w => w.status === 'available').length,
    totalEarnings: workers.reduce((sum, w) => sum + w.totalEarnings, 0),
    totalBookings: workers.reduce((sum, w) => sum + w.totalBookings, 0),
    averageRating: workers.length > 0 ? workers.reduce((sum, w) => sum + w.rating, 0) / workers.length : 0
  }

  return (
    <div className="space-y-6">
      {/* Shop Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Contact Details</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Address:</strong> {shop.address}</p>
              <p><strong>City:</strong> {shop.city}, {shop.area}</p>
              <p><strong>Phone:</strong> {shop.phone}</p>
              <p><strong>Email:</strong> {shop.email}</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-600">{shop.description}</p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Workers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWorkers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Workers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeWorkers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-gray-900">{stats.availableWorkers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-pink-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Workers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Workers</h3>
        <div className="space-y-4">
          {workers.slice(0, 3).map((worker) => (
            <div key={worker.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-ikigai-primary flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {worker.firstName[0]}{worker.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{worker.firstName} {worker.lastName}</p>
                  <p className="text-sm text-gray-600">{worker.specialization}</p>
                </div>
              </div>
              <WorkerStatusBadge status={worker.status} size="sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ShopWorkersTab({ shopId, workers }: { shopId: string, workers: Worker[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Workers Management</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Worker
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workers.map((worker) => (
                <tr key={worker.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-ikigai-primary flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {worker.firstName[0]}{worker.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {worker.firstName} {worker.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{worker.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.specialization}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <WorkerStatusBadge status={worker.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.rating}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.totalBookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ShopPerformanceTab({ shopId, shop }: { shopId: string, shop: Shop | null }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Shop Performance</h3>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Performance Analytics</h4>
          <p className="text-gray-600">Detailed performance metrics and analytics will be displayed here.</p>
        </div>
      </div>
    </div>
  )
}

function ShopBookingsTab({ shopId, shop }: { shopId: string, shop: Shop | null }) {
  const router = useRouter()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Shop Bookings</h3>
        <Button onClick={() => router.push(`/shops/${shopId}/bookings`)}>
          <Calendar className="h-4 w-4 mr-2" />
          View All Bookings
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Booking History</h4>
          <p className="text-gray-600 mb-4">View detailed booking history and management.</p>
          <Button onClick={() => router.push(`/shops/${shopId}/bookings`)}>
            Go to Bookings Page
          </Button>
        </div>
      </div>
    </div>
  )
}

function ShopPaymentsTab({ shopId, shop }: { shopId: string, shop: Shop | null }) {
  const router = useRouter()
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Shop Payments</h3>
        <Button onClick={() => router.push(`/shops/${shopId}/payments`)}>
          <CreditCard className="h-4 w-4 mr-2" />
          View All Payments
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Payment History</h4>
          <p className="text-gray-600 mb-4">View detailed payment history and transaction management.</p>
          <Button onClick={() => router.push(`/shops/${shopId}/payments`)}>
            Go to Payments Page
          </Button>
        </div>
      </div>
    </div>
  )
}

function ShopSettingsTab({ shop }: { shop: Shop | null }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Shop Settings</h3>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Shop Configuration</h4>
          <p className="text-gray-600">Shop settings and configuration options will be available here.</p>
        </div>
      </div>
    </div>
  )
}
