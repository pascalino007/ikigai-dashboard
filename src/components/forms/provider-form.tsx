'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, User, Mail, Phone, CreditCard, Camera, FileImage } from 'lucide-react'

interface ProviderFormData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  idCardNumber: string
  profilePicture: File | null
  idCardPictures: File[] // changed to array
  type: 'barber' | 'hairdresser' | 'makeup_artist' | 'nail_technician' | 'esthetician'
  experience: number
  description: string
}

interface ProviderFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ProviderFormData) => void
}

export function ProviderForm({ isOpen, onClose, onSubmit }: ProviderFormProps) {
  const [formData, setFormData] = useState<ProviderFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    idCardNumber: '',
    profilePicture: null,
    idCardPictures: [],
    type: 'barber',
    experience: 0,
    description: ''
  })

  const [errors, setErrors] = useState<Partial<ProviderFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadingIdCards, setUploadingIdCards] = useState(false)

  const SERVICE_TYPE_MAP: Record<string, number> = {
    barber: 1,
    hairdresser: 2,
    makeup_artist: 3,
    nail_technician: 4,
    esthetician: 5
  }

  const handleInputChange = (field: keyof ProviderFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value } as any))
    if ((errors as any)[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileChange = (field: 'profilePicture' | 'idCardPictures', files: FileList | null) => {
    if (field === 'profilePicture') {
      setFormData(prev => ({ ...prev, profilePicture: files?.[0] || null }))
      if (errors.profilePicture) setErrors(prev => ({ ...prev, profilePicture: '' }))
    } else {
      const arr = files ? Array.from(files) : []
      setFormData(prev => ({ ...prev, idCardPictures: arr }))
      if (errors.idCardPicture) setErrors(prev => ({ ...prev, idCardPicture: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ProviderFormData> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required'
    if (!formData.idCardNumber.trim()) newErrors.idCardNumber = 'ID card number is required'
    if (!formData.profilePicture) newErrors.profilePicture = 'Profile picture is required'
    if (!formData.idCardPictures || formData.idCardPictures.length === 0) newErrors.idCardPicture = 'At least one ID card image is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadSingle = async (file: File): Promise<string> => {
    setUploadingProfile(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('http://168.231.101.119:4040/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(txt || `Upload failed (${res.status})`)
      }
      const data = await res.json()
      // handle different possible keys
      return (data.imageUrl || data.url || data.path || '') as string
    } finally {
      setUploadingProfile(false)
    }
  }

  const uploadMultiple = async (files: File[]): Promise<string[]> => {
    setUploadingIdCards(true)
    try {
      const fd = new FormData()
      // backend expects multiple files under 'images' (adjust if needed)
      files.forEach((f) => fd.append('images', f))
      const res = await fetch('http://168.231.101.119:4040/upload/multiple', { method: 'POST', body: fd })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        throw new Error(txt || `Multiple upload failed (${res.status})`)
      }
      const data = await res.json()
      // expect array of urls in data.imageUrls or data.urls or data.images
      return data.imageUrls || data.urls || data.images || []
    } finally {
      setUploadingIdCards(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // upload profile picture -> get URL
      let profileImageUrl = ''
      if (formData.profilePicture) {
        profileImageUrl = await uploadSingle(formData.profilePicture)
        if (!profileImageUrl) throw new Error('Failed to upload profile image')
      }

      // upload id card pictures -> get array of URLs
      let idcards: string[] = []
      if (formData.idCardPictures && formData.idCardPictures.length > 0) {
        idcards = await uploadMultiple(formData.idCardPictures)
        if (!Array.isArray(idcards) || idcards.length === 0) throw new Error('Failed to upload ID card images')
      }

      // build payload that backend expects
      const payload = {
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        email: formData.email.trim(),
        phone_number: formData.phoneNumber.trim(),
        CNI_number: formData.idCardNumber.trim(),
        service_type: SERVICE_TYPE_MAP[formData.type] || 0,
        year_expe: formData.experience,
        profileImageUrl: profileImageUrl,
        idcards: idcards,
        registered_by: 'admin' // set as required - replace as needed
      }

      // send to proownners endpoint
      const res = await fetch('http://168.231.101.119:4040/proownners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.text().catch(() => '')
        throw new Error(err || `Create provider failed (${res.status})`)
      }

      // success: call parent onSubmit with original form data (or response if needed)
      onSubmit(formData)
      // reset
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        idCardNumber: '',
        profilePicture: null,
        idCardPictures: [],
        type: 'barber',
        experience: 0,
        description: ''
      })
      onClose()
    } catch (error) {
      console.error('Error submitting provider:', error)
      setErrors(prev => ({ ...prev, submit: (error as Error).message }))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Service Provider</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  ID Card Number *
                </label>
                <input
                  type="text"
                  value={formData.idCardNumber}
                  onChange={(e) => handleInputChange('idCardNumber', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                    errors.idCardNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter ID card number"
                />
                {errors.idCardNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.idCardNumber}</p>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Professional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Service Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  >
                    <option value="barber">Barber</option>
                    <option value="hairdresser">Hairdresser</option>
                    <option value="makeup_artist">Makeup Artist</option>
                    <option value="nail_technician">Nail Technician</option>
                    <option value="esthetician">Esthetician</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  placeholder="Brief description of skills and specialties..."
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Required Documents
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profile Picture *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-ikigai-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('profilePicture', e.target.files)}
                      className="hidden"
                      id="profile-picture"
                    />
                    <label htmlFor="profile-picture" className="cursor-pointer">
                      {formData.profilePicture ? (
                        <div className="space-y-2">
                          <FileImage className="h-8 w-8 mx-auto text-green-500" />
                          <p className="text-sm text-gray-600">{formData.profilePicture.name}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload profile picture</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.profilePicture && (
                    <p className="text-red-500 text-sm mt-1">{errors.profilePicture}</p>
                  )}
                </div>

                {/* ID Card Pictures (multiple) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ID Card Pictures * (front & back)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-ikigai-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange('idCardPictures', e.target.files)}
                      className="hidden"
                      id="id-card-pictures"
                    />
                    <label htmlFor="id-card-pictures" className="cursor-pointer">
                      {formData.idCardPictures && formData.idCardPictures.length > 0 ? (
                        <div className="space-y-2">
                          <FileImage className="h-8 w-8 mx-auto text-green-500" />
                          <p className="text-sm text-gray-600">{formData.idCardPictures.map(f => f.name).join(', ')}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-gray-400" />
                          <p className="text-sm text-gray-600">Click to upload ID card images (front & back)</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.idCardPicture && (
                    <p className="text-red-500 text-sm mt-1">{errors.idCardPicture}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || uploadingProfile || uploadingIdCards}>
                {isSubmitting ? 'Creating...' : 'Create Provider'}
              </Button>
            </div>

            {errors.submit && <p className="text-red-500 text-sm mt-2">{errors.submit}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
