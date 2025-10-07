'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, MapPin, Phone, Mail, Edit, Trash2, Eye } from 'lucide-react'
import { Shop } from '@/types'
import { ShopForm } from '@/components/forms/shop-form'
import { DashboardLayout } from '@/components/dashboard-layout'

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

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>(mockShops)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const handleAddShop = async (data: any) => {
    const newShop: Shop = {
      id: Date.now().toString(),
      name: data.name,
      category: data.category,
      tags: data.tags,
      profileImage: data.profileImage ? URL.createObjectURL(data.profileImage) : undefined,
      images: (data.images || []).map((f: File) => URL.createObjectURL(f)),
      address: data.address,
      city: data.city,
      phone: data.phone,
      email: data.email || '',
      description: data.description,
      isActive: true,
      ownerId: 'owner-new',
      openingHours: data.openingHours,
      createdAt: new Date(),
      updatedAt: new Date(),
      services: []
    }
    setShops(prev => [newShop, ...prev])
    setShowAddModal(false)
  }

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shops</h1>
            <p className="text-gray-600 mt-2">Manage beauty shops and salons</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shop
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search shops..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Shops Grid */}
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
                  {shop.address}, {shop.city}
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
                  Created {shop.createdAt.toLocaleDateString()}
                </div>
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
              </div>
            </div>
          </div>
        ))}
      </div>

      <ShopForm isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddShop} />
      </div>
    </DashboardLayout>
  )
}
