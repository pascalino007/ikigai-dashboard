'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Calendar, Percent, DollarSign, Clock, Users, Image as ImageIcon } from 'lucide-react'
import { ShopService } from '@/types'

interface SpecialOfferFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  shopId: string
}

export function SpecialOfferForm({ isOpen, onClose, onSubmit, shopId }: SpecialOfferFormProps) {
  const [services, setServices] = useState<ShopService[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceId: '',
    shopId: '',
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    if (!isOpen || !shopId) return
    const fetchServices = async () => {
      setLoadingServices(true)
      try {
        const res = await fetch(`http://localhost:4040/services/shop/${shopId}`)
        if (!res.ok) throw new Error('Failed to load services')
        const data = await res.json()
        setServices(data || [])
      } catch (err) {
        console.error('Failed to fetch services:', err)
        setServices([])
      } finally {
        setLoadingServices(false)
      }
    }
    fetchServices()
  }, [isOpen, shopId])

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setFormData(prev => ({ ...prev, duration: diffDays.toString() }))
    }
  }, [formData.startDate, formData.endDate])

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  // auto-fill original price when service selected
  useEffect(() => {
    if (!formData.serviceId) {
      setFormData(prev => ({ ...prev, originalPrice: '' }))
      return
    }
    const selected = services.find(s => s.id === formData.serviceId)
    if (selected) {
      setFormData(prev => ({
        ...prev,
        originalPrice: Number(selected.price).toFixed(2),
        discountedPrice: prev.discountedPrice || ''
      }))
      setErrors(prev => ({ ...prev, originalPrice: '', discountedPrice: '' }))
    }
  }, [formData.serviceId, services])

  // ensure shopId is present in state when prop changes / modal opens
  useEffect(() => {
    if (!isOpen) return
    setFormData(prev => ({ ...prev, shopId: shopId || '' }))
  }, [isOpen, shopId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.serviceId) newErrors.serviceId = 'Service is required'
    if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) newErrors.originalPrice = 'Valid original price is required'
    if (!formData.discountedPrice || parseFloat(formData.discountedPrice) <= 0) newErrors.discountedPrice = 'Valid discounted price is required'
    if (parseFloat(formData.discountedPrice) >= parseFloat(formData.originalPrice)) newErrors.discountedPrice = 'Discounted price must be less than original price'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) newErrors.endDate = 'End date must be after start date'
    if (formData.maxUses && parseInt(formData.maxUses) <= 0) newErrors.maxUses = 'Max uses must be a positive number'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('http://localhost:4040/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        throw new Error(errBody || `Upload failed (${res.status})`)
      }
      const data = await res.json()
      return data.imageUrl || null
    } catch (err) {
      console.error('Image upload error:', err)
      setErrors(prev => ({ ...prev, image: 'Failed to upload image' }))
      return null
    } finally {
      setIsUploadingImage(false)
    }
  }

  // select handler: set serviceId, title, originalPrice and keep shopId
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)

    try {
      // ensure title is set from selected service if empty
      if (!formData.title && formData.serviceId) {
        const sel = services.find(s => String(s.id) === String(formData.serviceId))
        if (sel) setFormData(prev => ({ ...prev, title: sel.name }))
      }

      // upload image if provided
      let imageUrl: string | undefined
      if (formData.image) {
        const uploaded = await uploadImage(formData.image)
        if (!uploaded) throw new Error('Failed to upload image')
        imageUrl = uploaded
      }

      // convert prices to integer cents (backend example uses 15000/10500)
      const toCents = (v: string) => {
        const n = parseFloat(String(v || '0'))
        return Math.round(n * 100)
      }

      const payload = {
        title: (formData.title || '').trim(),
        description: (formData.description || '').trim(),
        serviceId: formData.serviceId,
        shopId: shopId, // use prop explicitly
        originalPrice: toCents(formData.originalPrice),
        discountedPrice: toCents(formData.discountedPrice),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        duration: formData.duration || '',
        maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : undefined,
        image: imageUrl, // full URL returned by upload endpoint
        termsAndConditions: formData.termsAndConditions || ''
      }

      console.log('Posting special payload:', payload)
      const res = await fetch('http://localhost:4040/specials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to create special' }))
        throw new Error(err.message || `Create failed (${res.status})`)
      }
      const result = await res.json()
      onSubmit(result)
      handleClose()
    } catch (err) {
      console.error('❌ Error creating special offer:', err)
      setErrors(prev => ({ ...prev, submit: (err as Error).message || 'Failed to create special' }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      serviceId: '',
      shopId: '',
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create Special Offer for {shopId}</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
           {/*  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Offer title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div> */}

              <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Service *</label>
            <select
              className={`w-full px-3 py-2 border rounded-md ${errors.serviceId ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.serviceId}
              onChange={(e) => {
                const val = e.target.value
                const sel = services.find(s => String(s.id) === String(val))
                if (sel) {
                  setFormData(prev => ({
                    ...prev,
                    serviceId: val,
                    title: sel.name,
                    originalPrice: Number(sel.price).toFixed(2),
                    shopId: shopId
                  }))
                  setErrors(prev => ({ ...prev, serviceId: '', originalPrice: '' }))
                } else {
                  setFormData(prev => ({ ...prev, serviceId: '', title: '', originalPrice: '' }))
                }
              }}
              disabled={loadingServices}
            >
              <option value="">{loadingServices ? 'Loading services...' : 'Choose a service...'}</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — ${Number(s.price).toFixed(2)}
                </option>
              ))}
            </select>
            {errors.serviceId && <p className="text-red-500 text-sm mt-1">{errors.serviceId}</p>}
            {formData.serviceId && <p className="text-sm text-gray-500 mt-1">Original price auto-filled: ${formData.originalPrice}</p>}
          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                rows={3}
                placeholder="Describe the special offer..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>

        

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" /> Original Price *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md ${errors.originalPrice ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.originalPrice}
                readOnly
                placeholder="0.00"
              />
              {errors.originalPrice && <p className="text-red-500 text-sm mt-1">{errors.originalPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" /> Discounted Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md ${errors.discountedPrice ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00"
                value={formData.discountedPrice}
                onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
              />
              {errors.discountedPrice && <p className="text-red-500 text-sm mt-1">{errors.discountedPrice}</p>}
            </div>
          </div>

          {formData.originalPrice && formData.discountedPrice && parseFloat(formData.discountedPrice) < parseFloat(formData.originalPrice) && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center text-green-800">
                <Percent className="h-4 w-4 mr-2" />
                <span className="font-medium">{Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.discountedPrice)) / parseFloat(formData.originalPrice)) * 100)}% OFF</span>
                <span className="ml-2 text-sm">Save ${(parseFloat(formData.originalPrice) - parseFloat(formData.discountedPrice)).toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" /> Start Date *
              </label>
              <input type="date" className={`w-full px-3 py-2 border rounded-md ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`} value={formData.startDate} onChange={(e) => handleInputChange('startDate', e.target.value)} />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" /> End Date *
              </label>
              <input type="date" className={`w-full px-3 py-2 border rounded-md ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`} value={formData.endDate} onChange={(e) => handleInputChange('endDate', e.target.value)} />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {formData.duration && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center text-blue-800">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium">Duration: {formData.duration} days</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" /> Maximum Uses (Optional)
            </label>
            <input type="number" min="1" className={`w-full px-3 py-2 border rounded-md ${errors.maxUses ? 'border-red-500' : 'border-gray-300'}`} placeholder="Leave empty for unlimited" value={formData.maxUses} onChange={(e) => handleInputChange('maxUses', e.target.value)} />
            {errors.maxUses && <p className="text-red-500 text-sm mt-1">{errors.maxUses}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="h-4 w-4 inline mr-1" /> Offer Image (Optional)
            </label>
            <input type="file" accept="image/*" className="w-full px-3 py-2 border border-gray-300 rounded-md" onChange={(e) => handleInputChange('image', e.target.files?.[0] || null)} />
            {isUploadingImage && <p className="text-xs text-gray-600 mt-1">Uploading image...</p>}
            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Terms and Conditions (Optional)</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md" rows={3} placeholder="Any special terms or conditions for this offer..." value={formData.termsAndConditions} onChange={(e) => handleInputChange('termsAndConditions', e.target.value)} />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || isUploadingImage} className="bg-ikigai-primary hover:bg-ikigai-primary/90">
              {isSubmitting ? 'Creating...' : 'Create Special Offer'}
            </Button>
          </div>

          {errors.submit && <p className="text-red-500 text-sm mt-2">{errors.submit}</p>}
        </form>
      </div>
    </div>
  )
}
