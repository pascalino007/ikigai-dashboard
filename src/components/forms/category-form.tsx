'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, ImageIcon, Tag, Upload } from 'lucide-react'
import { Category } from '@/types'

interface CategoryFormData {
  name: string
  description: string
  imageurl: string
  isActive: boolean
}

interface CategoryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CategoryFormData) => void
  initialData?: Category | null
}

export function CategoryForm({ isOpen, onClose, onSubmit, initialData }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    imageurl: '',
    isActive: true,
  })

  const [errors, setErrors] = useState<Partial<CategoryFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')

  // ✅ Initialize form when editing or opening
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        imageurl: initialData.imageurl || '',
        isActive: initialData.isActive ?? true,
      })
      setImagePreview(initialData.imageurl || '')
    } else {
      setFormData({
        name: '',
        description: '',
        imageurl: '',
        isActive: true,
      })
      setImagePreview('')
    }
  }, [initialData, isOpen])

  // ✅ Controlled input handler
  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  // ✅ Image change — for preview only
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // For now, send a placeholder URL to backend
      handleInputChange('imageurl', 'https://cdn.example.com/categories/electronics.jpg')
    }
  }

  // ✅ Validation
  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {}
    if (!formData.name.trim()) newErrors.name = 'Category name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.imageurl.trim()) newErrors.imageurl = 'Image URL is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ✅ Submit handler (only sends once)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageurl: formData.imageurl.trim(),
      }

      const response = await fetch('http://localhost:4040/categories/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to submit category')

      const result = await response.json()
      console.log('✅ Successfully created category:', result)

      onSubmit(formData)
      setFormData({ name: '', description: '', imageurl: '', isActive: true })
      setImagePreview('')
      onClose()
    } catch (error) {
      console.error('❌ Error submitting form:', error)
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
              {initialData ? 'Edit Category' : 'Add New Category'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Tag className="h-5 w-5 mr-2" /> Category Details
              </h3>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 ${
                    errors.name ? 'border-red-500' : 'border-gray-300 focus:ring-ikigai-primary'
                  }`}
                  placeholder="Enter category name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 ${
                    errors.description
                      ? 'border-red-500'
                      : 'border-gray-300 focus:ring-ikigai-primary'
                  }`}
                  placeholder="Enter category description..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Category Image *
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
                      <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                {errors.imageurl && <p className="text-red-500 text-sm mt-1">{errors.imageurl}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? initialData
                    ? 'Updating...'
                    : 'Creating...'
                  : initialData
                  ? 'Update Category'
                  : 'Create Category'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
