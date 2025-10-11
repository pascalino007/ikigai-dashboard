'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Filter, DollarSign, Calendar, User, Store, CreditCard, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'
import { Payment } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'

// Mock data for demonstration
const mockPayments: Payment[] = [
  {
    id: '1',
    bookingId: 'booking1',
    customerId: 'customer1',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah@example.com',
    shopId: 'shop1',
    shopName: 'Downtown Beauty Studio',
    serviceId: 'service1',
    serviceName: 'Haircut & Styling',
    amount: 45,
    currency: 'USD',
    paymentMethod: 'card',
    status: 'completed',
    transactionId: 'TXN-001234',
    notes: 'Payment completed successfully',
    paidAt: new Date('2024-01-15T10:30:00'),
    createdAt: new Date('2024-01-15T10:00:00'),
    updatedAt: new Date('2024-01-15T10:30:00')
  },
  {
    id: '2',
    bookingId: 'booking2',
    customerId: 'customer2',
    customerName: 'Mike Wilson',
    customerEmail: 'mike@example.com',
    shopId: 'shop2',
    shopName: 'Elite Hair & Spa',
    serviceId: 'service2',
    serviceName: 'Beard Trim',
    amount: 25,
    currency: 'USD',
    paymentMethod: 'cash',
    status: 'completed',
    notes: 'Cash payment received',
    paidAt: new Date('2024-01-16T14:45:00'),
    createdAt: new Date('2024-01-16T14:30:00'),
    updatedAt: new Date('2024-01-16T14:45:00')
  },
  {
    id: '3',
    bookingId: 'booking3',
    customerId: 'customer3',
    customerName: 'Lisa Brown',
    customerEmail: 'lisa@example.com',
    shopId: 'shop3',
    shopName: 'Modern Cuts Barbershop',
    serviceId: 'service3',
    serviceName: 'Full Makeup',
    amount: 80,
    currency: 'USD',
    paymentMethod: 'online',
    status: 'pending',
    transactionId: 'TXN-001235',
    notes: 'Payment processing',
    createdAt: new Date('2024-01-17T11:00:00'),
    updatedAt: new Date('2024-01-17T11:00:00')
  },
  {
    id: '4',
    bookingId: 'booking4',
    customerId: 'customer4',
    customerName: 'John Davis',
    customerEmail: 'john@example.com',
    shopId: 'shop1',
    shopName: 'Downtown Beauty Studio',
    serviceId: 'service4',
    serviceName: 'Manicure & Pedicure',
    amount: 60,
    currency: 'USD',
    paymentMethod: 'bank_transfer',
    status: 'failed',
    transactionId: 'TXN-001236',
    notes: 'Payment failed - insufficient funds',
    createdAt: new Date('2024-01-18T15:20:00'),
    updatedAt: new Date('2024-01-18T15:25:00')
  },
  {
    id: '5',
    bookingId: 'booking5',
    customerId: 'customer5',
    customerName: 'Emma Smith',
    customerEmail: 'emma@example.com',
    shopId: 'shop2',
    shopName: 'Elite Hair & Spa',
    serviceId: 'service5',
    serviceName: 'Hair Coloring',
    amount: 120,
    currency: 'USD',
    paymentMethod: 'card',
    status: 'refunded',
    transactionId: 'TXN-001237',
    notes: 'Refund processed - service cancellation',
    paidAt: new Date('2024-01-19T09:15:00'),
    createdAt: new Date('2024-01-19T09:00:00'),
    updatedAt: new Date('2024-01-20T10:00:00')
  }
]

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [filterShop, setFilterShop] = useState<string>('all')

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (payment.transactionId && payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod
    const matchesShop = filterShop === 'all' || payment.shopId === filterShop
    return matchesSearch && matchesStatus && matchesMethod && matchesShop
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'refunded':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4" />
      case 'cash':
        return <DollarSign className="h-4 w-4" />
      case 'bank_transfer':
        return <User className="h-4 w-4" />
      case 'online':
        return <CreditCard className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getTotalAmount = () => {
    return filteredPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0)
  }

  const getPendingAmount = () => {
    return filteredPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0)
  }

  const shops = Array.from(new Set(payments.map(p => ({ id: p.shopId, name: p.shopName }))))

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600 mt-2">Manage payments between shops and clients</p>
            </div>
          </div>
        </div>

        {/* Payment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Completed</p>
                <p className="text-2xl font-bold text-gray-900">${getTotalAmount()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                <p className="text-2xl font-bold text-gray-900">${getPendingAmount()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
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
                <option value="card">Card</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="online">Online</option>
              </select>
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
                    Shop & Service
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-ikigai-primary flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {payment.customerName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{payment.customerName}</div>
                          <div className="text-sm text-gray-500">{payment.customerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <Store className="h-4 w-4 mr-2" />
                          {payment.shopName}
                        </div>
                        <div className="text-sm text-gray-500">{payment.serviceName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {payment.amount} {payment.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getMethodIcon(payment.paymentMethod)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {payment.paymentMethod.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {payment.paidAt ? payment.paidAt.toLocaleDateString() : payment.createdAt.toLocaleDateString()}
                      </div>
                      {payment.paidAt && (
                        <div className="text-sm text-gray-500">
                          {payment.paidAt.toLocaleTimeString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.transactionId || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <DollarSign className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

