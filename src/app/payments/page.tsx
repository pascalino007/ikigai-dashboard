'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  DollarSign,
  Calendar,
  Store,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'

interface Transaction {
  id: number
  label: string
  fromUserId: number
  toUserId: number
  amount: number
  status: number
  transactionMotifId: number
  transactionRef: string
  paymentMethod: string
  balanceBefore: number
  balanceAfter: number
  createdAt: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // ✅ FETCH FROM API
  useEffect(() => {
    fetch('http://168.231.101.119:4040/transactions/admin/all')
      .then(res => res.json())
      .then(data => setPayments(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching transactions', err))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredPayments = (Array.isArray(payments) ? payments : []).filter(p => {
    const matchSearch =
      (p.transactionRef || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.fromUserId).includes(searchTerm)

    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && p.status === 1) ||
      (filterStatus === 'pending' && p.status === 0)

    return matchSearch && matchStatus
  })

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return 'completed'
      case 0:
        return 'pending'
      default:
        return 'failed'
    }
  }

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 1:
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 0:
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getTotalAmount = () =>
    (Array.isArray(payments) ? payments : [])
      .filter(p => p.status === 1)
      .reduce((sum, p) => sum + p.amount, 0)

  return (
    <DashboardLayout>
      <div className="p-6">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-gray-600">Admin transaction history</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : (
        <>
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow">
            <p className="text-sm text-gray-500">Completed Amount</p>
            <p className="text-2xl font-bold">XOF{getTotalAmount()}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow">
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-2xl font-bold">{(Array.isArray(payments) ? payments : []).length}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold">
              {(Array.isArray(payments) ? payments : []).filter(p => p.status === 0).length}
            </p>
          </div>
        </div>

        {/* FILTER */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded shadow mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-2 border rounded"
              placeholder="Search by transaction ref or user"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="border px-4 py-2 rounded"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-gray-900 rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Shop / Service</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Method</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Ref</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(tx => (
                <tr key={tx.id} className="border-t">
                  <td className="px-6 py-4">
                    User #{tx.fromUserId}
                  </td>

                  <td className="px-6 py-4">
                    <Store className="inline mr-2 h-4 w-4" />
                    Shop #{tx.toUserId}
                  </td>

                  <td className="px-6 py-4">
                    <DollarSign className="inline h-4 w-4" />
                    {tx.amount}
                  </td>

                  <td className="px-6 py-4 capitalize">
                    {tx.paymentMethod}
                  </td>

                  <td className="px-6 py-4 flex items-center gap-2">
                    {getStatusIcon(tx.status)}
                    {getStatusLabel(tx.status)}
                  </td>

                  <td className="px-6 py-4">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    {tx.transactionRef}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}

      </div>
    </DashboardLayout>
  )
}
