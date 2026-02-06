'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Users, Store, DollarSign } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RouteGuard } from '@/components/auth/route-guard'

interface Enroller {
  id: string
  name: string
  email: string
  avatar?: string
  shopsEnrolled: number
  providers: number
  revenue: number
  managerName?: string
  isActive: boolean
}

// Mock data – replace with API call to GET /enrollers or similar
const mockEnrollers: Enroller[] = [
  { id: '1', name: 'Marie Martin', email: 'marie@example.com', shopsEnrolled: 12, providers: 8, revenue: 4500, managerName: 'Jean Dupont', isActive: true },
  { id: '2', name: 'Pierre Bernard', email: 'pierre@example.com', shopsEnrolled: 8, providers: 5, revenue: 3200, managerName: 'Jean Dupont', isActive: true },
  { id: '3', name: 'Sophie Laurent', email: 'sophie@example.com', shopsEnrolled: 4, providers: 3, revenue: 1800, managerName: 'Jean Dupont', isActive: true },
  { id: '4', name: 'Thomas Moreau', email: 'thomas@example.com', shopsEnrolled: 9, providers: 6, revenue: 4100, managerName: 'Claire Rousseau', isActive: true },
  { id: '5', name: 'Julie Petit', email: 'julie@example.com', shopsEnrolled: 6, providers: 4, revenue: 2500, managerName: 'Claire Rousseau', isActive: false },
]

export default function EnrollersPage() {
  const [enrollers, setEnrollers] = useState<Enroller[]>(mockEnrollers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const filteredEnrollers = enrollers.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.managerName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && e.isActive) ||
      (filterStatus === 'inactive' && !e.isActive)
    return matchesSearch && matchesStatus
  })

  return (
    <RouteGuard allowedRoles={['admin', 'manager']}>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Enrollers</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage enrollers and view their performance</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Enroller
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-800 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search enrollers..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nb Shops</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Providers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEnrollers.map((enroller) => (
                    <tr key={enroller.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden">
                            {enroller.avatar ? (
                              <img src={enroller.avatar} alt={enroller.name} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-sm font-medium text-white">
                                {enroller.name.split(' ').map((n) => n[0]).join('')}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{enroller.name}</div>
                            <div className="text-sm text-gray-500">{enroller.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {enroller.managerName || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-sm">
                          <Store className="h-4 w-4 text-gray-400" />
                          {enroller.shopsEnrolled}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-sm">
                          <Users className="h-4 w-4 text-gray-400" />
                          {enroller.providers}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-sm font-medium">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          ${enroller.revenue.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            enroller.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {enroller.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredEnrollers.length === 0 && (
            <div className="text-center py-12 text-gray-500">No enrollers found</div>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}
