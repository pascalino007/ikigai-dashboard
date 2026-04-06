'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Tag } from 'lucide-react'

export interface SousCategoryItem {
  id: string
  name: string
  category: string
  tags?: string[] | string
  isActive?: boolean
  description?: string
}

interface Category {
  id: string
  name: string
}

interface SousCategoryEditModalProps {
  isOpen: boolean
  onClose: () => void
  item: SousCategoryItem | null
  onSubmit: (id: string, data: { name: string; category: string; tags: string; isActive: boolean }) => Promise<void>
}

export function SousCategoryEditModal({ isOpen, onClose, item, onSubmit }: SousCategoryEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    tags: '',
    isActive: true
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (item) {
      const tagsStr = Array.isArray(item.tags)
        ? item.tags.join(', ')
        : typeof item.tags === 'string'
          ? item.tags
          : ''
      setFormData({
        name: item.name || '',
        category: item.category || '',
        tags: tagsStr,
        isActive: item.isActive ?? true
      })
      setErrors({})
    }
  }, [item])

  // When categories load, resolve category name to id if needed
  useEffect(() => {
    if (!item || categories.length === 0) return
    const byName = categories.find((c) => c.name === item.category)
    const byId = categories.find((c) => c.id === item.category)
    if (byName && !byId) {
      setFormData((prev) => ({ ...prev, category: byName.id }))
    }
  }, [item, categories])

  useEffect(() => {
    if (!isOpen) return
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const res = await fetch(`${API_BASE_URL}/categories/`)
        if (!res.ok) throw new Error('Failed to load categories')
        const data = await res.json()
        setCategories(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [isOpen])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Sous category name is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !item) return

    setIsSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        tags: formData.tags.trim(),
        isActive: formData.isActive
      }

      const res = await fetch(`${API_BASE_URL}/sous-categories/${item.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.text().catch(() => '')
        throw new Error(err || `Update failed (${res.status})`)
      }

      await onSubmit(item.id, { ...formData, tags: formData.tags })
      onClose()
    } catch (err) {
      console.error(err)
      setErrors(prev => ({ ...prev, submit: (err as Error).message }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Sous Catégorie</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sous Catégorie *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Haircut & Styling"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category...</option>
              {isLoadingCategories ? (
                <option>Loading...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary"
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
              <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-ikigai-primary hover:bg-ikigai-primary/90"
            >
              {isSubmitting ? 'Saving...' : 'Update Sous Catégorie'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
