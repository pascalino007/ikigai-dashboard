'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [isUploadingProfile, setIsUploadingProfile] = useState(false)
  const [profileUploadError, setProfileUploadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [subcategories, setSubcategories] = useState<Array<{ id: string; name: string }>>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  const [concatained, setconcatained] = useState<string>('')

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
        imageurl: initialData.imageurl || 'https://cdn.example.com/default-service.jpg',
        tags: (initialData as any).tags || '',
        provider_id: initialData.providerId ? Number(initialData.providerId) : 0,
        provider_name: (initialData as any).providerName || ''
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

  // Keep track of previous auto-generated base name so we only overwrite
  // when name is empty or still equals the previous generated base.
  const prevBaseNameRef = useRef<string>('')

  // Update name immediately when category/subcategory changes (preserve user edits)
  const updateNameFromCategorySub = (catId: string, subId: string) => {
    const catName = categories.find((c) => c.id === catId)?.name || ''
    const subName = subcategories.find((s) => s.id === subId)?.name || ''
    const baseName = [catName, subName].filter(Boolean).join(' ').trim()

    const currentName = (formData.name || '').trim()
    if (!currentName || currentName === prevBaseNameRef.current) {
      setFormData((prev) => ({ ...prev, name: baseName }))
    }
    prevBaseNameRef.current = baseName
  }

  useEffect(() => {
    const catName = categories.find((c) => c.id === formData.category)?.name || ''
    const subName = subcategories.find((s) => s.id === formData.sous_category)?.name || ''
    const parts = []
    if (catName) parts.push(catName)
    if (subName) parts.push(subName)
    const baseName = parts.join(' ')

    const currentName = (formData.name || '').trim()

    // If user hasn't typed anything or current name equals previous auto base,
    // update the name to the new base. Otherwise preserve user's custom name.
    if (!currentName || currentName === prevBaseNameRef.current) {
      setFormData((prev) => ({ ...prev, name: baseName }))
    }
    // store new base for future comparisons
    prevBaseNameRef.current = baseName
  }, [formData.category, formData.sous_category, categories, subcategories])

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  // Upload profile image to backend and set returned imageUrl on success
  const uploadProfileImage = async (file: File) => {
    setProfileUploadError(null)
    // show immediate local preview (will be replaced by returned URL)
    setFormData(prev => ({ ...prev, imageurl: URL.createObjectURL(file) }))

    const form = new FormData()
    form.append('image', file) // backend expects 'image'

    setIsUploadingProfile(true)
    try {
      const res = await fetch('http://168.231.101.119:4040/upload', { method: 'POST', body: form })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || `Upload failed (${res.status})`)
      }
      const data = await res.json()
      if (!data?.imageUrl) throw new Error('No imageUrl in upload response')

      // use the returned full URL for preview/submission
      setFormData(prev => ({ ...prev, imageurl: data.imageUrl }))
      console.log('✅ Profile image uploaded:', data.imageUrl)
    } catch (err) {
      console.error('❌ Profile upload error:', err)
      setProfileUploadError(err instanceof Error ? err.message : 'Upload failed')
      setFormData(prev => ({ ...prev, imageurl: '' }))
      setErrors(prev => ({ ...prev, profileImageFile: err instanceof Error ? err.message : 'Failed to upload profile image' }))
    } finally {
      setIsUploadingProfile(false)
    }
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
    // require either an uploaded URL or a selected file (upload will set imageurl)
    if (!formData.imageurl && !formData.profileImageFile) newErrors.profileImageFile = 'Profile image is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

// ...existing code...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Ensure imageUrl: upload file if provided
      let imageUrl = formData.imageurl || ''
      if (formData.profileImageFile) {
        const fd = new FormData()
        fd.append('image', formData.profileImageFile)
        const upRes = await fetch('http://168.231.101.119:4040/upload', { method: 'POST', body: fd })
        if (!upRes.ok) {
          const errBody = await upRes.text().catch(() => '')
          throw new Error(errBody || `Image upload failed (${upRes.status})`)
        }
        const upData = await upRes.json().catch(() => ({}))
        imageUrl = upData.imageUrl || upData.url || ''
      }

      if (!imageUrl) {
        throw new Error('Image URL is required (upload failed or missing)')
      }

      // Build payload matching CreateServiceDto
      const payload: any = {
        name: (formData.name || '').trim(),
        description: (formData.description || '').trim(),
        Category: String(formData.category || ''), // capital C
        sous_category: String(formData.sous_category || ''),
        price: String(formData.price ?? ''),
        duration: String(formData.duration ?? ''),
        imageurl: String(imageUrl)
      }

      if (formData.tags) payload.tags = String(formData.tags)
      if (typeof formData.provider_id !== 'undefined' && formData.provider_id !== null) {
        payload.provider_id = String(formData.provider_id)
      }
      if (formData.provider_name) payload.provider_name = String(formData.provider_name)

      const url = initialData
        ? `http://168.231.101.119:4040/services/${initialData.id}`
        : 'http://168.231.101.119:4040/services'
      const method = 'POST'

      console.log('Submitting service payload:', payload)
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(JSON.stringify(err))
      }

      const result = await res.json()
      console.log('Service saved:', result)
      if (onSubmit) onSubmit(result)

      // reset form
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
        provider_name: ''
      })
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Error submitting service:', error)
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : String(error) }))
    } finally {
      setIsSubmitting(false)
    }
  }
// ...existing code...


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {initialData ? 'Edit Service' : 'Add New Service'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {selectedShopId ? 'Shop' : 'Select Shop'} *
              </label>
              <select
                value={formData.shopId}
                onChange={(e) => handleInputChange('shopId', e.target.value)}
                disabled={!!selectedShopId}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {selectedShopId ? (
                  <option value={selectedShopId}>{selectedShopId}</option>
                ) : (
                  <>
                    <option value="">Choose a shop...</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Categories (Dynamic) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Main Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const catId = e.target.value
                    const catName = categories.find((c) => c.id === catId)?.name || ''
                    handleInputChange('category', catId)
                    handleInputChange('sous_category', '')
                    
                    // Update name and log
                    const newName = catName
                    handleInputChange('name', newName)
                    console.log('Updated name after category change:', newName)
                    
                    setErrors(prev => ({
                      ...prev,
                      category: '',
                      name: ''
                    }))
}}
                  disabled={loadingCategories}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subcategory *</label>
                <select
                  value={formData.sous_category}
                  onChange={(e) => {
                    const subId = e.target.value
                    handleInputChange('sous_category', subId)
                    updateNameFromCategorySub(formData.category, subId)
                  }}
                  disabled={!formData.category || loadingSubcategories}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Name *</label>
              <input
                type="text"
                value={formData.name}
               onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder=""
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (min) *</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* File Uploads */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  // keep File reference
                  handleInputChange('profileImageFile', file)
                  await uploadProfileImage(file)
                }}
              />
              {isUploadingProfile && <p className="text-xs text-gray-600 mt-1">Uploading profile image...</p>}
              {profileUploadError && <p className="text-red-500 text-sm mt-1">{profileUploadError}</p>}
              {formData.imageurl && (
                <img src={formData.imageurl} alt="Profile preview" className="mt-2 w-32 h-32 object-cover rounded" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gallery Images</label>
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
              <Button type="submit" disabled={isSubmitting || isUploadingProfile}>
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
