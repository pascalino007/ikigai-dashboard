'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, ImageIcon, Upload, Star } from 'lucide-react'
import { Slider } from '@/types'

interface SliderFormData {
  title: string
  description: string
  image: File | null
  linkUrl: string
  isActive: boolean
  isCurrent: boolean
}

interface SliderFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SliderFormData) => void
  initialData?: Slider | null
}

export function SliderForm({ isOpen, onClose, onSubmit, initialData }: SliderFormProps) {
  const [formData, setFormData] = useState<SliderFormData>({
    title: '',
    description: '',
    image: null,
    linkUrl: '',
    isActive: true,
    isCurrent: false
  })

  const [errors, setErrors] = useState<Partial<SliderFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')

  // Initialize form with initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        image: null,
        linkUrl: initialData.linkUrl || '',
        isActive: initialData.isActive,
        isCurrent: initialData.isCurrent
      })
      setImagePreview(initialData.image)
    } else {
      setFormData({
        title: '',
        description: '',
        image: null,
        linkUrl: '',
        isActive: true,
        isCurrent: false
      })
      setImagePreview('')
    }
  }, [initialData, isOpen])

  const handleInputChange = (field: keyof SliderFormData, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleInputChange('image', file)
    
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(initialData?.image || '')
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<SliderFormData> = {}

    if (!formData.title.trim()) newErrors.title = 'Slider title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.image && !initialData) newErrors.image = 'Image is required'

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
        title: '',
        description: '',
        image: null,
        linkUrl: '',
        isActive: true,
        isCurrent: false
      })
      setImagePreview('')
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
              {initialData ? 'Edit Slider' : 'Add New Slider'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Slider Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Slider Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slider Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter slider title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
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
                  placeholder="Enter slider description..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => handleInputChange('linkUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Slider Image {!initialData && '*'}
                </label>
                
                {imagePreview && (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or GIF (Recommended: 800x400px)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-ikigai-primary focus:ring-ikigai-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active slider
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={formData.isCurrent}
                    onChange={(e) => handleInputChange('isCurrent', e.target.checked)}
                    className="h-4 w-4 text-ikigai-primary focus:ring-ikigai-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-900 flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    Set as current slide (max 3)
                  </label>
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
                  : (initialData ? 'Update Slider' : 'Create Slider')
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

