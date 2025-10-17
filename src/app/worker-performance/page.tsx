'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, Star, DollarSign, Clock, Users, BarChart3, Filter } from 'lucide-react'
import { WorkerPerformance, Worker } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { RouteGuard } from '@/components/auth/route-guard'

// Mock data for demonstration
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

const mockPerformanceData: WorkerPerformance[] = [
  {
    workerId: '1',
    workerName: 'Sarah Johnson',
    period: 'monthly',
    date: new Date('2024-01-01'),
    totalBookings: 45,
    totalRevenue: 3200,
    averageRating: 4.8,
    totalHoursWorked: 160,
    bookingsCompleted: 43,
    bookingsCancelled: 2,
    customerSatisfaction: 95,
    servicesPerformed: [
      { serviceName: 'Haircut & Style', count: 25, revenue: 1800 },
      { serviceName: 'Hair Coloring', count: 15, revenue: 1200 },
      { serviceName: 'Hair Treatment', count: 5, revenue: 200 }
    ]
  },
  {
    workerId: '2',
    workerName: 'Maria Garcia',
    period: 'monthly',
    date: new Date('2024-01-01'),
    totalBookings: 38,
    totalRevenue: 2100,
    averageRating: 4.9,
    totalHoursWorked: 140,
    bookingsCompleted: 37,
    bookingsCancelled: 1,
    customerSatisfaction: 98,
    servicesPerformed: [
      { serviceName: 'Manicure', count: 20, revenue: 1000 },
      { serviceName: 'Pedicure', count: 15, revenue: 900 },
      { serviceName: 'Nail Art', count: 3, revenue: 200 }
    ]
  }
]

export default function WorkerPerformancePage() {
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers)
  const [performanceData, setPerformanceData] = useState<WorkerPerformance[]>(mockPerformanceData)
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [selectedWorker, setSelectedWorker] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  const filteredPerformance = performanceData.filter(perf => {
    const matchesPeriod = perf.period === selectedPeriod
    const matchesWorker = selectedWorker === 'all' || perf.workerId === selectedWorker
    return matchesPeriod && matchesWorker
  })

  const totalStats = {
    totalBookings: filteredPerformance.reduce((sum, perf) => sum + perf.totalBookings, 0),
    totalRevenue: filteredPerformance.reduce((sum, perf) => sum + perf.totalRevenue, 0),
    averageRating: filteredPerformance.length > 0 
      ? filteredPerformance.reduce((sum, perf) => sum + perf.averageRating, 0) / filteredPerformance.length 
      : 0,
    totalHours: filteredPerformance.reduce((sum, perf) => sum + perf.totalHoursWorked, 0),
    customerSatisfaction: filteredPerformance.length > 0
      ? filteredPerformance.reduce((sum, perf) => sum + perf.customerSatisfaction, 0) / filteredPerformance.length
      : 0
  }

  return (
    <RouteGuard allowedRoles={['admin', 'manager']}>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Worker Performance</h1>
                <p className="text-gray-600 mt-2">Track and analyze worker performance metrics</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Worker</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                >
                  <option value="all">All Workers</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.firstName} {worker.lastName}
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.totalHours}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Satisfaction</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.customerSatisfaction.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Worker Performance Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPerformance.map((perf) => {
              const worker = workers.find(w => w.id === perf.workerId)
              return (
                <div key={perf.workerId} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden">
                        {worker?.profilePicture ? (
                          <img 
                            src={worker.profilePicture} 
                            alt={perf.workerName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-white">
                            {perf.workerName.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{perf.workerName}</h3>
                        <p className="text-sm text-gray-600">{worker?.specialization}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-lg font-semibold text-gray-900">{perf.averageRating}</span>
                      </div>
                      <p className="text-sm text-gray-600">{perf.customerSatisfaction}% satisfaction</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{perf.totalBookings}</p>
                      <p className="text-sm text-gray-600">Bookings</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">${perf.totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{perf.totalHoursWorked}</p>
                      <p className="text-sm text-gray-600">Hours Worked</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{perf.bookingsCompleted}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                  </div>

                  {/* Services Performed */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Services Performed</h4>
                    <div className="space-y-2">
                      {perf.servicesPerformed.map((service, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{service.serviceName}</span>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-900">{service.count} bookings</span>
                            <span className="text-sm text-gray-600 ml-2">${service.revenue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Chart Placeholder */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Performance Trend</h4>
                    <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Chart will be implemented here</p>
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
