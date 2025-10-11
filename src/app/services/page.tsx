'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Clock, DollarSign, Edit, Trash2, Eye } from 'lucide-react'
import { Service, Shop } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ServiceForm } from '@/components/forms/service-form'

// Mock data for demonstration
const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Downtown Beauty Studio',
    address: '123 Main Street',
    city: 'New York',
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
    city: 'Los Angeles',
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
    city: 'Chicago',
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

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Haircut & Styling',
    description: 'Professional haircut with styling and consultation',
    price: 45,
    duration: 60,
    category: 'Hair',
    subcategory: 'Haircut',
    providerId: 'provider1',
    shopId: '1',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Beard Trim',
    description: 'Precision beard trimming and shaping',
    price: 25,
    duration: 30,
    category: 'Barber',
    subcategory: 'Beard Trim',
    providerId: 'provider1',
    shopId: '1',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'Full Makeup',
    description: 'Complete makeup application for special occasions',
    price: 80,
    duration: 90,
    category: 'Beauty',
    subcategory: 'Makeup',
    providerId: 'provider2',
    shopId: '2',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '4',
    name: 'Manicure & Pedicure',
    description: 'Full nail care service with polish',
    price: 60,
    duration: 75,
    category: 'Nails',
    subcategory: 'Manicure',
    providerId: 'provider3',
    shopId: '3',
    isActive: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(mockServices)
  const [shops] = useState<Shop[]>(mockShops)
  const [selectedShopId, setSelectedShopId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // Filter services by selected shop
  const shopServices = selectedShopId 
    ? services.filter(service => service.shopId === selectedShopId)
    : services

  const filteredServices = shopServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(shopServices.map(s => s.category)))

  const handleAddService = async (formData: any) => {
    // Simulate API call
    console.log('Adding new service:', formData)
    
    // Create new service object
    const newService: Service = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      category: formData.category,
      subcategory: formData.subcategory,
      providerId: 'provider-new',
      shopId: formData.shopId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Add to services list
    setServices(prev => [newService, ...prev])
    
    // Show success message
    console.log('Service created successfully!')
  }

  const handleUpdateService = async (formData: any) => {
    if (!editingService) return
    
    const updatedService: Service = {
      ...editingService,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      category: formData.category,
      subcategory: formData.subcategory,
      shopId: formData.shopId,
      updatedAt: new Date()
    }
    
    setServices(prev => prev.map(s => 
      s.id === editingService.id ? updatedService : s
    ))
    setEditingService(null)
    console.log('Service updated successfully!')
  }

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      setServices(prev => prev.filter(s => s.id !== serviceId))
      console.log('Service deleted successfully!')
    }
  }

  const handleToggleStatus = (serviceId: string) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId 
        ? { ...s, isActive: !s.isActive, updatedAt: new Date() }
        : s
    ))
  }

  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Services</h1>
            <p className="text-gray-600 mt-2">Manage beauty services offered by providers</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Shop Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Shop to View Services
            </label>
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
            >
              <option value="">All Shops</option>
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>
          {selectedShopId && (
            <div className="ml-4">
              <Button 
                variant="outline" 
                onClick={() => setSelectedShopId('')}
                size="sm"
              >
                Clear Filter
              </Button>
            </div>
          )}
        </div>
        {selectedShopId && (
          <div className="mt-4 p-3 bg-ikigai-light rounded-md">
            <p className="text-sm text-ikigai-primary">
              Showing services for: <strong>{shops.find(s => s.id === selectedShopId)?.name}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  service.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-900">{service.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subcategory:</span>
                  <span className="font-medium text-gray-900">{service.subcategory}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-gray-900 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {service.price}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {service.duration} min
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Created {service.createdAt.toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleToggleStatus(service.id)}
                    className={service.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                  >
                    {service.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setEditingService(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Service Form */}
      <ServiceForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddService}
        shops={shops.map(shop => ({ id: shop.id, name: shop.name }))}
      />

      {/* Edit Service Form */}
      <ServiceForm
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        onSubmit={handleUpdateService}
        shops={shops.map(shop => ({ id: shop.id, name: shop.name }))}
        initialData={editingService}
      />
      </div>
    </DashboardLayout>
  )
}
