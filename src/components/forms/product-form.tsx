'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, Loader2, Trash2, AlertCircle, Store } from 'lucide-react'

export interface Product {
  id?: number
  name: string
  image1?: string
  image2?: string
  image3?: string
  price: string
  Category: string
  sous_category?: string
  status: string
  Description?: string
  provider_id: number
}

interface ApiCategory { id: string; name: string }
interface ApiSousCategory { id: string; name: string; category: string }
interface ApiShop { id: number; name: string }

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: any) => void
  initialData?: Product | null
  providerId: number
}

export function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  providerId
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '', price: '', category: '', sous_category: '', status: 'available',
    description: '', image1: '', image2: '', image3: '',
    file1: null as File | null, file2: null as File | null, file3: null as File | null,
    provider_type: 'admin' as 'admin' | 'shop',
    shop_id: '' as string,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [allSousCategories, setAllSousCategories] = useState<ApiSousCategory[]>([])
  const [shops, setShops] = useState<ApiShop[]>([])
  const [loadingMeta, setLoadingMeta] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoadingMeta(true)
    Promise.all([
      fetch(`${API_BASE_URL}/categories/`).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE_URL}/sous-categories`).then(r => r.ok ? r.json() : []),
      fetch(`${API_BASE_URL}/shops`).then(r => r.ok ? r.json() : []),
    ]).then(([cats, scs, shs]) => {
      setCategories(Array.isArray(cats) ? cats.map((c: any) => ({ id: String(c.id), name: c.name })) : [])
      setAllSousCategories(Array.isArray(scs) ? scs.map((s: any) => ({ id: String(s.id), name: s.name, category: String(s.category) })) : [])
      setShops(Array.isArray(shs) ? shs.map((s: any) => ({ id: s.id, name: s.name ?? s.shop_name ?? `Shop #${s.id}` })) : [])
    }).catch(() => {}).finally(() => setLoadingMeta(false))
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || '', price: initialData.price || '',
        category: initialData.Category || '', sous_category: initialData.sous_category || '',
        status: initialData.status || 'available', description: initialData.Description || '',
        image1: initialData.image1 || '', image2: initialData.image2 || '', image3: initialData.image3 || '',
        file1: null, file2: null, file3: null,
        provider_type: initialData.provider_id === 0 ? 'admin' : 'shop',
        shop_id: initialData.provider_id !== 0 ? String(initialData.provider_id) : '',
      }))
    } else {
      setFormData({ name: '', price: '', category: '', sous_category: '', status: 'available', description: '',
        image1: '', image2: '', image3: '', file1: null, file2: null, file3: null, provider_type: 'admin', shop_id: '' })
    }
    setErrors({})
  }, [initialData, isOpen])

  const filteredSousCategories = allSousCategories.filter(s => s.category === formData.category)

  const set = (field: string, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'category') next.sous_category = ''
      return next
    })
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleFileChange = (slot: 1 | 2 | 3, file: File | null) => {
    if (file) setFormData(prev => ({ ...prev, [`file${slot}`]: file, [`image${slot}`]: URL.createObjectURL(file) }))
  }
  const removeImage = (slot: 1 | 2 | 3) => setFormData(prev => ({ ...prev, [`file${slot}`]: null, [`image${slot}`]: '' }))

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData(); fd.append('image', file)
    const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error('Image upload failed')
    const data = await res.json()
    return data.imageUrl || data.url || ''
  }

  const validateForm = (): boolean => {
    const e: Record<string, string> = {}
    if (!formData.name.trim()) e.name = 'Requis'
    if (!formData.price.trim()) e.price = 'Requis'
    if (!formData.category.trim()) e.category = 'Requis'
    if (formData.provider_type === 'shop' && !formData.shop_id) e.shop_id = 'Sélectionner un salon'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true); setUploading(true)
    try {
      let img1 = formData.image1, img2 = formData.image2, img3 = formData.image3
      if (formData.file1) img1 = await uploadImage(formData.file1)
      if (formData.file2) img2 = await uploadImage(formData.file2)
      if (formData.file3) img3 = await uploadImage(formData.file3)
      const safeImg = (u: string) => (u.startsWith('blob:') ? '' : u)
      const pid = formData.provider_type === 'admin' ? 0 : Number(formData.shop_id)
      const payload = {
        name: formData.name.trim(), price: formData.price,
        Category: formData.category, sous_category: formData.sous_category || undefined,
        status: formData.status, Description: formData.description?.trim() || undefined,
        provider_id: pid,
        image1: safeImg(img1), image2: safeImg(img2), image3: safeImg(img3),
      }
      const url = initialData?.id ? `${API_BASE_URL}/marketplace/products/${initialData.id}` : `${API_BASE_URL}/marketplace/products`
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err?.message || 'Failed to save') }
      const result = await res.json()
      if (onSubmit) onSubmit(result)
      onClose()
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error instanceof Error ? error.message : 'An error occurred' }))
    } finally { setIsSubmitting(false); setUploading(false) }
  }

  if (!isOpen) return null

  const inp = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-ikigai-primary focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:border-gray-700'
  const inpErr = 'border-red-400'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-ikigai-primary/5 to-transparent">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{initialData ? 'Modifier le produit' : 'Nouveau produit'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{initialData ? 'Mettez à jour les informations du produit' : 'Ajoutez un produit à la marketplace'}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Photos du produit <span className="font-normal text-gray-400">(max 3)</span></label>
              <div className="grid grid-cols-3 gap-3">
                {([1, 2, 3] as const).map(slot => {
                  const imgUrl = formData[`image${slot}` as 'image1' | 'image2' | 'image3']
                  return (
                    <div key={slot} className="relative group aspect-square">
                      {imgUrl ? (
                        <div className="w-full h-full rounded-xl overflow-hidden border-2 border-gray-200">
                          <img src={imgUrl} alt={`Photo ${slot}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                            <button type="button" onClick={() => removeImage(slot)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-ikigai-primary hover:bg-ikigai-primary/5 transition-all">
                          <Upload className="h-5 w-5 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-400">Photo {slot}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(slot, e.target.files?.[0] || null)} />
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Provider */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Store className="h-4 w-4 text-ikigai-primary" />Vendeur
              </label>
              <div className="flex gap-3 mb-3">
                {(['admin', 'shop'] as const).map(t => (
                  <button key={t} type="button"
                    onClick={() => set('provider_type', t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                      formData.provider_type === t
                        ? 'bg-ikigai-primary text-white border-ikigai-primary shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-600 border-gray-200 hover:border-ikigai-primary'
                    }`}>
                    {t === 'admin' ? '🏢 Admin (universel)' : '🏪 Salon spécifique'}
                  </button>
                ))}
              </div>
              {formData.provider_type === 'shop' && (
                <div>
                  {loadingMeta ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                      <Loader2 className="h-3 w-3 animate-spin" />Chargement des salons...
                    </div>
                  ) : (
                    <select value={formData.shop_id} onChange={e => set('shop_id', e.target.value)}
                      className={`${inp} ${errors.shop_id ? inpErr : ''}`}>
                      <option value="">Sélectionner un salon...</option>
                      {shops.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
                    </select>
                  )}
                  {errors.shop_id && <p className="text-red-500 text-xs mt-1">{errors.shop_id}</p>}
                </div>
              )}
            </div>

            {/* Name + Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nom du produit *</label>
                <input type="text" value={formData.name} onChange={e => set('name', e.target.value)}
                  className={`${inp} ${errors.name ? inpErr : ''}`} placeholder="ex: Huile de Karité Premium" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Prix (FCFA) *</label>
                <input type="number" value={formData.price} onChange={e => set('price', e.target.value)}
                  className={`${inp} ${errors.price ? inpErr : ''}`} placeholder="5000" min="0" />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
            </div>

            {/* Category + Sous-category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Catégorie *</label>
                {loadingMeta ? (
                  <div className={`${inp} flex items-center gap-2 text-gray-400`}><Loader2 className="h-3 w-3 animate-spin" />Chargement...</div>
                ) : (
                  <select value={formData.category} onChange={e => set('category', e.target.value)}
                    className={`${inp} ${errors.category ? inpErr : ''}`}>
                    <option value="">Sélectionner...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Sous-catégorie</label>
                <select value={formData.sous_category} onChange={e => set('sous_category', e.target.value)}
                  disabled={!formData.category || filteredSousCategories.length === 0}
                  className={`${inp} disabled:bg-gray-50 disabled:text-gray-400`}>
                  <option value="">{!formData.category ? 'Choisir une catégorie' : filteredSousCategories.length === 0 ? 'Aucune disponible' : 'Sélectionner...'}</option>
                  {filteredSousCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Statut</label>
              <div className="flex gap-2">
                {[{v:'available',l:'Disponible',c:'green'},{v:'out_of_stock',l:'Rupture',c:'red'},{v:'hidden',l:'Masqué',c:'gray'}].map(({v,l,c}) => (
                  <button key={v} type="button" onClick={() => set('status', v)}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all ${
                      formData.status === v
                        ? c === 'green' ? 'bg-green-500 text-white border-green-500' : c === 'red' ? 'bg-red-500 text-white border-red-500' : 'bg-gray-500 text-white border-gray-500'
                        : 'bg-white dark:bg-gray-800 text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea value={formData.description} onChange={e => set('description', e.target.value)} rows={3}
                className={inp} placeholder="Décrivez le produit..." />
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />{errors.submit}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting || uploading} className="bg-ikigai-primary hover:bg-ikigai-primary/90 min-w-[140px]">
              {isSubmitting || uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{uploading ? 'Upload...' : 'Enregistrement...'}</> : initialData ? 'Mettre à jour' : 'Créer le produit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}