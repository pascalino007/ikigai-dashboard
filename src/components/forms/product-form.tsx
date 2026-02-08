'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, Image as ImageIcon, Loader2, Trash2, AlertCircle } from 'lucide-react'

// Interface matching the backend entity/DTO structure
export interface Product {
  id?: number
  name: string
  image1?: string
  image2?: string
  image3?: string
  price: string
  Category: string
  status: string
  Description?: string
  provider_id: number
}

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: any) => void
  initialData?: Product | null
  providerId: number
}

export function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  providerId
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    status: 'available',
    description: '',
    image1: '',
    image2: '',
    image3: '',
    // Local file state
    file1: null as File | null,
    file2: null as File | null,
    file3: null as File | null
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Initialize form
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          price: initialData.price || '',
          category: initialData.Category || '',
          status: initialData.status || 'available',
          description: initialData.Description || '',
          image1: initialData.image1 || '',
          image2: initialData.image2 || '',
          image3: initialData.image3 || '',
          file1: null,
          file2: null,
          file3: null
        })
      } else {
        setFormData({
          name: '',
          price: '',
          category: '',
          status: 'available',
          description: '',
          image1: '',
          image2: '',
          image3: '',
          file1: null,
          file2: null,
          file3: null
        })
      }
      setErrors({})
    }
  }, [initialData, isOpen])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleFileChange = (slot: 1 | 2 | 3, file: File | null) => {
    if (file) {
      // Create local preview
      const previewUrl = URL.createObjectURL(file)
      setFormData(prev => ({
        ...prev,
        [`file${slot}`]: file,
        [`image${slot}`]: previewUrl
      }))
    }
  }

  const removeImage = (slot: 1 | 2 | 3) => {
    setFormData(prev => ({
      ...prev,
      [`file${slot}`]: null,
      [`image${slot}`]: ''
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.price.trim()) newErrors.price = 'Price is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    if (!formData.status) newErrors.status = 'Status is required'
    
    // Ensure at least one image is present (optional but recommended for professional forms)
    if (!formData.image1 && !formData.image2 && !formData.image3) {
      newErrors.images = 'At least one product image is recommended'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch('http://168.231.101.119:4040/upload', {
      method: 'POST',
      body: fd
    })
    if (!res.ok) throw new Error('Image upload failed')
    const data = await res.json()
    return data.imageUrl || data.url || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setUploading(true)

    try {
      // 1. Upload new images if any
      let img1 = formData.image1
      let img2 = formData.image2
      let img3 = formData.image3

      // Only upload if it's a new file (blob url)
      if (formData.file1) img1 = await uploadImage(formData.file1)
      if (formData.file2) img2 = await uploadImage(formData.file2)
      if (formData.file3) img3 = await uploadImage(formData.file3)

      // 2. Construct Payload matching CreateProductDto
      const payload = {
        name: formData.name.trim(),
        price: formData.price.toString(),
        Category: formData.category.trim(), // Capital C as per DTO
        status: formData.status,
        Description: formData.description?.trim(), // Capital D as per DTO
        provider_id: Number(providerId),
        image1: img1.startsWith('blob:') ? '' : img1, // Safety check
        image2: img2.startsWith('blob:') ? '' : img2,
        image3: img3.startsWith('blob:') ? '' : img3,
      }

      // 3. Send Request
      const url = initialData?.id
        ? `http://168.231.101.119:4040/marketplace/products/${initialData.id}`
        : 'http://168.231.101.119:4040/marketplace/products'
      
      const res = await fetch(url, {
        method: 'POST', // Both create and update use POST based on your controller
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.message || 'Failed to save product')
      }

      const result = await res.json()
      if (onSubmit) onSubmit(result)
      onClose()

    } catch (error) {
      console.error('Error saving product:', error)
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : 'An error occurred' }))
    } finally {
      setIsSubmitting(false)
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {initialData ? 'Edit Product' : 'New Product'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {initialData ? 'Update product details and images' : 'Add a new product to your marketplace'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8 flex-1 overflow-y-auto">
          
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Product Images (Max 3)
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((slot) => {
                const imageKey = `image${slot}` as keyof typeof formData
                const imageUrl = formData[imageKey] as string

                return (
                  <div key={slot} className="relative group aspect-square">
                    {imageUrl ? (
                      <div className="w-full h-full relative rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={imageUrl} 
                          alt={`Product ${slot}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeImage(slot as 1|2|3)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-ikigai-primary hover:bg-gray-50 transition-all">
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">Upload Image {slot}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(slot as 1|2|3, e.target.files?.[0] || null)}
                        />
                      </label>
                    )}
                  </div>
                )
              })}
            </div>
            {errors.images && <p className="text-amber-600 text-sm mt-2 flex items-center"><AlertCircle className="h-4 w-4 mr-1"/> {errors.images}</p>}
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ikigai-primary focus:border-transparent transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g. Premium Hair Oil"
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price (XOF) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ikigai-primary focus:border-transparent transition-all ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00"
              />
              {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-ikigai-primary focus:border-transparent transition-all ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g. Hair Care"
              />
              {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white"
              >
                <option value="available">Available</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ikigai-primary focus:border-transparent transition-all"
              placeholder="Detailed product description..."
            />
          </div>

          {/* Error Banner */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.submit}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || uploading} className="min-w-[120px]">
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                initialData ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}