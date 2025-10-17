'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, MapPin, Phone, Mail, Eye, Calendar, Users, TrendingUp } from 'lucide-react'
import { Shop } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAuth } from '@/lib/auth/auth-context'
import { shopApi } from '@/services/api'
import { EnrollerOnly } from '@/components/auth/route-guard'

// Mock data for enrolled shops
const mockEnrolledShops: Shop[] = [
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
  },
  {
    id: '3',
    name: 'Modern Cuts Barbershop',
    address: '789 Pine Street',
    country: 'USA',
    city: 'Chicago',
    area: 'Downtown',
    phone: '+1 (555) 345-6789',
    email: 'hello@moderncuts.com',
    description: 'Contemporary barbershop with traditional techniques',
    isActive: false,
    ownerId: 'owner3',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    services: []
  }
]

export default function EnrolledShopsPage() {
  const { user } = useAuth()
  const [enrolledShops, setEnrolledShops] = useState<Shop[]>(mockEnrolledShops)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load enrolled shops from API
  useEffect(() => {
    loadEnrolledShops()
  }, [])

  const loadEnrolledShops = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call to get shops enrolled by this enroller
      // const response = await shopApi.getEnrolledByUser(user?.id)
      // setEnrolledShops(response)
      
      // For now, using mock data
      setEnrolledShops(mockEnrolledShops)
    } catch (error) {
      console.error('Error loading enrolled shops:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredShops = enrolledShops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.address.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const activeShops = enrolledShops.filter(shop => shop.isActive).length
  const totalShops = enrolledShops.length

  return (
    <EnrollerOnly>
      <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Enrolled Shops</h1>
              <p className="text-gray-600 mt-2">Manage and track the shops you have enrolled</p>
            </div>
            <Button onClick={() => window.location.href = '/register-shop'}>
              <Plus className="h-4 w-4 mr-2" />
              Register New Shop
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Shops</p>
                <p className="text-2xl font-bold text-gray-900">{totalShops}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Shops</p>
                <p className="text-2xl font-bold text-gray-900">{activeShops}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search enrolled shops..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Enrolled Shops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <div key={shop.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{shop.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{shop.description}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    shop.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {shop.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {shop.address}, {shop.area}, {shop.city}, {shop.country}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {shop.phone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {shop.email}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Enrolled {shop.createdAt.toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Navigate to shop details or open modal
                        console.log('View shop details:', shop.id)
                      }}
                      className="text-ikigai-primary border-ikigai-primary hover:bg-ikigai-primary hover:text-white"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredShops.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shops found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'You haven\'t enrolled any shops yet.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => window.location.href = '/register-shop'}>
                <Plus className="h-4 w-4 mr-2" />
                Register Your First Shop
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
    </EnrollerOnly>
  )
}
