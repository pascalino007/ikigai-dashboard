'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Tag } from 'lucide-react'

interface Category {
  id: string
  name: string
}

export function SousCategoryForm({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    tags: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ Fetch categories when modal opens
  useEffect(() => {
    if (!isOpen) return
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`http://168.231.101.119:4040/categories/`, {
          method: 'GET',
        })
        if (!res.ok) throw new Error('Failed to load categories')
        const data = await res.json()
        setCategories(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [isOpen])

  // ✅ Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Sous category name is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ✅ Handle submit (POST to API)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`http://168.231.101.119:4040/sous-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to submit sous category')
      alert('Sous category added successfully!')
      handleClose()
    } catch (err) {
      console.error(err)
      alert('An error occurred while submitting the form.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', category: '', tags: '' })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Ajouter Nouvelle Sous Catégorie
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sous category name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sous Catégorie *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Haircut & Styling"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category...</option>
              {isLoading ? (
                <option>Loading...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              Tags (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., haircut, styling, blow-dry"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary border-gray-300"
            />
          </div>

          {/* Form actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-ikigai-primary hover:bg-ikigai-primary/90"
            >
              {isSubmitting ? 'Saving...' : 'Add Sous Catégorie'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
