'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { X, MapPin, Phone, Mail, Clock, Image as ImageIcon, Tag, Upload, Trash2, User } from 'lucide-react'
import { Shop } from '@/types'

interface GeoEntry { id: string; countryId: string; regionId: string; cityId?: string; districtId?: string; name: string }

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
    galleryImageFiles: [] as File[],
    longitude: null as number | null,
    latitude: null as number | null,
    certificationImageUrl: '' as string,
    certificationImageFile: null as File | null,
    cfeImageUrl: '' as string,
    cfeImageFile: null as File | null
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [previewGallery, setPreviewGallery] = useState<string[]>([])
  const [categories, setCategories] = useState<Array<{id:string; name:string}>>([])
  const [editingCategory, setEditingCategory] = useState(false)
  
  // Geolocation data
  const [geovilles, setGeovilles] = useState<GeoEntry[]>([])
  const [editingCountry, setEditingCountry] = useState(false)
  const [editingCity, setEditingCity] = useState(false)
  const [editingArrondissement, setEditingArrondissement] = useState(false)
  const [editingArea, setEditingArea] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [editingRegion, setEditingRegion] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // Provider linking
  const [providers, setProviders] = useState<any[]>([])
  const [editingProvider, setEditingProvider] = useState(false)
  const [selectedProviderEmail, setSelectedProviderEmail] = useState('')

  // Initialize form data when shop changes
  useEffect(() => {
    if (shop) {
      const parseHours = (raw: any): Array<{day:string;open:string;close:string}> => {
        if (!Array.isArray(raw)) return []
        return raw.map((h: any) => Array.isArray(h)
          ? { day: h[0]||'', open: (h[1]||'').split(' - ')[0]?.trim()||'', close: (h[1]||'').split(' - ')[1]?.trim()||'' }
          : { day: h.day||'', open: h.open||'', close: h.close||'' }
        )
      }
      setFormData({
        name: shop.name || '',
        description: shop.description || (shop as any).description_shop || '',
        category: shop.category || '',
        type: (shop as any).type || 'Salon',
        tags: Array.isArray(shop.tags) ? shop.tags.join(', ') : shop.tags || '',
        address: shop.address || '',
        country: shop.country || (shop as any).pays || '',
        city: shop.city || (shop as any).ville || '',
        area: shop.area || (shop as any).quartier || '',
        phone: shop.phone || '',
        email: shop.email || '',
        isActive: shop.isActive !== undefined ? Boolean(shop.isActive) : Number((shop as any).is_active) === 1,
        openingHours: parseHours((shop as any).workingHours || shop.openingHours || []),
        profileImageUrl: (shop as any).profileImageUrl || shop.profileImage || '',
        profileImageFile: null,
        galleryImages: Array.isArray(shop.images) ? shop.images : [],
        galleryImageFiles: [],
        certificationImageUrl: (shop as any).certificationImage || '',
        certificationImageFile: null,
        cfeImageUrl: (shop as any).cfeImageUrl || '',
        cfeImageFile: null,
        longitude: (shop as any).longitude ?? null,
        latitude: (shop as any).latitude ?? null
      })
      setPreviewGallery(Array.isArray(shop.images) ? shop.images : [])
      // Initialize selected provider from shop.owner
      const ownerEmail = (shop as any).owner || ''
      setSelectedProviderEmail(ownerEmail)
    }
  }, [shop])

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories/`)
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data.map((c:any) => ({ id: String(c.id), name: c.name })) : []))
      .catch(() => {})
    
    fetch(`${API_BASE_URL}/geoville`)
      .then(r => r.json())
      .then(data => setGeovilles(Array.isArray(data) ? data.map((g: any) => ({
        id: String(g.id),
        countryId: g.countryId || '',
        regionId: g.regionId || '',
        cityId: g.cityId,
        districtId: g.districtId,
        name: g.name || ''
      })) : []))
      .catch(() => {})

    // Fetch providers for linking
    fetch(`${API_BASE_URL}/proownners`)
      .then(r => r.json())
      .then(data => setProviders(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

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
    
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: fd
    })
    
    if (!res.ok) throw new Error('Failed to upload image')
    const data = await res.json()
    return data.imageUrl || data.url || ''
  }

  // Get current location and reverse geocode to address
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setErrors(prev => ({ ...prev, address: 'Geolocation is not supported by your browser' }))
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          if (!res.ok) throw new Error('Failed to get address')
          const data = await res.json()
          
          if (data && data.display_name) {
            handleInputChange('address', data.display_name)
            // Store coordinates
            handleInputChange('longitude', longitude)
            handleInputChange('latitude', latitude)
            // Also extract city/country if available
            if (data.address) {
              if (data.address.country) handleInputChange('country', data.address.country)
              if (data.address.city || data.address.town || data.address.village) {
                handleInputChange('city', data.address.city || data.address.town || data.address.village)
              }
            }
          }
        } catch (err) {
          setErrors(prev => ({ ...prev, address: 'Failed to get address from location' }))
        } finally {
          setIsGettingLocation(false)
        }
      },
      (err) => {
        setErrors(prev => ({ ...prev, address: `Location error: ${err.message}` }))
        setIsGettingLocation(false)
      }
    )
  }

  // Upload multiple images to backend
  const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
    const fd = new FormData()
    files.forEach(file => fd.append('images', file))
    
    const res = await fetch(`${API_BASE_URL}/upload/multiple`, {
      method: 'POST',
      body: fd
    })
    
    if (!res.ok) throw new Error('Failed to upload images')
    const data = await res.json()
    return data.imageUrls || data.urls || data.images || []
  }

  // Upload image to specific folder in backend (for certification, CFE images)
  const uploadImageToFolder = async (file: File, folder: string): Promise<string> => {
    const fd = new FormData()
    fd.append('image', file)
    fd.append('folder', folder)
    
    const res = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: fd
    })
    
    if (!res.ok) throw new Error(`Failed to upload image to ${folder}`)
    const data = await res.json()
    return data.imageUrl || data.url || ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !shop) return

    setIsLoading(true)
    try {
      let finalProfileUrl = formData.profileImageUrl
      let finalGalleryUrls = formData.galleryImages
      let finalCertUrl = formData.certificationImageUrl
      let finalCfeUrl = formData.cfeImageUrl

      // Upload new profile image if provided
      if (formData.profileImageFile) {
        finalProfileUrl = await uploadImage(formData.profileImageFile)
      }

      // Upload new gallery images if provided
      if (formData.galleryImageFiles.length > 0) {
        const newUrls = await uploadMultipleImages(formData.galleryImageFiles)
        finalGalleryUrls = [...formData.galleryImages, ...newUrls]
      }

      // Upload certification image if provided
      if (formData.certificationImageFile) {
        finalCertUrl = await uploadImageToFolder(formData.certificationImageFile, 'certification')
      }

      // Upload CFE image if provided
      if (formData.cfeImageFile) {
        finalCfeUrl = await uploadImageToFolder(formData.cfeImageFile, 'cfe')
      }

      const formattedWorkingHours = formData.openingHours.map(h => [h.day, `${h.open} - ${h.close}`])

      const response = await fetch(`${API_BASE_URL}/shops/update/${shop.id}`, {
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
          certificationImage: finalCertUrl,
          cfeImageUrl: finalCfeUrl,
          workingHours: formattedWorkingHours,
          longitude: formData.longitude,
          latitude: formData.latitude,
          tags: formData.tags,
          registered_by: 'admin',
          is_active: formData.isActive,
          owner: selectedProviderEmail
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
      type: 'Salon',
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
      galleryImageFiles: [],
      longitude: null,
      latitude: null,
      certificationImageUrl: '',
      certificationImageFile: null,
      cfeImageUrl: '',
      cfeImageFile: null
    })
    setErrors({})
    setPreviewGallery([])
    setEditingCategory(false)
    setEditingProvider(false)
    setSelectedProviderEmail('')
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
              {!editingCategory ? (
                <div className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800">
                    {formData.category || <span className="text-gray-400">No category set</span>}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCategory(true)}
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    autoFocus
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCategory(false)}
                  >
                    Done
                  </Button>
                </div>
              )}
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

          {/* Linked Provider */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Linked Provider
            </label>
            {!editingProvider ? (
              <div className="flex items-center gap-2">
                {selectedProviderEmail ? (
                  <div className="flex-1">
                    {(() => {
                      const p = providers.find((pr: any) => (pr.email || '').toLowerCase().trim() === selectedProviderEmail.toLowerCase().trim())
                      return p ? (
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-ikigai-primary flex items-center justify-center text-white text-xs font-medium">
                            {(p.firstname || '')[0]}{(p.lastname || '')[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {p.firstname} {p.lastname}
                            </p>
                            <p className="text-xs text-gray-500">{p.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-800 dark:text-gray-200">{selectedProviderEmail}</span>
                      )
                    })()}
                  </div>
                ) : (
                  <span className="flex-1 text-sm text-gray-400 italic">No provider linked</span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProvider(true)}
                >
                  {selectedProviderEmail ? 'Change' : 'Link Provider'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={selectedProviderEmail}
                  onChange={(e) => setSelectedProviderEmail(e.target.value)}
                  autoFocus
                >
                  <option value="">-- No provider --</option>
                  {providers.map((p: any) => (
                    <option key={p.id} value={p.email}>
                      {p.firstname} {p.lastname} ({p.email})
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingProvider(false)}
                >
                  Done
                </Button>
              </div>
            )}
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

          {/* Certification & CFE Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certification Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Certification Document
                {formData.certificationImageUrl && (
                  <span className="ml-2 text-green-600 text-xs">(Uploaded)</span>
                )}
              </label>
              
              {formData.certificationImageUrl && !formData.certificationImageFile && (
                <div className="mb-3">
                  <div className="relative inline-block">
                    <img 
                      src={formData.certificationImageUrl.startsWith('http') ? formData.certificationImageUrl : `https://myikigai.sfo2.digitaloceanspaces.com/certification/${formData.certificationImageUrl}`}
                      alt="Certification"
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange('certificationImageUrl', '')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleInputChange('certificationImageFile', file)
                  }}
                  className="hidden"
                  id="certification-image-input"
                />
                <label htmlFor="certification-image-input" className="cursor-pointer flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-sm text-gray-600">
                      {formData.certificationImageFile ? 'Change certification' : 'Upload certification'}
                    </p>
                  </div>
                </label>
              </div>
              {formData.certificationImageFile && (
                <p className="text-sm text-green-600 mt-2">✓ {formData.certificationImageFile.name}</p>
              )}
            </div>

            {/* CFE Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <svg className="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
                CFE Document
                {formData.cfeImageUrl && (
                  <span className="ml-2 text-green-600 text-xs">(Uploaded)</span>
                )}
              </label>
              
              {formData.cfeImageUrl && !formData.cfeImageFile && (
                <div className="mb-3">
                  <div className="relative inline-block">
                    <img 
                      src={formData.cfeImageUrl.startsWith('http') ? formData.cfeImageUrl : `https://myikigai.sfo2.digitaloceanspaces.com/cfe/${formData.cfeImageUrl}`}
                      alt="CFE"
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange('cfeImageUrl', '')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleInputChange('cfeImageFile', file)
                  }}
                  className="hidden"
                  id="cfe-image-input"
                />
                <label htmlFor="cfe-image-input" className="cursor-pointer flex items-center justify-center">
                  <div className="text-center">
                    <Upload className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-sm text-gray-600">
                      {formData.cfeImageFile ? 'Change CFE' : 'Upload CFE'}
                    </p>
                  </div>
                </label>
              </div>
              {formData.cfeImageFile && (
                <p className="text-sm text-green-600 mt-2">✓ {formData.cfeImageFile.name}</p>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Country with Edit button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              {!editingCountry ? (
                <div className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800">
                    {formData.country || <span className="text-gray-400">No country set</span>}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCountry(true)}
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                    value={formData.country}
                    onChange={(e) => {
                      handleInputChange('country', e.target.value)
                      handleInputChange('city', '')
                      handleInputChange('area', '')
                      setSelectedRegion('')
                    }}
                    autoFocus
                  >
                    <option value="">Select country</option>
                    {Array.from(new Set(geovilles.map(g => g.countryId).filter(Boolean))).sort().map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCountry(false)}
                  >
                    Done
                  </Button>
                </div>
              )}
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>

            {/* Region with Edit button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region *
              </label>
              {!editingRegion ? (
                <div className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800">
                    {selectedRegion || <span className="text-gray-400">No region set</span>}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingRegion(true)}
                    disabled={!formData.country}
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                    value={selectedRegion}
                    onChange={(e) => {
                      setSelectedRegion(e.target.value)
                      handleInputChange('city', '')
                      handleInputChange('area', '')
                    }}
                    autoFocus
                  >
                    <option value="">Select region</option>
                    {Array.from(new Set(geovilles
                      .filter(g => g.countryId === formData.country)
                      .map(g => g.regionId)
                      .filter(Boolean))).sort().map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRegion(false)}
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>

            {/* City with Edit button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              {!editingCity ? (
                <div className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800">
                    {formData.city || <span className="text-gray-400">No city set</span>}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCity(true)}
                    disabled={!selectedRegion}
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                    value={formData.city}
                    onChange={(e) => {
                      handleInputChange('city', e.target.value)
                      handleInputChange('area', '')
                    }}
                    autoFocus
                  >
                    <option value="">Select city</option>
                    {Array.from(new Set(geovilles
                      .filter(g => g.countryId === formData.country && g.regionId === selectedRegion)
                      .map(g => g.cityId)
                      .filter(Boolean))).sort().map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCity(false)}
                  >
                    Done
                  </Button>
                </div>
              )}
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            {/* Arrondissement with Edit button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrondissement
              </label>
              {!editingArrondissement ? (
                <div className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800">
                    {(shop as any).arrondissement || <span className="text-gray-400">No arrondissement set</span>}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingArrondissement(true)}
                    disabled={!formData.city}
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                    value={(shop as any).arrondissement || ''}
                    onChange={(e) => {
                      // Store in a hidden field or handle separately
                      (shop as any).arrondissement = e.target.value
                    }}
                    autoFocus
                  >
                    <option value="">Select arrondissement</option>
                    {Array.from(new Set(geovilles
                      .filter(g => g.cityId === formData.city)
                      .map(g => g.districtId)
                      .filter(Boolean))).sort().map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingArrondissement(false)}
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>

            {/* Quartier/Area with Edit button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quartier (Area)
              </label>
              {!editingArea ? (
                <div className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800">
                    {formData.area || <span className="text-gray-400">No area set</span>}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingArea(true)}
                    disabled={!(shop as any).arrondissement && !formData.city}
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                    value={formData.area}
                    onChange={(e) => handleInputChange('area', e.target.value)}
                    autoFocus
                  >
                    <option value="">Select quartier</option>
                    {geovilles
                      .filter(g => g.districtId === (shop as any).arrondissement || g.cityId === formData.city)
                      .map(g => g.name)
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .sort()
                      .map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingArea(false)}
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>

            {/* Address with Edit button and Geolocation */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Address *
              </label>
              {!editingAddress ? (
                <div className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-800 truncate">
                    {formData.address || <span className="text-gray-400">No address set</span>}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingAddress(true)}
                  >
                    Edit
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className={`flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter address or use current location"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingAddress(false)}
                    >
                      Done
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="w-full"
                  >
                    {isGettingLocation ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Getting location...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Use current location
                      </span>
                    )}
                  </Button>
                </div>
              )}
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
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
