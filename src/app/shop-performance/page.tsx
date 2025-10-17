'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, Star, DollarSign, Clock, Users, BarChart3, Filter, Store } from 'lucide-react'
import { ShopPerformance, Shop } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RouteGuard } from '@/components/auth/route-guard'

// Mock data for demonstration
const mockShops: Shop[] = [
  {
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
  },
  {
    id: '2',
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
  }
]

const mockShopPerformance: ShopPerformance[] = [
  {
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    period: 'monthly',
    date: new Date('2024-01-01'),
    totalRevenue: 15600,
    totalBookings: 234,
    averageRating: 4.7,
    totalWorkers: 8,
    activeWorkers: 7,
    workerPerformance: [
      { workerId: '1', workerName: 'Sarah Johnson', bookings: 45, revenue: 3200, rating: 4.8 },
      { workerId: '2', workerName: 'Maria Garcia', bookings: 38, revenue: 2100, rating: 4.9 },
      { workerId: '3', workerName: 'David Chen', bookings: 42, revenue: 2800, rating: 4.6 },
      { workerId: '4', workerName: 'Lisa Brown', bookings: 35, revenue: 1900, rating: 4.7 }
    ],
    topServices: [
      { serviceName: 'Haircut & Style', bookings: 85, revenue: 5100 },
      { serviceName: 'Hair Coloring', bookings: 45, revenue: 3600 },
      { serviceName: 'Manicure', bookings: 60, revenue: 3000 },
      { serviceName: 'Massage', bookings: 30, revenue: 2400 }
    ],
    customerMetrics: {
      newCustomers: 45,
      returningCustomers: 189,
      customerSatisfaction: 94
    }
  },
  {
    shopId: '2',
    shopName: 'Elite Hair & Spa',
    period: 'monthly',
    date: new Date('2024-01-01'),
    totalRevenue: 22400,
    totalBookings: 156,
    averageRating: 4.9,
    totalWorkers: 6,
    activeWorkers: 6,
    workerPerformance: [
      { workerId: '5', workerName: 'Emma Wilson', bookings: 52, revenue: 4200, rating: 4.9 },
      { workerId: '6', workerName: 'James Taylor', bookings: 48, revenue: 3800, rating: 4.8 },
      { workerId: '7', workerName: 'Sophie Davis', bookings: 56, revenue: 4500, rating: 5.0 }
    ],
    topServices: [
      { serviceName: 'Luxury Hair Treatment', bookings: 45, revenue: 7200 },
      { serviceName: 'Spa Package', bookings: 35, revenue: 5600 },
      { serviceName: 'Premium Styling', bookings: 40, revenue: 4800 },
      { serviceName: 'Facial Treatment', bookings: 36, revenue: 4800 }
    ],
    customerMetrics: {
      newCustomers: 28,
      returningCustomers: 128,
      customerSatisfaction: 97
    }
  }
]

export default function ShopPerformancePage() {
  const [shops, setShops] = useState<Shop[]>(mockShops)
  const [performanceData, setPerformanceData] = useState<ShopPerformance[]>(mockShopPerformance)
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [selectedShop, setSelectedShop] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  const filteredPerformance = performanceData.filter(perf => {
    const matchesPeriod = perf.period === selectedPeriod
    const matchesShop = selectedShop === 'all' || perf.shopId === selectedShop
    return matchesPeriod && matchesShop
  })

  const totalStats = {
    totalRevenue: filteredPerformance.reduce((sum, perf) => sum + perf.totalRevenue, 0),
    totalBookings: filteredPerformance.reduce((sum, perf) => sum + perf.totalBookings, 0),
    averageRating: filteredPerformance.length > 0 
      ? filteredPerformance.reduce((sum, perf) => sum + perf.averageRating, 0) / filteredPerformance.length 
      : 0,
    totalWorkers: filteredPerformance.reduce((sum, perf) => sum + perf.totalWorkers, 0),
    activeWorkers: filteredPerformance.reduce((sum, perf) => sum + perf.activeWorkers, 0),
    customerSatisfaction: filteredPerformance.length > 0
      ? filteredPerformance.reduce((sum, perf) => sum + perf.customerMetrics.customerSatisfaction, 0) / filteredPerformance.length
      : 0
  }

  return (
    <RouteGuard allowedRoles={['admin', 'manager']}>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shop Performance</h1>
                <p className="text-gray-600 mt-2">Track and analyze shop performance metrics</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={selectedShop}
                  onChange={(e) => setSelectedShop(e.target.value)}
                >
                  <option value="all">All Shops</option>
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${totalStats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.totalBookings}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.averageRating.toFixed(1)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Workers</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.totalWorkers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Workers</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.activeWorkers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-pink-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.customerSatisfaction.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Performance Cards */}
          <div className="space-y-6">
            {filteredPerformance.map((perf) => {
              const shop = shops.find(s => s.id === perf.shopId)
              return (
                <div key={perf.shopId} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-lg bg-ikigai-primary flex items-center justify-center overflow-hidden">
                        {shop?.profileImage ? (
                          <img 
                            src={shop.profileImage} 
                            alt={perf.shopName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Store className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold text-gray-900">{perf.shopName}</h3>
                        <p className="text-sm text-gray-600">{shop?.address}, {shop?.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-400 mr-1" />
                        <span className="text-xl font-semibold text-gray-900">{perf.averageRating}</span>
                      </div>
                      <p className="text-sm text-gray-600">{perf.customerMetrics.customerSatisfaction}% satisfaction</p>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-gray-900">${perf.totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-gray-900">{perf.totalBookings}</p>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-gray-900">{perf.activeWorkers}/{perf.totalWorkers}</p>
                      <p className="text-sm text-gray-600">Active Workers</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-3xl font-bold text-gray-900">{perf.customerMetrics.newCustomers}</p>
                      <p className="text-sm text-gray-600">New Customers</p>
                    </div>
                  </div>

                  {/* Worker Performance */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Worker Performance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {perf.workerPerformance.map((worker) => (
                        <div key={worker.workerId} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{worker.workerName}</h5>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="text-sm font-medium">{worker.rating}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Bookings:</span>
                              <span className="font-medium ml-1">{worker.bookings}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Revenue:</span>
                              <span className="font-medium ml-1">${worker.revenue.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Services */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Top Services</h4>
                    <div className="space-y-3">
                      {perf.topServices.map((service, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium text-gray-900">{service.serviceName}</span>
                            <span className="text-sm text-gray-600 ml-2">{service.bookings} bookings</span>
                          </div>
                          <span className="font-semibold text-gray-900">${service.revenue.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Metrics */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Customer Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center">
                          <Users className="h-8 w-8 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-blue-800">New Customers</p>
                            <p className="text-2xl font-bold text-blue-900">{perf.customerMetrics.newCustomers}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Returning Customers</p>
                            <p className="text-2xl font-bold text-green-900">{perf.customerMetrics.returningCustomers}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center">
                          <Star className="h-8 w-8 text-purple-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-purple-800">Customer Satisfaction</p>
                            <p className="text-2xl font-bold text-purple-900">{perf.customerMetrics.customerSatisfaction}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Chart Placeholder */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Trend</h4>
                    <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Performance chart will be implemented here</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredPerformance.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No performance data found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or select a different time period.
              </p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}
