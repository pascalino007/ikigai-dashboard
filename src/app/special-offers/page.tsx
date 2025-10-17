'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Edit, Trash2, Eye, Calendar, Percent, Clock } from 'lucide-react'
import { SpecialOffer, ShopService } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { SpecialOfferForm } from '@/components/forms/special-offer-form'
import { AdminOnly } from '@/components/auth/route-guard'

// Mock data for demonstration
const mockShopServices: ShopService[] = [
  {
    id: '1',
    name: 'Haircut & Styling',
    description: 'Professional haircut with styling',
    price: 50,
    duration: 60,
    category: 'Hair',
    subcategory: 'Cut & Style',
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Manicure & Pedicure',
    description: 'Complete nail care service',
    price: 35,
    duration: 90,
    category: 'Nails',
    subcategory: 'Manicure',
    shopId: '2',
    shopName: 'Elite Hair & Spa',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Facial Treatment',
    description: 'Deep cleansing facial treatment',
    price: 80,
    duration: 75,
    category: 'Skincare',
    subcategory: 'Facial',
    shopId: '3',
    shopName: 'Modern Cuts Barbershop',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
]

const mockSpecialOffers: SpecialOffer[] = [
  {
    id: '1',
    title: 'Summer Hair Special',
    description: 'Get 20% off on all hair services this summer',
    serviceId: '1',
    serviceName: 'Haircut & Styling',
    shopId: '1',
    shopName: 'Downtown Beauty Studio',
    originalPrice: 50,
    discountedPrice: 40,
    discountPercentage: 20,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    duration: 92,
    isActive: true,
    maxUses: 100,
    usedCount: 23,
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-05-15'),
    createdBy: 'admin-1'
  },
  {
    id: '2',
    title: 'New Customer Discount',
    description: 'First-time customers get 30% off nail services',
    serviceId: '2',
    serviceName: 'Manicure & Pedicure',
    shopId: '2',
    shopName: 'Elite Hair & Spa',
    originalPrice: 35,
    discountedPrice: 24.5,
    discountPercentage: 30,
    startDate: new Date('2024-07-01'),
    endDate: new Date('2024-07-31'),
    duration: 31,
    isActive: true,
    maxUses: 50,
    usedCount: 12,
    createdAt: new Date('2024-06-20'),
    updatedAt: new Date('2024-06-20'),
    createdBy: 'admin-1'
  }
]

export default function SpecialOffersPage() {
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>(mockSpecialOffers)
  const [shopServices, setShopServices] = useState<ShopService[]>(mockShopServices)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredOffers = specialOffers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && offer.isActive) ||
                         (filterStatus === 'inactive' && !offer.isActive)
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (offer: SpecialOffer) => {
    const now = new Date()
    if (!offer.isActive) return 'bg-red-100 text-red-800'
    if (now < offer.startDate) return 'bg-yellow-100 text-yellow-800'
    if (now > offer.endDate) return 'bg-gray-100 text-gray-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (offer: SpecialOffer) => {
    const now = new Date()
    if (!offer.isActive) return 'Inactive'
    if (now < offer.startDate) return 'Scheduled'
    if (now > offer.endDate) return 'Expired'
    return 'Active'
  }

  const handleAddSpecialOffer = async (formData: any) => {
    // Find the service to get its details
    const service = shopServices.find(s => s.id === formData.serviceId)
    if (!service) return

    // Calculate discount percentage
    const discountPercentage = Math.round(((formData.originalPrice - formData.discountedPrice) / formData.originalPrice) * 100)

    // Create new special offer
    const newOffer: SpecialOffer = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      serviceId: formData.serviceId,
      serviceName: service.name,
      shopId: service.shopId,
      shopName: service.shopName,
      originalPrice: formData.originalPrice,
      discountedPrice: formData.discountedPrice,
      discountPercentage,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      duration: formData.duration,
      isActive: true,
      maxUses: formData.maxUses || undefined,
      usedCount: 0,
      image: formData.image ? URL.createObjectURL(formData.image) : undefined,
      termsAndConditions: formData.termsAndConditions,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin-1' // This would come from auth context
    }

    setSpecialOffers(prev => [newOffer, ...prev])
    setShowAddModal(false)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <AdminOnly>
      <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Special Offers</h1>
              <p className="text-gray-600 mt-2">Manage special offers and promotions for shops</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Special Offer
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
                  placeholder="Search offers..."
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
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Special Offers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Offer Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service & Shop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
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
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                        <div className="text-sm text-gray-500">{offer.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{offer.serviceName}</div>
                        <div className="text-sm text-gray-500">{offer.shopName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          <span className="line-through text-gray-400">${offer.originalPrice}</span>
                          <span className="ml-2 font-semibold text-green-600">${offer.discountedPrice}</span>
                        </div>
                        <div className="text-sm text-red-600 font-medium">
                          <Percent className="h-3 w-3 inline mr-1" />
                          {offer.discountPercentage}% OFF
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {offer.duration} days
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {offer.usedCount} / {offer.maxUses || '∞'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(offer)}`}>
                        {getStatusText(offer)}
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

        {/* Add Special Offer Form */}
        <SpecialOfferForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSpecialOffer}
          shopServices={shopServices}
        />
      </div>
    </DashboardLayout>
    </AdminOnly>
  )
}
