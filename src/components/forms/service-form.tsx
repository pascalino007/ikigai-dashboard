'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Scissors, DollarSign, Clock, Tag } from 'lucide-react'
import { Service } from '@/types'

interface ServiceFormData {
  shopId: string
  name: string
  price: number
  description: string
  category: string
  subcategory: string
  duration: number
}

interface ServiceFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ServiceFormData) => void
  shops: Array<{ id: string; name: string }>
  selectedShopId?: string
  initialData?: Service | null
}

const SERVICE_CATEGORIES = {
  'Hair': ['Haircut', 'Hair Styling', 'Hair Coloring', 'Hair Treatment', 'Hair Wash'],
  'Beauty': ['Makeup', 'Facial', 'Eyebrow Shaping', 'Eyelash Extension', 'Skin Treatment'],
  'Nails': ['Manicure', 'Pedicure', 'Nail Art', 'Gel Nails', 'Nail Repair'],
  'Spa': ['Massage', 'Body Treatment', 'Relaxation', 'Aromatherapy', 'Hot Stone'],
  'Barber': ['Haircut', 'Beard Trim', 'Shave', 'Mustache Styling', 'Hair Wash']
}

export function ServiceForm({ isOpen, onClose, onSubmit, shops, selectedShopId, initialData }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    shopId: selectedShopId || '',
    name: '',
    price: 0,
    description: '',
    category: '',
    subcategory: '',
    duration: 30
  })

  const [errors, setErrors] = useState<Partial<ServiceFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        shopId: initialData.shopId,
        name: initialData.name,
        price: initialData.price,
        description: initialData.description,
        category: initialData.category,
        subcategory: initialData.subcategory,
        duration: initialData.duration
      })
    } else {
      setFormData({
        shopId: selectedShopId || '',
        name: '',
        price: 0,
        description: '',
        category: '',
        subcategory: '',
        duration: 30
      })
    }
  }, [initialData, selectedShopId, isOpen])

  const handleInputChange = (field: keyof ServiceFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ServiceFormData> = {}

    if (!formData.shopId) newErrors.shopId = 'Please select a shop'
    if (!formData.name.trim()) newErrors.name = 'Service name is required'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.subcategory) newErrors.subcategory = 'Subcategory is required'
    if (!formData.duration || formData.duration <= 0) newErrors.duration = 'Valid duration is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      // Reset form
      setFormData({
        shopId: selectedShopId || '',
        name: '',
        price: 0,
        description: '',
        category: '',
        subcategory: '',
        duration: 30
      })
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Service' : 'Add New Service'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {selectedShopId ? 'Shop' : 'Select Shop'} *
              </label>
              <select
                value={formData.shopId}
                onChange={(e) => handleInputChange('shopId', e.target.value)}
                disabled={!!selectedShopId}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.shopId ? 'border-red-500' : 'border-gray-300'
                } ${selectedShopId ? 'bg-gray-100' : ''}`}
              >
                <option value="">Choose a shop...</option>
                {shops.map(shop => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
              {selectedShopId && (
                <p className="text-sm text-gray-500 mt-1">
                  Service will be added to: <strong>{shops.find(s => s.id === selectedShopId)?.name}</strong>
                </p>
              )}
              {errors.shopId && (
                <p className="text-red-500 text-sm mt-1">{errors.shopId}</p>
              )}
            </div>

            {/* Service Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Scissors className="h-5 w-5 mr-2" />
                Service Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter service name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Price *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="30"
                  />
                  {errors.duration && (
                    <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Brief description of the service..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Service Categories
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      handleInputChange('category', e.target.value)
                      // Reset subcategory when main category changes
                      handleInputChange('subcategory', '')
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select category...</option>
                    {Object.keys(SERVICE_CATEGORIES).map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategory *
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                    disabled={!formData.category}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                      errors.subcategory ? 'border-red-500' : 'border-gray-300'
                    } ${!formData.category ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">
                      {formData.category ? 'Select subcategory...' : 'Select main category first'}
                    </option>
                    {formData.category && SERVICE_CATEGORIES[formData.category as keyof typeof SERVICE_CATEGORIES]?.map(subcategory => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>
                  {errors.subcategory && (
                    <p className="text-red-500 text-sm mt-1">{errors.subcategory}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (initialData ? 'Updating...' : 'Creating...') 
                  : (initialData ? 'Update Service' : 'Create Service')
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
