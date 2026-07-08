'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Calendar, Percent, DollarSign, Clock, Users, Image as ImageIcon, Loader2 } from 'lucide-react'
import { API_BASE_URL } from '@/services/api'
import { SpecialOffer } from '@/types'

interface SpecialOfferEditModalProps {
  offer: SpecialOffer | null
  onClose: () => void
  onSaved: () => void
}

/** Format a Date | string | number into the yyyy-mm-dd value an <input type="date"> expects. */
function toDateInput(value?: Date | string | number): string {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function SpecialOfferEditModal({ offer, onClose, onSaved }: SpecialOfferEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: '',
    discountedPrice: '',
    startDate: '',
    endDate: '',
    duration: '',
    maxUses: '',
    image: '',
    termsAndConditions: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    if (!offer) return
    setFormData({
      title: offer.title ?? '',
      description: offer.description ?? '',
      originalPrice: offer.originalPrice != null ? String(offer.originalPrice) : '',
      discountedPrice: offer.discountedPrice != null ? String(offer.discountedPrice) : '',
      startDate: toDateInput(offer.startDate),
      endDate: toDateInput(offer.endDate),
      duration: offer.duration != null ? String(offer.duration) : '',
      maxUses: offer.maxUses != null ? String(offer.maxUses) : '',
      image: offer.image ?? '',
      termsAndConditions: offer.termsAndConditions ?? '',
    })
    setErrors({})
  }, [offer])

  // Keep duration (in days) in sync with the selected date range.
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      setFormData(prev => (prev.duration === String(diffDays) ? prev : { ...prev, duration: String(diffDays) }))
    }
  }, [formData.startDate, formData.endDate])

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const uploadImage = async (file: File) => {
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error(`Upload failed (${res.status})`)
      const data = await res.json()
      set('image', data.imageUrl ?? '')
    } catch (err) {
      setErrors(prev => ({ ...prev, image: "Échec de l'upload de l'image" }))
    } finally {
      setUploadingImage(false)
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.title.trim()) e.title = 'Titre requis'
    const orig = parseFloat(formData.originalPrice)
    const disc = parseFloat(formData.discountedPrice)
    if (!formData.originalPrice || orig <= 0) e.originalPrice = 'Prix original invalide'
    if (!formData.discountedPrice || disc <= 0) e.discountedPrice = 'Prix réduit invalide'
    if (formData.originalPrice && formData.discountedPrice && disc >= orig) e.discountedPrice = 'Le prix réduit doit être inférieur au prix original'
    if (!formData.startDate) e.startDate = 'Date de début requise'
    if (!formData.endDate) e.endDate = 'Date de fin requise'
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) e.endDate = 'La date de fin doit être après la date de début'
    if (formData.maxUses && parseInt(formData.maxUses, 10) < 0) e.maxUses = 'Valeur invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !offer) return
    setSubmitting(true)
    try {
      const payload: Record<string, any> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        originalPrice: Number(formData.originalPrice),
        discountedPrice: Number(formData.discountedPrice),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        duration: formData.duration || '',
        termsAndConditions: formData.termsAndConditions || '',
      }
      if (formData.maxUses !== '') payload.maxUses = parseInt(formData.maxUses, 10)
      if (formData.image) payload.image = formData.image

      const res = await fetch(`${API_BASE_URL}/specials/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? `Erreur ${res.status}`)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setErrors(prev => ({ ...prev, _global: err.message ?? 'Une erreur est survenue' }))
    } finally {
      setSubmitting(false)
    }
  }

  if (!offer) return null

  const orig = parseFloat(formData.originalPrice)
  const disc = parseFloat(formData.discountedPrice)
  const showDiscount = !isNaN(orig) && !isNaN(disc) && disc < orig && orig > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Modifier l'offre spéciale</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {offer.serviceName || offer.serviceId} · {offer.shopName || offer.shopId}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors._global && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{errors._global}</div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
              value={formData.title}
              onChange={e => set('title', e.target.value)}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent resize-none"
              rows={3}
              value={formData.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <DollarSign className="h-3.5 w-3.5 inline mr-1" />Prix original *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.originalPrice ? 'border-red-400' : 'border-gray-200'}`}
                value={formData.originalPrice}
                onChange={e => set('originalPrice', e.target.value)}
              />
              {errors.originalPrice && <p className="text-red-500 text-xs mt-1">{errors.originalPrice}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <DollarSign className="h-3.5 w-3.5 inline mr-1" />Prix réduit *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.discountedPrice ? 'border-red-400' : 'border-gray-200'}`}
                value={formData.discountedPrice}
                onChange={e => set('discountedPrice', e.target.value)}
              />
              {errors.discountedPrice && <p className="text-red-500 text-xs mt-1">{errors.discountedPrice}</p>}
            </div>
          </div>

          {showDiscount && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center text-green-800 text-sm">
                <Percent className="h-4 w-4 mr-2" />
                <span className="font-medium">{Math.round(((orig - disc) / orig) * 100)}% de réduction</span>
                <span className="ml-2">· Économie de {(orig - disc).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="h-3.5 w-3.5 inline mr-1" />Date de début *
              </label>
              <input
                type="date"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.startDate ? 'border-red-400' : 'border-gray-200'}`}
                value={formData.startDate}
                onChange={e => set('startDate', e.target.value)}
              />
              {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="h-3.5 w-3.5 inline mr-1" />Date de fin *
              </label>
              <input
                type="date"
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.endDate ? 'border-red-400' : 'border-gray-200'}`}
                value={formData.endDate}
                onChange={e => set('endDate', e.target.value)}
              />
              {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {formData.duration && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center text-blue-800 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-medium">Durée : {formData.duration} jours</span>
              </div>
            </div>
          )}

          {/* Max uses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Users className="h-3.5 w-3.5 inline mr-1" />Utilisations max (optionnel)
            </label>
            <input
              type="number"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent ${errors.maxUses ? 'border-red-400' : 'border-gray-200'}`}
              placeholder="0 = illimité"
              value={formData.maxUses}
              onChange={e => set('maxUses', e.target.value)}
            />
            {errors.maxUses && <p className="text-red-500 text-xs mt-1">{errors.maxUses}</p>}
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <ImageIcon className="h-3.5 w-3.5 inline mr-1" />Image de l'offre
            </label>
            {formData.image && (
              <img src={formData.image} alt={formData.title} className="w-full h-36 object-cover rounded-lg border border-gray-200 mb-2" />
            )}
            <input
              type="file"
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f) }}
            />
            {uploadingImage && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Upload en cours...</p>}
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Conditions (optionnel)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary focus:border-transparent resize-none"
              rows={2}
              value={formData.termsAndConditions}
              onChange={e => set('termsAndConditions', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" className="bg-ikigai-primary hover:bg-ikigai-primary/90" disabled={submitting || uploadingImage}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement...</> : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
