'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { Service } from '@/types'

interface ServiceFormData {
  shopId: string
  name: string
  description: string
  category: string
  sous_category: string
  price: number
  duration: number
  tags?: string
  imageurl: string
  provider_id?: number
  provider_name?: string
  profileImageFile?: File
  galleryImages?: File[]
}

interface ServiceFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: ServiceFormData) => void
  shops: Array<{ id: string; name: string }>
  selectedShopId?: string
  initialData?: Service | null
}

export function ServiceForm({
  isOpen,
  onClose,
  onSubmit,
  shops,
  selectedShopId,
  initialData,
}: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    shopId: selectedShopId || '',
    name: '',
    description: '',
    category: '',
    sous_category: '',
    price: 0,
    duration: 30,
    tags: '',
    imageurl: '',
    provider_id: selectedShopId ? parseInt(selectedShopId) : 0 ,
    provider_name: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [subcategories, setSubcategories] = useState<Array<{ id: string; name: string }>>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)

  // ✅ Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const res = await fetch('http://168.231.101.119:4040/categories')
        const data = await res.json()
        setCategories(data)
      } catch (err) {
        console.error('Error fetching categories:', err)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // ✅ Fetch subcategories when a category is selected
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!formData.category) return
      try {
        setLoadingSubcategories(true)
        const res = await fetch(`http://168.231.101.119:4040/sous-categories/subcate/${formData.category}`)
        const data = await res.json()
        setSubcategories(data)
      } catch (err) {
        console.error('Error fetching subcategories:', err)
      } finally {
        setLoadingSubcategories(false)
      }
    }

    fetchSubcategories()
  }, [formData.category])

  useEffect(() => {
    if (initialData) {
      setFormData({
        shopId: initialData.shopId,
        name: initialData.name,
        description: initialData.description,
        category: initialData.category,
        sous_category: initialData.subcategory || '',
        price: initialData.price,
        duration: initialData.duration,
        imageurl: initialData.imageurl || 'https://cdn.example.com/default-service.jpg'
      })
    } else {
      setFormData({
        shopId: selectedShopId || '',
        name: '',
        description: '',
        category: '',
        sous_category: '',
        price: 0,
        duration: 30,
        tags: '',
        imageurl: '',
        provider_id: selectedShopId ? parseInt(selectedShopId) : 0,
        provider_name: '',
      })
    }
  }, [initialData, selectedShopId, isOpen])

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.shopId) newErrors.shopId = 'Please select a shop'
    if (!formData.name.trim()) newErrors.name = 'Service name is required'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.sous_category) newErrors.sous_category = 'Subcategory is required'
    if (!formData.duration || formData.duration <= 0) newErrors.duration = 'Valid duration is required'
    if (!formData.profileImageFile) newErrors.profileImageFile = 'Profile image is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validateForm()) return

  setIsSubmitting(true)
  try {
    const body = {
      name: formData.name,
      description: formData.description,
      Category: formData.category, // note the capital "C"
      sous_category: formData.sous_category,
      price: formData.price.toString(), // backend expects string
      duration: `${formData.duration}min`, // backend expects text like "30min"
      tags: formData.tags || '',
      imageurl: formData.imageurl || 'https://cdn.example.com/default-service.jpg', // backend expects URL, not file
      provider_id: selectedShopId ? selectedShopId.toString() : '',
      provider_name: formData.provider_name || '',
    }

    const response = await fetch('http://168.231.101.119:4040/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Failed to create service: ${errText}`)
    }

    const data = await response.json()
    console.log('✅ Service created successfully:', data)

    if (onSubmit) onSubmit(formData)

    setFormData({
      shopId: selectedShopId || '',
      name: '',
      description: '',
      category: '',
      sous_category: '',
      price: 0,
      duration: 30,
      tags: '',
      imageurl: '',
      provider_id: selectedShopId ? parseInt(selectedShopId) : 0,
      provider_name: '',  
    })

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
                {selectedShopId ? 'Shop' : 'Select Shop'} * {name}
              </label>
              <select
                value={formData.shopId}
                onChange={(e) => handleInputChange('shopId', e.target.value)}
                disabled={!!selectedShopId}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Choose a shop...</option>
               {/*  {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))} */}
                <option value={selectedShopId ? parseInt(selectedShopId) : 0}>{selectedShopId ? parseInt(selectedShopId) : 0 } </option>
                
              </select>
            </div>

            {/* Categories (Dynamic) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label>Main Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    handleInputChange('category', e.target.value)
                    handleInputChange('sous_category', '')
                  }}
                  disabled={loadingCategories}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Subcategory *</label>
                <select
                  value={formData.sous_category}
                  onChange={(e) => handleInputChange('sous_category', e.target.value)}
                  disabled={!formData.category || loadingSubcategories}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select subcategory...</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Other fields remain unchanged */}
            <div>
              <label>Service Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label>Price *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label>Duration (min) *</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label>Description *</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* File Uploads */}
            <div>
              <label>Profile Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleInputChange('profileImageFile', file)
                }}
              />
            </div>

            <div>
              <label>Gallery Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  handleInputChange('galleryImages', files)
                }}
              />
            </div>

            {/* Buttons */}
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
                  ? 'Update Service'
                  : 'Create Service'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
