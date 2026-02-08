'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, MapPin, Phone, Mail, Clock, Image as ImageIcon, Tag, Upload, Trash2 } from 'lucide-react'
import { Shop } from '@/types'

interface ShopEditModalProps {
  isOpen: boolean
  onClose: () => void
  shop: Shop | null
  onSubmit: (shopId: string, data: any) => void
}

export function ShopEditModal({ isOpen, onClose, shop, onSubmit }: ShopEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: 'Salon',
    tags: '',
    address: '',
    country: '',
    city: '',
    area: '',
    phone: '',
    email: '',
    isActive: true,
    openingHours: [] as Array<{ day: string; open: string; close: string }>,
    profileImageUrl: '',
    profileImageFile: null as File | null,
    galleryImages: [] as string[],
    galleryImageFiles: [] as File[]
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [previewGallery, setPreviewGallery] = useState<string[]>([])

  // Initialize form data when shop changes
  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name || '',
        description: shop.description || '',
        category: shop.category || '',
        type: shop.type || 'Salon',
        tags: Array.isArray(shop.tags) ? shop.tags.join(', ') : shop.tags || '',
        address: shop.address || '',
        country: shop.country || '',
        city: shop.city || '',
        area: shop.area || '',
        phone: shop.phone || '',
        email: shop.email || '',
        isActive: shop.isActive,
        openingHours: shop.openingHours || [],
        profileImageUrl: shop.profileImageUrl || '',
        profileImageFile: null,
        galleryImages: Array.isArray(shop.images) ? shop.images : [],
        galleryImageFiles: []
      })
      setPreviewGallery(Array.isArray(shop.images) ? shop.images : [])
    }
  }, [shop])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Shop name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Upload image to backend
  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('image', file)
    
    const res = await fetch('http://168.231.101.119:4040/upload', {
      method: 'POST',
      body: fd
    })
    
    if (!res.ok) throw new Error('Failed to upload image')
    const data = await res.json()
    return data.imageUrl || data.url || ''
  }

  // Upload multiple images to backend
  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const fd = new FormData()
    files.forEach(file => fd.append('images', file))
    
    const res = await fetch('http://168.231.101.119:4040/upload/multiple', {
      method: 'POST',
      body: fd
    })
    
    if (!res.ok) throw new Error('Failed to upload images')
    const data = await res.json()
    return data.imageUrls || data.urls || data.images || []
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !shop) return

    setIsLoading(true)
    try {
      let finalProfileUrl = formData.profileImageUrl
      let finalGalleryUrls = formData.galleryImages

      // Upload new profile image if provided
      if (formData.profileImageFile) {
        finalProfileUrl = await uploadImage(formData.profileImageFile)
      }

      // Upload new gallery images if provided
      if (formData.galleryImageFiles.length > 0) {
        const newUrls = await uploadMultipleImages(formData.galleryImageFiles)
        finalGalleryUrls = [...formData.galleryImages, ...newUrls]
      }

      const formattedWorkingHours = formData.openingHours.map(h => [h.day, `${h.open} - ${h.close}`])

      const response = await fetch(`http://168.231.101.119:4040/shops/update/${shop.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category,
          type: formData.type,
          address: formData.address.trim(),
          pays: formData.country.trim(),
          ville: formData.city.trim(),
          quartier: formData.area.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          description_shop: formData.description.trim(),
          profileImageUrl: finalProfileUrl,
          galleryImages: finalGalleryUrls,
          workingHours: formattedWorkingHours,
          tags: formData.tags,
          registered_by: 'admin',
          is_active: formData.isActive ? 1 : 0
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to update shop')
      }

      const result = await response.json()
      console.log('Shop updated successfully:', result)
      handleClose()
    } catch (error) {
      console.error('Error updating shop:', error)
      setErrors(prev => ({
        ...prev,
        submit: error instanceof Error ? error.message : 'Failed to update shop'
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      tags: '',
      address: '',
      country: '',
      city: '',
      area: '',
      phone: '',
      email: '',
      isActive: true,
      openingHours: [],
      profileImageUrl: '',
      profileImageFile: null,
      galleryImages: [],
      galleryImageFiles: []
    })
    setErrors({})
    setPreviewGallery([])
    onClose()
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleInputChange('profileImageFile', file)
    }
  }

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      handleInputChange('galleryImageFiles', newFiles)
      
      // Create previews for new files
      const newPreviews = newFiles.map(file => URL.createObjectURL(file))
      setPreviewGallery(prev => [...prev, ...newPreviews])
    }
  }

  const removeGalleryImage = (index: number) => {
    const newGallery = formData.galleryImages.filter((_, i) => i !== index)
    const newPreview = previewGallery.filter((_, i) => i !== index)
    handleInputChange('galleryImages', newGallery)
    setPreviewGallery(newPreview)
  }

  const addOpeningHour = () => {
    setFormData(prev => ({
      ...prev,
      openingHours: [...prev.openingHours, { day: 'Monday', open: '09:00', close: '18:00' }]
    }))
  }

  const removeOpeningHour = (index: number) => {
    setFormData(prev => ({
      ...prev,
      openingHours: prev.openingHours.filter((_, i) => i !== index)
    }))
  }

  const updateOpeningHour = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      openingHours: prev.openingHours.map((hour, i) => 
        i === index ? { ...hour, [field]: value } : hour
      )
    }))
  }

  if (!isOpen || !shop) return null

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Shop</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Name *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter shop name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Select category</option>
                <option value="Hair Salon">Hair Salon</option>
                <option value="Nail Salon">Nail Salon</option>
                <option value="Spa">Spa</option>
                <option value="Barbershop">Barbershop</option>
                <option value="Beauty Center">Beauty Center</option>
                <option value="Massage">Massage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value="Salon">Salon</option>
                <option value="Institut">Institut</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
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
              placeholder="Describe your shop"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="h-4 w-4 inline mr-1" />
              Profile Image
            </label>
            <div className="space-y-3">
              {formData.profileImageUrl && (
                <div className="relative inline-block">
                  <img 
                    src={formData.profileImageUrl.startsWith('http') ? formData.profileImageUrl : `https://myikigai.sfo2.digitaloceanspaces.com/uploads/${formData.profileImageUrl}`}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
              )}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  id="profile-image-input"
                />
                <label htmlFor="profile-image-input" className="cursor-pointer flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-sm text-gray-600">Click to upload new profile image</p>
                  </div>
                </label>
              </div>
              {formData.profileImageFile && (
                <p className="text-sm text-green-600">✓ New image selected: {formData.profileImageFile.name}</p>
              )}
            </div>
          </div>

          {/* Gallery Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="h-4 w-4 inline mr-1" />
              Gallery Images
            </label>
            
            {/* Existing Gallery */}
            {previewGallery.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current gallery images:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {previewGallery.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.startsWith('http') ? image : `https://myikigai.sfo2.digitaloceanspaces.com/uploads/${image}`}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Gallery Images */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryImageChange}
                className="hidden"
                id="gallery-image-input"
              />
              <label htmlFor="gallery-image-input" className="cursor-pointer flex items-center justify-center">
                <div className="text-center">
                  <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                  <p className="text-sm text-gray-600">Click to upload gallery images</p>
                </div>
              </label>
            </div>
            {formData.galleryImageFiles.length > 0 && (
              <p className="text-sm text-green-600 mt-2">✓ {formData.galleryImageFiles.length} new image(s) selected</p>
            )}
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Address *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              />
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area/District
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                placeholder="Enter area or district"
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone *
              </label>
              <input
                type="tel"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-4 w-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              Tags
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              placeholder="Enter tags separated by commas"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          {/* Opening Hours */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4 inline mr-1" />
                Opening Hours
              </label>
              <Button type="button" variant="outline" size="sm" onClick={addOpeningHour}>
                Add Hours
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.openingHours.map((hour, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                    value={hour.day}
                    onChange={(e) => updateOpeningHour(index, 'day', e.target.value)}
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                    value={hour.open}
                    onChange={(e) => updateOpeningHour(index, 'open', e.target.value)}
                  />
                  
                  <span className="text-gray-500">to</span>
                  
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                    value={hour.close}
                    onChange={(e) => updateOpeningHour(index, 'close', e.target.value)}
                  />
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOpeningHour(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-ikigai-primary focus:ring-ikigai-primary"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-ikigai-primary hover:bg-ikigai-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Shop'}
            </Button>
          </div>

          {errors.submit && (
            <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg">
              {errors.submit}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
