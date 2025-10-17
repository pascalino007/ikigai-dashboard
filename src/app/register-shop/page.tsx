'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Phone, Mail, Tag, Image as ImageIcon, Calendar, CheckCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useAuth } from '@/lib/auth/auth-context'
import { shopApi } from '@/services/api'
import { EnrollerOnly } from '@/components/auth/route-guard'

interface ShopFormData {
  name: string
  category: string
  tags: string[]
  profileImage: File | null
  images: File[]
  address: string
  country: string
  city: string
  area: string
  phone: string
  email: string
  description: string
  openingHours: Array<{ day: string; open: string; close: string }>
}

const DEFAULT_DAYS = [
  { day: 'Monday', open: '09:00', close: '18:00' },
  { day: 'Tuesday', open: '09:00', close: '18:00' },
  { day: 'Wednesday', open: '09:00', close: '18:00' },
  { day: 'Thursday', open: '09:00', close: '18:00' },
  { day: 'Friday', open: '09:00', close: '18:00' },
  { day: 'Saturday', open: '10:00', close: '16:00' },
  { day: 'Sunday', open: 'Closed', close: 'Closed' },
]

const SERVICE_TAGS = ['Hair Salon', 'Nail Salon', 'Spa', 'Barbershop', 'Beauty Center', 'Massage', 'Makeup', 'Other']

export default function RegisterShopPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    category: '',
    tags: [],
    profileImage: null,
    images: [],
    address: '',
    country: '',
    city: '',
    area: '',
    phone: '',
    email: '',
    description: '',
    openingHours: DEFAULT_DAYS,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ShopFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

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
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    try {
      // Add enroller ID to the shop data
      const shopData = {
        ...formData,
        enrollerId: user?.id,
        enrollerName: user?.name
      }

      // In a real app, this would call the API
      // await shopApi.create(shopData)
      
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsSuccess(true)
      
      // Redirect to enrolled shops after 3 seconds
      setTimeout(() => {
        router.push('/enrolled-shops')
      }, 3000)
      
    } catch (error) {
      console.error('Error registering shop:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <EnrollerOnly>
        <DashboardLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop Registered Successfully!</h1>
              <p className="text-gray-600">
                Your shop "{formData.name}" has been registered and is now under review.
                You'll be notified once it's approved and goes live.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your shop will be reviewed by our team</li>
                <li>• You'll receive an email confirmation</li>
                <li>• Once approved, your shop will be visible to customers</li>
                <li>• You can track your shop's status in "My Enrolled Shops"</li>
              </ul>
            </div>

            <div className="space-x-4">
              <Button onClick={() => router.push('/enrolled-shops')}>
                View My Shops
              </Button>
              <Button variant="outline" onClick={() => {
                setIsSuccess(false)
                setFormData({
                  name: '',
                  category: '',
                  tags: [],
                  profileImage: null,
                  images: [],
                  address: '',
                  country: '',
                  city: '',
                  area: '',
                  phone: '',
                  email: '',
                  description: '',
                  openingHours: DEFAULT_DAYS,
                })
              }}>
                Register Another Shop
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
      </EnrollerOnly>
    )
  }

  return (
    <EnrollerOnly>
      <DashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => router.push('/enrolled-shops')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Shops
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Register New Shop</h1>
            <p className="text-gray-600 mt-2">Fill out the form below to register a new shop</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select category</option>
                    {SERVICE_TAGS.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  placeholder="Describe the shop and services offered..."
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Location Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter full address"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter country"
                    />
                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter city"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Area/District</label>
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                      placeholder="Enter area or district"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number *
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                <Calendar className="h-5 w-5 inline mr-2" />
                Opening Hours
              </h2>
              
              <div className="space-y-3">
                {formData.openingHours.map((oh, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3 text-sm font-medium text-gray-700">{oh.day}</div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={oh.open}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          openingHours: prev.openingHours.map((o, i) => i === idx ? { ...o, open: e.target.value } : o)
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                        placeholder="Open time"
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
                        placeholder="Close time"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/enrolled-shops')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-ikigai-primary hover:bg-ikigai-primary/90"
              >
                {isSubmitting ? 'Registering Shop...' : 'Register Shop'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
    </EnrollerOnly>
  )
}