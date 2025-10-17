'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard, DollarSign, Calendar, User, Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Shop } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RouteGuard } from '@/components/auth/route-guard'

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

interface Payment {
  id: string
  bookingId: string
  customerId: string
  customerName: string
  customerEmail: string
  serviceName: string
  workerName: string
  shopId: string
  shopName: string
  amount: number
  currency: string
  paymentMethod: 'card' | 'cash' | 'bank_transfer' | 'digital_wallet'
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  transactionId?: string
  paidAt: Date
  createdAt: Date
  notes?: string
}

const mockPayments: Payment[] = [
  {
    id: '1',
    bookingId: 'booking1',
    customerId: 'customer1',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    serviceName: 'Haircut & Style',
    workerName: 'Sarah Johnson',
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    amount: 75,
    currency: 'USD',
    paymentMethod: 'card',
    status: 'completed',
    transactionId: 'txn_123456789',
    paidAt: new Date('2024-01-20T10:30:00'),
    createdAt: new Date('2024-01-20T10:30:00'),
    notes: 'Payment processed successfully'
  },
  {
    id: '2',
    bookingId: 'booking2',
    customerId: 'customer2',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    serviceName: 'Manicure',
    workerName: 'Maria Garcia',
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    amount: 35,
    currency: 'USD',
    paymentMethod: 'cash',
    status: 'completed',
    paidAt: new Date('2024-01-21T14:15:00'),
    createdAt: new Date('2024-01-21T14:15:00'),
    notes: 'Cash payment received'
  },
  {
    id: '3',
    bookingId: 'booking3',
    customerId: 'customer3',
    customerName: 'Mike Johnson',
    customerEmail: 'mike.johnson@example.com',
    serviceName: 'Massage',
    workerName: 'David Chen',
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    amount: 120,
    currency: 'USD',
    paymentMethod: 'digital_wallet',
    status: 'pending',
    transactionId: 'txn_987654321',
    paidAt: new Date('2024-01-22T16:00:00'),
    createdAt: new Date('2024-01-22T16:00:00'),
    notes: 'Payment processing...'
  },
  {
    id: '4',
    bookingId: 'booking4',
    customerId: 'customer4',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah.wilson@example.com',
    serviceName: 'Hair Coloring',
    workerName: 'Sarah Johnson',
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    amount: 150,
    currency: 'USD',
    paymentMethod: 'card',
    status: 'refunded',
    transactionId: 'txn_456789123',
    paidAt: new Date('2024-01-19T11:00:00'),
    createdAt: new Date('2024-01-19T11:00:00'),
    notes: 'Refunded due to service cancellation'
  }
]

export default function ShopPaymentsPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.id as string
  
  const [shop, setShop] = useState<Shop | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would fetch shop and payments data by ID
    setShop(mockShop)
    setPayments(mockPayments)
    setIsLoading(false)
  }, [shopId])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod
    const matchesDate = filterDate === 'all' || 
                       (filterDate === 'today' && isToday(payment.paidAt)) ||
                       (filterDate === 'week' && isThisWeek(payment.paidAt)) ||
                       (filterDate === 'month' && isThisMonth(payment.paidAt))
    return matchesSearch && matchesStatus && matchesMethod && matchesDate
  })

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isThisWeek = (date: Date) => {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return date >= weekAgo && date <= today
  }

  const isThisMonth = (date: Date) => {
    const today = new Date()
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'refunded': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />
      case 'cash': return <DollarSign className="h-4 w-4" />
      case 'bank_transfer': return <CreditCard className="h-4 w-4" />
      case 'digital_wallet': return <CreditCard className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card': return 'Credit Card'
      case 'cash': return 'Cash'
      case 'bank_transfer': return 'Bank Transfer'
      case 'digital_wallet': return 'Digital Wallet'
      default: return method
    }
  }

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    refunded: payments.filter(p => p.status === 'refunded').length,
    totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    totalRefunded: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0)
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
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                  onClick={() => router.push(`/shops/${shopId}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shop
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Payments - {shop.name}</h1>
                  <p className="text-gray-600 mt-1">Track and manage all payments for this shop</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Refunded</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.refunded}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Refunded</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRefunded.toLocaleString()}</p>
                </div>
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
                    placeholder="Search payments..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                >
                  <option value="all">All Methods</option>
                  <option value="card">Credit Card</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="digital_wallet">Digital Wallet</option>
                </select>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                          <div className="text-sm text-gray-500">{payment.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.serviceName}</div>
                        <div className="text-sm text-gray-500">by {payment.workerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${payment.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">{payment.currency}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="ml-2 text-sm text-gray-900">
                            {getPaymentMethodText(payment.paymentMethod)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          <span className="ml-1 capitalize">{payment.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.transactionId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.paidAt.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.paidAt.toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredPayments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}
