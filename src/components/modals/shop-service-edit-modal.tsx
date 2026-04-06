'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, DollarSign, Clock, Tag, Loader2 } from 'lucide-react'
import { API_BASE_URL } from '@/services/api'
import { ShopService } from '@/types'

interface ShopServiceEditModalProps {
  service: ShopService | null
  onClose: () => void
  onSaved: () => void
}

interface ApiCategory { id: string; name: string }
interface ApiSousCategory { id: string; name: string; category: string }

export function ShopServiceEditModal({ service, onClose, onSaved }: ShopServiceEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    sous_category: '',
    tags: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [allSousCategories, setAllSousCategories] = useState<ApiSousCategory[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (!service) return
    setFormData({
      name: service.name ?? '',
      description: service.description ?? '',
      price: String(service.price ?? ''),
      duration: String(service.duration ?? ''),
      category: service.category ?? '',
      sous_category: service.subcategory ?? '',
      tags: Array.isArray(service.tags) ? service.tags.join(', ') : (service.tags ?? ''),
    })
    setErrors({})
    setLoadingData(true)
    Promise.all([
      fetch(`${API_BASE_URL}/categories/`).then(r => r.json()),
      fetch(`${API_BASE_URL}/sous-categories`).then(r => r.json()),
    ]).then(([cats, scs]) => {
      setCategories(Array.isArray(cats) ? cats.map((c: any) => ({ id: String(c.id), name: c.name })) : [])
      setAllSousCategories(Array.isArray(scs) ? scs.map((s: any) => ({ id: String(s.id), name: s.name, category: String(s.category) })) : [])
    }).catch(() => {}).finally(() => setLoadingData(false))
  }, [service])

  const filteredSousCategories = allSousCategories.filter(s => s.category === formData.category)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.name.trim()) e.name = 'Requis'
    if (!formData.description.trim()) e.description = 'Requis'
    if (!formData.price || parseFloat(formData.price) <= 0) e.price = 'Prix invalide'
    if (!formData.duration || parseInt(formData.duration) <= 0) e.duration = 'Durée invalide'
    if (!formData.category) e.category = 'Requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !service) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/services/${service.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          Category: formData.category,
          sous_category: formData.sous_category || '',
          price: formData.price,
          duration: formData.duration,
          tags: formData.tags || '',
          provider_name: service.providerName ?? 'admin',
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? `Erreur ${res.status}`)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setErrors({ _global: err.message ?? 'Une erreur est survenue' })
    } finally {
      setSubmitting(false)
    }
  }

  const set = (field: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'category') next.sous_category = ''
      return next
    })
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  if (!service) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Modifier le service</h2>
            <p className="text-xs text-gray-400 mt-0.5">ID #{service.id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors._global && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{errors._global}</div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du service *</label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
              value={formData.name}
              onChange={e => set('name', e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
              rows={3}
              value={formData.description}
              onChange={e => set('description', e.target.value)}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Category + Sous-category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie *</label>
              {loadingData ? (
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-400">
                  <Loader2 className="h-3 w-3 animate-spin" /> Chargement...
                </div>
              ) : (
                <select
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.category ? 'border-red-400' : 'border-gray-200'}`}
                  value={formData.category}
                  onChange={e => set('category', e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sous-catégorie</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                value={formData.sous_category}
                onChange={e => set('sous_category', e.target.value)}
                disabled={!formData.category || filteredSousCategories.length === 0}
              >
                <option value="">
                  {!formData.category ? "Choisir une catégorie d'abord" : filteredSousCategories.length === 0 ? 'Aucune sous-catégorie' : 'Sélectionner...'}
                </option>
                {filteredSousCategories.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <DollarSign className="h-3.5 w-3.5 inline mr-1" />Prix (FCFA) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.price ? 'border-red-400' : 'border-gray-200'}`}
                value={formData.price}
                onChange={e => set('price', e.target.value)}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Clock className="h-3.5 w-3.5 inline mr-1" />Durée (minutes) *
              </label>
              <input
                type="number"
                min="1"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.duration ? 'border-red-400' : 'border-gray-200'}`}
                value={formData.duration}
                onChange={e => set('duration', e.target.value)}
              />
              {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Tag className="h-3.5 w-3.5 inline mr-1" />Tags (optionnel)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              placeholder="coupe, brushing, soin (séparés par virgule)"
              value={formData.tags}
              onChange={e => set('tags', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" className="bg-ikigai-primary hover:bg-ikigai-primary/90" disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement...</> : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
