'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, User, Mail, Phone, CreditCard, Camera, FileImage, Upload } from 'lucide-react'
import { ServiceProvider } from '@/types'

interface ProviderEditModalProps {
  isOpen: boolean
  onClose: () => void
  provider: ServiceProvider | null
  onSubmit: (providerId: string, data: any) => Promise<void>
}

const SERVICE_TYPE_MAP: Record<string, number> = {
  barber: 1,
  hairdresser: 2,
  makeup_artist: 3,
  nail_technician: 4,
  esthetician: 5
}

const mapTypeToNumber = (type: string) => SERVICE_TYPE_MAP[type] ?? 1

export function ProviderEditModal({ isOpen, onClose, provider, onSubmit }: ProviderEditModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idCardNumber: '',
    profilePicture: null as File | null,
    profilePictureUrl: '' as string,
    idCardPictures: [] as File[],
    idCardUrls: [] as string[],
    type: 'barber' as ServiceProvider['type'],
    experience: 0,
    description: '',
    isActive: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingIdCards, setUploadingIdCards] = useState(false)

  useEffect(() => {
    if (provider) {
      setFormData({
        firstName: provider.firstName || provider.name?.split(' ')[0] || '',
        lastName: provider.lastName || provider.name?.split(' ').slice(1).join(' ') || '',
        email: provider.email || '',
        phoneNumber: provider.phone || '',
        idCardNumber: provider.idCardNumber || '',
        profilePicture: null,
        profilePictureUrl: provider.profilePicture || '',
        idCardPictures: [],
        idCardUrls: provider.idCardPicture ? [provider.idCardPicture] : [],
        type: provider.type || 'barber',
        experience: provider.experience || 0,
        description: provider.description || '',
        isActive: provider.isActive ?? true
      })
      setErrors({})
    }
  }, [provider])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleFileChange = (field: 'profilePicture' | 'idCardPictures', files: FileList | null) => {
    if (field === 'profilePicture') {
      setFormData(prev => ({ ...prev, profilePicture: files?.[0] || null }))
    } else {
      setFormData(prev => ({ ...prev, idCardPictures: files ? Array.from(files) : [] }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required'
    if (!formData.idCardNumber.trim()) newErrors.idCardNumber = 'ID card number is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadSingle = async (file: File): Promise<string> => {
    setUploadingProfile(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error(`Upload failed (${res.status})`)
      const data = await res.json()
      return (data.imageUrl || data.url || data.path || '') as string
    } finally {
      setUploadingProfile(false)
    }
  }

  const uploadMultiple = async (files: File[]): Promise<string[]> => {
    setUploadingIdCards(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('images', f))
      const res = await fetch(`${API_BASE_URL}/upload/multiple`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error(`Upload failed (${res.status})`)
      const data = await res.json()
      return data.imageUrls || data.urls || data.images || []
    } finally {
      setUploadingIdCards(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !provider) return

    setIsLoading(true)
    try {
      let profileImageUrl = formData.profilePictureUrl
      if (formData.profilePicture) {
        profileImageUrl = await uploadSingle(formData.profilePicture)
      }

      let idcards: string[] = [...formData.idCardUrls]
      if (formData.idCardPictures.length > 0) {
        const uploaded = await uploadMultiple(formData.idCardPictures)
        idcards = [...formData.idCardUrls, ...uploaded]
      }

      const payload = {
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        email: formData.email.trim(),
        phone_number: formData.phoneNumber.trim(),
        CNI_number: formData.idCardNumber.trim(),
        service_type: mapTypeToNumber(formData.type),
        year_expe: formData.experience,
        description: formData.description?.trim() || '',
        profileImageUrl,
        idcards,
        is_active: formData.isActive ? 1 : 0,
        registered_by: 'admin'
      }

      const res = await fetch(`${API_BASE_URL}/proownners/${provider.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.text().catch(() => '')
        throw new Error(err || `Update failed (${res.status})`)
      }

      await onSubmit(provider.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        idCardNumber: formData.idCardNumber,
        type: formData.type,
        experience: formData.experience,
        description: formData.description,
        isActive: formData.isActive,
        profilePicture: profileImageUrl,
        idCardPicture: idcards[0]
      })
      handleClose()
    } catch (error) {
      console.error('Error updating provider:', error)
      setErrors(prev => ({ ...prev, submit: (error as Error).message }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  if (!isOpen || !provider) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Provider</h2>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <Mail className="h-4 w-4 mr-1" /> Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <Phone className="h-4 w-4 mr-1" /> Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                    placeholder="Enter phone number"
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" /> ID Card Number *
                </label>
                <input
                  type="text"
                  value={formData.idCardNumber}
                  onChange={(e) => handleInputChange('idCardNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${errors.idCardNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder="Enter ID card number"
                />
                {errors.idCardNumber && <p className="text-red-500 text-sm mt-1">{errors.idCardNumber}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as ServiceProvider['type'])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  >
                    <option value="barber">Barber</option>
                    <option value="hairdresser">Hairdresser</option>
                    <option value="makeup_artist">Makeup Artist</option>
                    <option value="nail_technician">Nail Technician</option>
                    <option value="esthetician">Esthetician</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Brief description of skills and specialties..."
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-ikigai-primary focus:ring-ikigai-primary"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Documents (optional – upload to replace)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Picture</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-ikigai-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('profilePicture', e.target.files)}
                      className="hidden"
                      id="edit-profile-picture"
                    />
                    <label htmlFor="edit-profile-picture" className="cursor-pointer">
                      {formData.profilePicture ? (
                        <div className="space-y-2">
                          <FileImage className="h-8 w-8 mx-auto text-green-500" />
                          <p className="text-sm text-gray-600">{formData.profilePicture.name}</p>
                        </div>
                      ) : formData.profilePictureUrl ? (
                        <div className="space-y-2">
                          <img src={formData.profilePictureUrl} alt="Current" className="h-16 w-16 mx-auto rounded object-cover" />
                          <p className="text-sm text-gray-500">Click to replace</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload new picture</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID Card Pictures</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-ikigai-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange('idCardPictures', e.target.files)}
                      className="hidden"
                      id="edit-id-card-pictures"
                    />
                    <label htmlFor="edit-id-card-pictures" className="cursor-pointer">
                      {formData.idCardPictures.length > 0 ? (
                        <div className="space-y-2">
                          <FileImage className="h-8 w-8 mx-auto text-green-500" />
                          <p className="text-sm text-gray-600">{formData.idCardPictures.map(f => f.name).join(', ')}</p>
                        </div>
                      ) : formData.idCardUrls.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">{formData.idCardUrls.length} image(s) on file</p>
                          <p className="text-sm text-gray-500">Click to add or replace</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload ID card images</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={isLoading || uploadingProfile || uploadingIdCards}>
                {isLoading ? 'Updating...' : 'Update Provider'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
