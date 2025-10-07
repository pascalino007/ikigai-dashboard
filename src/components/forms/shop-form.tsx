'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, MapPin, Phone, Mail, Tag, Image as ImageIcon, Calendar } from 'lucide-react'

interface OpeningHour {
  day: string
  open: string
  close: string
}

interface ShopFormData {
  name: string
  category: string
  tags: string[]
  profileImage: File | null
  images: File[]
  address: string
  city: string
  phone: string
  email: string
  description: string
  openingHours: OpeningHour[]
}

interface ShopFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ShopFormData) => void
}

const DEFAULT_DAYS: OpeningHour[] = [
  { day: 'Monday', open: '09:00', close: '18:00' },
  { day: 'Tuesday', open: '09:00', close: '18:00' },
  { day: 'Wednesday', open: '09:00', close: '18:00' },
  { day: 'Thursday', open: '09:00', close: '18:00' },
  { day: 'Friday', open: '09:00', close: '18:00' },
  { day: 'Saturday', open: '10:00', close: '16:00' },
  { day: 'Sunday', open: 'Closed', close: 'Closed' },
]

const SERVICE_TAGS = ['onglerie', 'manicure', 'coiffure', 'makeup', 'spa', 'barbershop']

export function ShopForm({ isOpen, onClose, onSubmit }: ShopFormProps) {
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    category: '',
    tags: [],
    profileImage: null,
    images: [],
    address: '',
    city: '',
    phone: '',
    email: '',
    description: '',
    openingHours: DEFAULT_DAYS,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ShopFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Partial<Record<keyof ShopFormData, string>> = {}
    if (!formData.name.trim()) newErrors.name = 'Shop name is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Shop</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter shop name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., onglerie, manicure, coiffure"
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Tag className="h-4 w-4 mr-2" /> Service Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm border ${formData.tags.includes(tag) ? 'bg-ikigai-primary text-white border-ikigai-primary' : 'bg-white text-gray-700 border-gray-300'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" /> Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter address"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter city"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Phone className="h-4 w-4 mr-1" /> Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Mail className="h-4 w-4 mr-1" /> Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent border-gray-300"
                  placeholder="Enter email (optional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                placeholder="Describe the shop..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <ImageIcon className="h-4 w-4 mr-1" /> Profile Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-ikigai-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData(prev => ({ ...prev, profileImage: e.target.files?.[0] || null }))}
                    className="hidden"
                    id="shop-profile-image"
                  />
                  <label htmlFor="shop-profile-image" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600 mt-2">Click to upload profile image</p>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-ikigai-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setFormData(prev => ({ ...prev, images: Array.from(e.target.files || []) }))}
                    className="hidden"
                    id="shop-images"
                  />
                  <label htmlFor="shop-images" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-600 mt-2">Click to upload gallery images</p>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2" /> Opening Hours
              </label>
              <div className="space-y-3">
                {formData.openingHours.map((oh, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4 text-sm text-gray-700">{oh.day}</div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={oh.open}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          openingHours: prev.openingHours.map((o, i) => i === idx ? { ...o, open: e.target.value } : o)
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                        placeholder="Open"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={oh.close}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          openingHours: prev.openingHours.map((o, i) => i === idx ? { ...o, close: e.target.value } : o)
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                        placeholder="Close"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Shop'}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


