'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AdminOnly } from '@/components/auth/route-guard'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  description: string
  isActive: boolean
  features: string[]
  createdAt: Date
}

const mockPlans: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Basic Plan',
    price: 29000,
    interval: 'month',
    description: 'Essential tools for small shops',
    isActive: true,
    features: ['Calendar', 'Up to 3 staff'],
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Pro Plan',
    price: 59000,
    interval: 'month',
    description: 'Advanced features for growing businesses',
    isActive: true,
    features: ['Calendar', 'Unlimited staff', 'Analytics'],
    createdAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Annual Premium',
    price: 590000,
    interval: 'year',
    description: 'Best value for established salons',
    isActive: true,
    features: ['All features', 'Priority support'],
    createdAt: new Date('2024-01-01')
  }
]

export default function AbonnementsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(mockPlans)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminOnly>
      <DashboardLayout>
      <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Abonnements</h1>
            <p className="text-gray-600 mt-2">Manage subscription plans and pricing</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
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
                placeholder="Search plans..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interval
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Features
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
              {filteredPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                    <div className="text-sm text-gray-500">{plan.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plan.price.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {plan.interval}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {plan.features.length} features
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      plan.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
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
    </AdminOnly>
  )
}
