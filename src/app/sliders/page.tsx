'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, Eye, Image as ImageIcon, Star, ArrowUp, ArrowDown } from 'lucide-react'
import { Slider } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { SliderForm } from '@/components/forms/slider-form'

// Mock data for demonstration
const mockSliders: Slider[] = [
  {
    id: '1',
    title: 'Welcome to Ikigai Beauty',
    description: 'Discover the best beauty services in your city with our professional providers',
    image: '/api/placeholder/800/400',
    linkUrl: '/services',
    isActive: true,
    isCurrent: true,
    order: 1,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Premium Hair Services',
    description: 'Expert hairstylists and barbers ready to give you the perfect look',
    image: '/api/placeholder/800/400',
    linkUrl: '/shops',
    isActive: true,
    isCurrent: true,
    order: 2,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    title: 'Book Your Appointment',
    description: 'Easy online booking system for all your beauty needs',
    image: '/api/placeholder/800/400',
    linkUrl: '/bookings',
    isActive: true,
    isCurrent: true,
    order: 3,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: '4',
    title: 'Special Offers',
    description: 'Limited time offers on selected beauty services',
    image: '/api/placeholder/800/400',
    linkUrl: '/offers',
    isActive: true,
    isCurrent: false,
    order: 0,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '5',
    title: 'New Salon Opening',
    description: 'Check out our newest salon location with grand opening discounts',
    image: '/api/placeholder/800/400',
    isActive: false,
    isCurrent: false,
    order: 0,
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  }
]

