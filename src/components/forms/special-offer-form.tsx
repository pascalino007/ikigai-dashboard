'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Calendar, Percent, DollarSign, Clock, Users, Image as ImageIcon } from 'lucide-react'
import { ShopService } from '@/types'

interface SpecialOfferFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  shopServices: ShopService[]
}

export function SpecialOfferForm({ isOpen, onClose, onSubmit, shopServices }: SpecialOfferFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceId: '',
    originalPrice: '',
    discountedPrice: '',
    startDate: '',
    endDate: '',
    duration: '',
    maxUses: '',
    image: null as File | null,
    termsAndConditions: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate duration when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setFormData(prev => ({ ...prev, duration: diffDays.toString() }))
    }
  }, [formData.startDate, formData.endDate])

  // Auto-fill original price when service is selected
  useEffect(() => {
    if (formData.serviceId) {
      const selectedService = shopServices.find(s => s.id === formData.serviceId)
      if (selectedService) {
        setFormData(prev => ({ ...prev, originalPrice: selectedService.price.toString() }))
      }
    }
  }, [formData.serviceId, shopServices])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.serviceId) newErrors.serviceId = 'Service is required'
    if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
      newErrors.originalPrice = 'Valid original price is required'
    }
    if (!formData.discountedPrice || parseFloat(formData.discountedPrice) <= 0) {
      newErrors.discountedPrice = 'Valid discounted price is required'
    }
    if (parseFloat(formData.discountedPrice) >= parseFloat(formData.originalPrice)) {
      newErrors.discountedPrice = 'Discounted price must be less than original price'
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date'
    }
    if (formData.maxUses && parseInt(formData.maxUses) <= 0) {
      newErrors.maxUses = 'Max uses must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        ...formData,
        originalPrice: parseFloat(formData.originalPrice),
        discountedPrice: parseFloat(formData.discountedPrice),
        duration: parseInt(formData.duration),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined
      })
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      serviceId: '',
      originalPrice: '',
      discountedPrice: '',
      startDate: '',
      endDate: '',
      duration: '',
      maxUses: '',
      image: null,
      termsAndConditions: ''
    })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const calculateDiscountPercentage = () => {
    if (formData.originalPrice && formData.discountedPrice) {
      const original = parseFloat(formData.originalPrice)
      const discounted = parseFloat(formData.discountedPrice)
      if (original > 0 && discounted < original) {
        return Math.round(((original - discounted) / original) * 100)
      }
    }
    return 0
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create Special Offer</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title and Description */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Title *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Summer Hair Special"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Describe the special offer..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Service *
            </label>
            <select
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                errors.serviceId ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.serviceId}
              onChange={(e) => handleInputChange('serviceId', e.target.value)}
            >
              <option value="">Choose a service...</option>
              {shopServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.shopName} (${service.price})
                </option>
              ))}
            </select>
            {errors.serviceId && <p className="text-red-500 text-sm mt-1">{errors.serviceId}</p>}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Original Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.originalPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                value={formData.originalPrice}
                onChange={(e) => handleInputChange('originalPrice', e.target.value)}
              />
              {errors.originalPrice && <p className="text-red-500 text-sm mt-1">{errors.originalPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Discounted Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.discountedPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                value={formData.discountedPrice}
                onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
              />
              {errors.discountedPrice && <p className="text-red-500 text-sm mt-1">{errors.discountedPrice}</p>}
            </div>
          </div>

          {/* Discount Preview */}
          {formData.originalPrice && formData.discountedPrice && calculateDiscountPercentage() > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center text-green-800">
                <Percent className="h-4 w-4 mr-2" />
                <span className="font-medium">{calculateDiscountPercentage()}% OFF</span>
                <span className="ml-2 text-sm">
                  Save ${(parseFloat(formData.originalPrice) - parseFloat(formData.discountedPrice)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Start Date *
              </label>
              <input
                type="date"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                End Date *
              </label>
              <input
                type="date"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Duration Display */}
          {formData.duration && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center text-blue-800">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium">Duration: {formData.duration} days</span>
              </div>
            </div>
          )}

          {/* Max Uses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Maximum Uses (Optional)
            </label>
            <input
              type="number"
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                errors.maxUses ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Leave empty for unlimited"
              value={formData.maxUses}
              onChange={(e) => handleInputChange('maxUses', e.target.value)}
            />
            {errors.maxUses && <p className="text-red-500 text-sm mt-1">{errors.maxUses}</p>}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="h-4 w-4 inline mr-1" />
              Offer Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              onChange={(e) => handleInputChange('image', e.target.files?.[0] || null)}
            />
          </div>

          {/* Terms and Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms and Conditions (Optional)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              rows={3}
              placeholder="Any special terms or conditions for this offer..."
              value={formData.termsAndConditions}
              onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-ikigai-primary hover:bg-ikigai-primary/90">
              Create Special Offer
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
