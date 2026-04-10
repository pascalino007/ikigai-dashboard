'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Star, ArrowUp, ArrowDown } from 'lucide-react'
import { Slider } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { SliderForm } from '@/components/forms/slider-form'
import { sliderApi, handleApiError } from '@/services/api'


export default function SlidersPage() {
  const [sliders, setSliders] = useState<Slider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null)

  const filteredSliders = sliders.filter(slider => {
    const matchesSearch = slider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (slider.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && slider.isActive) ||
                         (filterStatus === 'inactive' && !slider.isActive) ||
                         (filterStatus === 'current' && slider.isCurrent)
    return matchesSearch && matchesStatus
  })

  const currentSliders = sliders
    .filter(s => s.isCurrent)
    .sort((a, b) => a.order - b.order)

  useEffect(() => {
    fetchSliders()
  }, [])

  const fetchSliders = async () => {
    setIsLoading(true)
    try {
      const data = await sliderApi.getAll()
      setSliders(data.map((s: any) => ({
        ...s,
        id: String(s.id),
        image: s.imageUrl || '/api/placeholder/800/400',
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt)
      })))
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSlider = async (formData: FormData) => {
    try {
      await sliderApi.create(formData)
      await fetchSliders()
      setShowAddModal(false)
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleUpdateSlider = async (formData: FormData) => {
    if (!editingSlider) return
    try {
      await sliderApi.update(editingSlider.id, formData)
      await fetchSliders()
      setEditingSlider(null)
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleDeleteSlider = async (sliderId: string) => {
    if (!window.confirm('Are you sure you want to delete this slider?')) return
    try {
      await sliderApi.delete(sliderId)
      await fetchSliders()
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleToggleStatus = async (sliderId: string, currentStatus: boolean) => {
    try {
      const dto = new FormData()
      dto.append('isActive', String(!currentStatus))
      await sliderApi.update(sliderId, dto)
      await fetchSliders()
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleSetCurrent = async (sliderId: string, isCurrent: boolean) => {
    if (!isCurrent && currentSliders.length >= 3) {
      alert('You can only have 3 current slides at a time. Please remove one first.')
      return
    }
    try {
      const dto = new FormData()
      dto.append('isCurrent', String(!isCurrent))
      dto.append('order', isCurrent ? '0' : String(getNextCurrentOrder()))
      await sliderApi.update(sliderId, dto)
      await fetchSliders()
    } catch (error) {
      handleApiError(error)
    }
  }

  const getNextCurrentOrder = () => {
    const currentOrders = sliders.filter(s => s.isCurrent).map(s => s.order)
    return currentOrders.length > 0 ? Math.max(...currentOrders) + 1 : 1
  }

  const handleReorderCurrent = async (sliderId: string, direction: 'up' | 'down') => {
    const slider = sliders.find(s => s.id === sliderId)
    if (!slider || !slider.isCurrent) return

    const currentSlidersSorted = currentSliders
    const currentIndex = currentSlidersSorted.findIndex(s => s.id === sliderId)
    
    if (direction === 'up' && currentIndex > 0) {
      const prevSlider = currentSlidersSorted[currentIndex - 1]
      try {
        const dto1 = new FormData()
        dto1.append('order', String(prevSlider.order))
        await sliderApi.update(sliderId, dto1)
        
        const dto2 = new FormData()
        dto2.append('order', String(slider.order))
        await sliderApi.update(prevSlider.id, dto2)
        await fetchSliders()
      } catch (error) {
        handleApiError(error)
      }
    } else if (direction === 'down' && currentIndex < currentSlidersSorted.length - 1) {
      const nextSlider = currentSlidersSorted[currentIndex + 1]
      try {
        const dto1 = new FormData()
        dto1.append('order', String(nextSlider.order))
        await sliderApi.update(sliderId, dto1)
        
        const dto2 = new FormData()
        dto2.append('order', String(slider.order))
        await sliderApi.update(nextSlider.id, dto2)
        await fetchSliders()
      } catch (error) {
        handleApiError(error)
      }
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
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
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ikigai-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading sliders...</p>
          </div>
        )}

          {/* Sliders Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSliders.map((slider) => (
            <div key={slider.id} className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
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
                      onClick={() => handleSetCurrent(slider.id, slider.isCurrent)}
                      className={slider.isCurrent ? 'text-yellow-600' : 'text-gray-600'}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleStatus(slider.id, slider.isActive)}
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
        )}

        {/* Empty State */}
        {!isLoading && filteredSliders.length === 0 && (
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