export default function SlidersPage() {
  const [sliders, setSliders] = useState<Slider[]>(mockSliders)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null)

  const filteredSliders = sliders.filter(slider => {
    const matchesSearch = slider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         slider.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && slider.isActive) ||
                         (filterStatus === 'inactive' && !slider.isActive) ||
                         (filterStatus === 'current' && slider.isCurrent)
    return matchesSearch && matchesStatus
  })

  const currentSliders = sliders
    .filter(s => s.isCurrent)
    .sort((a, b) => a.order - b.order)

  const handleAddSlider = async (data: any) => {
    const newSlider: Slider = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      image: data.image ? URL.createObjectURL(data.image) : '/api/placeholder/800/400',
      linkUrl: data.linkUrl || '',
      isActive: data.isActive !== false,
      isCurrent: data.isCurrent || false,
      order: data.isCurrent ? getNextCurrentOrder() : 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setSliders(prev => [newSlider, ...prev])
    setShowAddModal(false)
  }

  const handleUpdateSlider = async (data: any) => {
    if (!editingSlider) return
    
    const updatedSlider: Slider = {
      ...editingSlider,
      title: data.title,
      description: data.description,
      image: data.image ? URL.createObjectURL(data.image) : editingSlider.image,
      linkUrl: data.linkUrl || '',
      isActive: data.isActive !== false,
      isCurrent: data.isCurrent || false,
      order: data.isCurrent ? (editingSlider.order || getNextCurrentOrder()) : 0,
      updatedAt: new Date()
    }
    
    setSliders(prev => prev.map(s => 
      s.id === editingSlider.id ? updatedSlider : s
    ))
    setEditingSlider(null)
  }

  const handleDeleteSlider = (sliderId: string) => {
    if (window.confirm('Are you sure you want to delete this slider?')) {
      setSliders(prev => prev.filter(s => s.id !== sliderId))
    }
  }

  const handleToggleStatus = (sliderId: string) => {
    setSliders(prev => prev.map(s => 
      s.id === sliderId 
        ? { ...s, isActive: !s.isActive, updatedAt: new Date() }
        : s
    ))
  }

  const handleSetCurrent = (sliderId: string) => {
    const slider = sliders.find(s => s.id === sliderId)
    if (!slider) return

    if (slider.isCurrent) {
      // Remove from current
      setSliders(prev => prev.map(s => 
        s.id === sliderId 
          ? { ...s, isCurrent: false, order: 0, updatedAt: new Date() }
          : s
      ))
    } else {
      // Add to current (max 3)
      if (currentSliders.length >= 3) {
        alert('You can only have 3 current slides at a time. Please remove one first.')
        return
      }
      setSliders(prev => prev.map(s => 
        s.id === sliderId 
          ? { ...s, isCurrent: true, order: getNextCurrentOrder(), updatedAt: new Date() }
          : s
      ))
    }
  }

  const getNextCurrentOrder = () => {
    const currentOrders = sliders.filter(s => s.isCurrent).map(s => s.order)
    return currentOrders.length > 0 ? Math.max(...currentOrders) + 1 : 1
  }

  const handleReorderCurrent = (sliderId: string, direction: 'up' | 'down') => {
    const slider = sliders.find(s => s.id === sliderId)
    if (!slider || !slider.isCurrent) return

    const currentSlidersSorted = currentSliders
    const currentIndex = currentSlidersSorted.findIndex(s => s.id === sliderId)
    
    if (direction === 'up' && currentIndex > 0) {
      const prevSlider = currentSlidersSorted[currentIndex - 1]
      setSliders(prev => prev.map(s => 
        s.id === sliderId 
          ? { ...s, order: prevSlider.order, updatedAt: new Date() }
          : s.id === prevSlider.id
          ? { ...s, order: slider.order, updatedAt: new Date() }
          : s
      ))
    } else if (direction === 'down' && currentIndex < currentSlidersSorted.length - 1) {
      const nextSlider = currentSlidersSorted[currentIndex + 1]
      setSliders(prev => prev.map(s => 
        s.id === sliderId 
          ? { ...s, order: nextSlider.order, updatedAt: new Date() }
          : s.id === nextSlider.id
          ? { ...s, order: slider.order, updatedAt: new Date() }
          : s
      ))
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sliders</h1>
              <p className="text-gray-600 mt-2">Manage homepage sliders and current slides</p>
              <div className="mt-2 text-sm text-gray-500">
                Current slides: {currentSliders.length}/3
              </div>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Slider
            </Button>
          </div>
        </div>

        {/* Current Slides Preview */}
        {currentSliders.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Slides Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentSliders.map((slider, index) => (
                <div key={slider.id} className="relative">
                  <img
                    src={slider.image}
                    alt={slider.title}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    #{index + 1}
                  </div>
                  <div className="mt-2">
                    <h4 className="font-medium text-sm">{slider.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{slider.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sliders..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="current">Current Slides</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSliders.map((slider) => (
            <div key={slider.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative">
                <img
                  src={slider.image}
                  alt={slider.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                  }}
                />
                <div className="absolute top-3 right-3 flex flex-col space-y-1">
                  {slider.isCurrent && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Current #{slider.order}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    slider.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {slider.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{slider.title}</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {slider.description}
                </p>

                {slider.linkUrl && (
                  <p className="text-xs text-blue-600 mb-4">
                    Link: {slider.linkUrl}
                  </p>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Created {slider.createdAt.toLocaleDateString()}
                  </div>
                  <div className="flex space-x-1">
                    {slider.isCurrent && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleReorderCurrent(slider.id, 'up')}
                          disabled={currentSliders.findIndex(s => s.id === slider.id) === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleReorderCurrent(slider.id, 'down')}
                          disabled={currentSliders.findIndex(s => s.id === slider.id) === currentSliders.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSetCurrent(slider.id)}
                      className={slider.isCurrent ? 'text-yellow-600' : 'text-gray-600'}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleStatus(slider.id)}
                    >
                      {slider.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingSlider(slider)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteSlider(slider.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSliders.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <ImageIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sliders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first slider.'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Slider
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Add Slider Form */}
        <SliderForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSlider}
        />

        {/* Edit Slider Form */}
        <SliderForm
          isOpen={!!editingSlider}
          onClose={() => setEditingSlider(null)}
          onSubmit={handleUpdateSlider}
          initialData={editingSlider}
        />
      </div>
    </DashboardLayout>
  )
}

