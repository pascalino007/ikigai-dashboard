'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Edit, Trash2, Eye, Clock, DollarSign, Star, User, Phone, Mail } from 'lucide-react'
import { Worker } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { WorkerForm } from '@/components/forms/worker-form'
import { WorkerViewModal } from '@/components/modals/worker-view-modal'
import { WorkerEditModal } from '@/components/modals/worker-edit-modal'
import { WorkerStatusBadge, LiveWorkerStatusList } from '@/components/worker-status-indicator'
import { useAuth } from '@/lib/auth/auth-context'
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
    currentBookingId: 'booking-123',
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
  },
  {
    id: '3',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david.chen@example.com',
    phone: '+1 (555) 345-6789',
    specialization: 'Massage Therapist',
    experience: 7,
    hourlyRate: 60,
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    isActive: false,
    status: 'offline',
    rating: 4.7,
    totalBookings: 203,
    totalEarnings: 18200,
    workingHours: {
      start: '08:00',
      end: '17:00',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    createdAt: new Date('2023-11-20'),
    updatedAt: new Date('2024-01-10')
  }
]

export default function ShopWorkersPage() {
  const { user } = useAuth()
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSpecialization, setFilterSpecialization] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Get unique specializations for filter
  const specializations = Array.from(new Set(workers.map(worker => worker.specialization)))

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || worker.status === filterStatus
    const matchesSpecialization = filterSpecialization === 'all' || worker.specialization === filterSpecialization
    return matchesSearch && matchesStatus && matchesSpecialization
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-red-100 text-red-800'
      case 'break': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available'
      case 'busy': return 'Busy'
      case 'break': return 'On Break'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  const handleAddWorker = async (data: any) => {
    setIsLoading(true)
    try {
      // In a real app, this would call the API
      // const response = await workerApi.create(data)
      
      const newWorker: Worker = {
        id: Date.now().toString(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        profilePicture: data.profilePicture ? URL.createObjectURL(data.profilePicture) : undefined,
        specialization: data.specialization,
        experience: data.experience,
        hourlyRate: data.hourlyRate,
        shopId: '1', // This would come from auth context
        shopName: 'Downtown Beauty Studio', // This would come from auth context
        isActive: true,
        status: 'available',
        rating: 0,
        totalBookings: 0,
        totalEarnings: 0,
        workingHours: data.workingHours,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setWorkers(prev => [newWorker, ...prev])
      setShowAddModal(false)
    } catch (error) {
      console.error('Error creating worker:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewWorker = (worker: Worker) => {
    setSelectedWorker(worker)
    setShowViewModal(true)
  }

  const handleEditWorker = (worker: Worker) => {
    setSelectedWorker(worker)
    setShowEditModal(true)
  }

  const handleUpdateWorker = async (workerId: string, data: any) => {
    setIsLoading(true)
    try {
      // In a real app, this would call the API
      // const response = await workerApi.update(workerId, data)
      
      setWorkers(prev => prev.map(worker => 
        worker.id === workerId 
          ? { ...worker, ...data, updatedAt: new Date() }
          : worker
      ))
      setShowEditModal(false)
      setSelectedWorker(null)
    } catch (error) {
      console.error('Error updating worker:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteWorker = async (workerId: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would call the API
      // await workerApi.delete(workerId)
      
      setWorkers(prev => prev.filter(worker => worker.id !== workerId))
      setShowViewModal(false)
      setSelectedWorker(null)
    } catch (error) {
      console.error('Error deleting worker:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleWorkerStatus = async (workerId: string) => {
    setIsLoading(true)
    try {
      setWorkers(prev => prev.map(worker => 
        worker.id === workerId 
          ? { 
              ...worker, 
              isActive: !worker.isActive,
              status: !worker.isActive ? 'available' : 'offline',
              updatedAt: new Date() 
            }
          : worker
      ))
    } catch (error) {
      console.error('Error toggling worker status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <RouteGuard allowedRoles={['admin', 'manager']}>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shop Workers</h1>
                <p className="text-gray-600 mt-2">Manage your shop's workers and their availability</p>
              </div>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Worker
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Workers</p>
                  <p className="text-2xl font-bold text-gray-900">{workers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workers.filter(w => w.status === 'available').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Busy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workers.filter(w => w.status === 'busy').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${workers.reduce((sum, w) => sum + w.totalEarnings, 0).toLocaleString()}
                  </p>
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
                    placeholder="Search workers..."
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
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="break">On Break</option>
                  <option value="offline">Offline</option>
                </select>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={filterSpecialization}
                  onChange={(e) => setFilterSpecialization(e.target.value)}
                >
                  <option value="all">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Live Status Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="lg:col-span-3">
              {/* Workers Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-ikigai-primary flex items-center justify-center overflow-hidden">
                            {worker.profilePicture ? (
                              <img 
                                src={worker.profilePicture} 
                                alt={`${worker.firstName} ${worker.lastName}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-white">
                                {worker.firstName[0]}{worker.lastName[0]}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {worker.firstName} {worker.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{worker.email}</div>
                            <div className="text-xs text-gray-400">{worker.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{worker.specialization}</div>
                          <div className="text-sm text-gray-500">{worker.experience} years exp.</div>
                          <div className="text-sm text-gray-500">${worker.hourlyRate}/hour</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <WorkerStatusBadge status={worker.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">{worker.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {worker.totalBookings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${worker.totalEarnings.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewWorker(worker)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditWorker(worker)}
                            title="Edit Worker"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleToggleWorkerStatus(worker.id)}
                            className={worker.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                            title={worker.isActive ? "Deactivate" : "Activate"}
                          >
                            {worker.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this worker?')) {
                                handleDeleteWorker(worker.id)
                              }
                            }}
                            title="Delete Worker"
                          >
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

            {/* Live Status Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <LiveWorkerStatusList 
                  workers={workers.map(w => ({
                    id: w.id,
                    name: `${w.firstName} ${w.lastName}`,
                    status: w.status
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Modals */}
          <WorkerForm
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddWorker}
          />
          
          <WorkerViewModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false)
              setSelectedWorker(null)
            }}
            worker={selectedWorker}
            onEdit={handleEditWorker}
            onDelete={handleDeleteWorker}
          />
          
          <WorkerEditModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedWorker(null)
            }}
            worker={selectedWorker}
            onSubmit={handleUpdateWorker}
          />
        </div>
      </DashboardLayout>
    </RouteGuard>
  )
}
