'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, DollarSign, Clock, Tag, Image as ImageIcon, User } from 'lucide-react'

interface AreaCountryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  
}

export function AreaCountryForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  
}: AreaCountryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    subcategory: '',
    providerId: '',
    providerName: '',
    image: null as File | null,
    tags: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Service name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required'
    }
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Valid duration is required'
    }
    if (!formData.category) newErrors.category = 'Category is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        ...formData,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration)
      })
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      subcategory: '',
      providerId: '',
      providerName: '',
      image: null,
      tags: ''
    })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ 
      ...prev, 
      category, 
      subcategory: '' // Reset subcategory when category changes
    }))
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ajouter un nouveau quartier</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Service Name and Description */}
          <div className="grid grid-cols-1 gap-4">
          

           
          </div>

          {/* Category and Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           

            
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
         
            
          </div>

          {/* Provider Assignment (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du quartier *
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Quartier"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la zone (optionnel)
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Zone"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              Tags (Optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              placeholder="Les noms des endroits les plus indicateurs dune zone"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
          </div>

         

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-ikigai-primary hover:bg-ikigai-primary/90">
              Ajouter Zone
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
