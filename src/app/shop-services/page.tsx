'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Edit, Trash2, Eye, Clock, DollarSign, Tag } from 'lucide-react'
import { ShopService } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ShopServiceForm } from '@/components/forms/shop-service-form'

// Mock data for demonstration
const mockShopServices: ShopService[] = [
  {
    id: '1',
    name: 'Haircut & Styling',
    description: 'Professional haircut with styling and blow-dry',
    price: 50,
    duration: 60,
    category: 'Hair',
    subcategory: 'Cut & Style',
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    providerId: '1',
    providerName: 'John Smith',
    isActive: true,
    tags: ['haircut', 'styling', 'blow-dry'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Manicure & Pedicure',
    description: 'Complete nail care service with polish',
    price: 35,
    duration: 90,
    category: 'Nails',
    subcategory: 'Manicure',
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    providerId: '2',
    providerName: 'Maria Garcia',
    isActive: true,
    tags: ['manicure', 'pedicure', 'nail-polish'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Facial Treatment',
    description: 'Deep cleansing facial treatment with mask',
    price: 80,
    duration: 75,
    category: 'Skincare',
    subcategory: 'Facial',
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    isActive: false,
    tags: ['facial', 'cleansing', 'mask'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
]

const serviceCategories = [
  'Hair',
  'Nails',
  'Skincare',
  'Makeup',
  'Massage',
  'Eyebrows',
  'Eyelashes',
  'Waxing',
  'Other'
]

const serviceSubcategories = {
  'Hair': ['Cut & Style', 'Coloring', 'Highlights', 'Perm', 'Straightening', 'Extensions'],
  'Nails': ['Manicure', 'Pedicure', 'Gel Polish', 'Nail Art', 'Acrylic', 'French'],
  'Skincare': ['Facial', 'Peel', 'Microdermabrasion', 'Anti-aging', 'Acne Treatment'],
  'Makeup': ['Bridal', 'Event', 'Everyday', 'Special Effects', 'Airbrush'],
  'Massage': ['Relaxation', 'Deep Tissue', 'Hot Stone', 'Aromatherapy', 'Sports'],
  'Eyebrows': ['Shaping', 'Tinting', 'Microblading', 'Lamination'],
  'Eyelashes': ['Extensions', 'Tinting', 'Lifting', 'Perming'],
  'Waxing': ['Face', 'Body', 'Bikini', 'Brazilian', 'Legs', 'Arms'],
  'Other': ['Consultation', 'Package Deal', 'Custom Service']
}

export default function ShopServicesPage() {
  const [shopServices, setShopServices] = useState<ShopService[]>(mockShopServices)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredServices = shopServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && service.isActive) ||
                         (filterStatus === 'inactive' && !service.isActive)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hair': return 'bg-purple-100 text-purple-800'
      case 'Nails': return 'bg-pink-100 text-pink-800'
      case 'Skincare': return 'bg-green-100 text-green-800'
      case 'Makeup': return 'bg-yellow-100 text-yellow-800'
      case 'Massage': return 'bg-blue-100 text-blue-800'
      case 'Eyebrows': return 'bg-orange-100 text-orange-800'
      case 'Eyelashes': return 'bg-indigo-100 text-indigo-800'
      case 'Waxing': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddService = async (formData: any) => {
    // Create new service object
    const newService: ShopService = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      category: formData.category,
      subcategory: formData.subcategory,
      shopId: '1', // This would come from auth context
      shopName: 'Downtown Beauty Studio', // This would come from auth context
      providerId: formData.providerId || undefined,
      providerName: formData.providerName || undefined,
      isActive: true,
      image: formData.image ? URL.createObjectURL(formData.image) : undefined,
      tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()) : [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    setShopServices(prev => [newService, ...prev])
    setShowAddModal(false)
  }

  const handleToggleServiceStatus = (serviceId: string) => {
    setShopServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, isActive: !service.isActive, updatedAt: new Date() }
        : service
    ))
  }

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setShopServices(prev => prev.filter(service => service.id !== serviceId))
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
              <p className="text-gray-600 mt-2">Manage your shop's services and offerings</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
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
                  placeholder="Search services..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {serviceCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
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

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price & Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
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
                {filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-lg bg-ikigai-primary flex items-center justify-center overflow-hidden">
                          {service.image ? (
                            <img 
                              src={service.image} 
                              alt={service.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-white">
                              {service.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{service.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                          {service.category}
                        </span>
                        {service.subcategory && (
                          <div className="text-xs text-gray-500 mt-1">{service.subcategory}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.providerName || 'Any Provider'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {service.price}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {service.duration} min
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {service.tags?.slice(0, 2).map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {service.tags && service.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{service.tags.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        service.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleServiceStatus(service.id)}
                          className={service.isActive ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                        >
                          {service.isActive ? 'Deactivate' : 'Activate'}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Service Form */}
        <ShopServiceForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddService}
          serviceCategories={serviceCategories}
          serviceSubcategories={serviceSubcategories}
        />
      </div>
    </DashboardLayout>
  )
}
