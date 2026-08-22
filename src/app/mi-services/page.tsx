'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, Tag, ImageIcon, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'

interface MiService {
  id: number
  name: string
  imageUrl: string | null
  price: number
  details: string | null
  categoryId: number | null
  realisationDays: number | null
  isActive: boolean
  createdAt: string
}

interface MiServiceCategory {
  id: number
  name: string
  isActive: boolean
}

const IMG_BASE = 'https://myikigai.sfo2.digitaloceanspaces.com/uploads/'

export default function MiServicesPage() {
  const [services, setServices] = useState<MiService[]>([])
  const [categories, setCategories] = useState<MiServiceCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<MiService | null>(null)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [svcRes, catRes] = await Promise.all([
        fetch(`${API_BASE_URL}/mi-services`),
        fetch(`${API_BASE_URL}/mi-services/categories`),
      ])
      const data = await svcRes.json()
      setServices(Array.isArray(data) ? data : [])
      if (catRes.ok) {
        const cats = await catRes.json()
        setCategories(Array.isArray(cats) ? cats : [])
      }
    } catch (e) { setServices([]) }
    finally { setLoading(false) }
  }

  const categoryName = (id: number | null) =>
    id != null ? categories.find(c => c.id === id)?.name ?? null : null

  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory =
      filterCategory === 'all' ||
      (filterCategory === 'none' ? s.categoryId == null : String(s.categoryId) === filterCategory)
    return matchSearch && matchCategory
  })

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce Mi Service ?')) return
    await fetch(`${API_BASE_URL}/mi-services/${id}`, { method: 'DELETE' })
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const openAdd = () => { setEditingService(null); setShowModal(true) }
  const openEdit = (s: MiService) => { setEditingService(s); setShowModal(true) }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Services</h1>
            <p className="text-sm text-gray-500 mt-1">Services Mi gérés par l&apos;admin</p>
          </div>
          <Button onClick={openAdd} className="bg-ikigai-primary hover:bg-ikigai-primary/90">
            <Plus className="h-4 w-4 mr-2" />Ajouter
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', val: services.length, color: 'bg-ikigai-primary/10', icon: <Tag className="h-5 w-5 text-ikigai-primary" /> },
            { label: 'Actifs', val: services.filter(s => s.isActive).length, color: 'bg-green-50', icon: <span className="h-3 w-3 rounded-full bg-green-500" /> },
            { label: 'Inactifs', val: services.filter(s => !s.isActive).length, color: 'bg-red-50', icon: <span className="h-3 w-3 rounded-full bg-red-400" /> },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
              <div className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center`}>{s.icon}</div>
              <div><p className="text-2xl font-bold text-gray-900">{s.val}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary bg-white dark:bg-gray-800"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="all">Toutes catégories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="none">Sans catégorie</option>
          </select>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ikigai-primary mr-3" />Chargement...
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(s => (
              <div key={s.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="relative h-40 flex-shrink-0 bg-gray-100">
                  {s.imageUrl ? (
                    <img src={s.imageUrl.startsWith('http') ? s.imageUrl : IMG_BASE + s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-10 w-10 text-gray-300" /></div>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {s.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-gray-900 truncate">{s.name}</h3>
                  <div className="mt-1 mb-1.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryName(s.categoryId) ? 'bg-ikigai-primary/10 text-ikigai-primary' : 'bg-gray-100 text-gray-400'}`}>
                      <Tag className="h-3 w-3" />
                      {categoryName(s.categoryId) || 'Sans catégorie'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-2">{s.details || '—'}</p>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-ikigai-primary">{s.price.toLocaleString('fr-FR')} FCFA</p>
                    {s.realisationDays != null && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{s.realisationDays} j</span>
                    )}
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString('fr-FR')}</span>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 hover:text-ikigai-primary hover:bg-ikigai-primary/5 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(s.id)} className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center shadow-sm">
            <Tag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Aucun Mi Service trouvé</p>
            {!searchTerm && <Button onClick={openAdd} className="mt-4 bg-ikigai-primary"><Plus className="h-4 w-4 mr-2" />Ajouter</Button>}
          </div>
        )}

        <MiServiceModal isOpen={showModal} onClose={() => setShowModal(false)} onSaved={loadAll} initialData={editingService} />
      </div>
    </DashboardLayout>
  )
}

function MiServiceModal({ isOpen, onClose, onSaved, initialData }: { isOpen: boolean; onClose: () => void; onSaved: () => void; initialData: MiService | null }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [details, setDetails] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [realisationDays, setRealisationDays] = useState('1')
  const [categories, setCategories] = useState<MiServiceCategory[]>([])
  const [isActive, setIsActive] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!isOpen) return
    fetch(`${API_BASE_URL}/mi-services/categories`)
      .then(r => r.json())
      .then(d => setCategories(Array.isArray(d) ? d : []))
      .catch(() => setCategories([]))
  }, [isOpen])

  useEffect(() => {
    if (initialData) {
      setName(initialData.name); setPrice(String(initialData.price)); setDetails(initialData.details || ''); setIsActive(initialData.isActive)
      setCategoryId(initialData.categoryId != null ? String(initialData.categoryId) : '')
      setRealisationDays(initialData.realisationDays != null ? String(initialData.realisationDays) : '1')
      setImageUrl(initialData.imageUrl || ''); setImagePreview(initialData.imageUrl || '')
    } else { setName(''); setPrice(''); setDetails(''); setCategoryId(''); setRealisationDays('1'); setIsActive(true); setImageUrl(''); setImagePreview('') }
    setErrors({})
  }, [initialData, isOpen])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch(`${API_BASE_URL}/upload`, { method: 'POST', body: fd })
      const data = await res.json()
      const url = data.imageUrl || data.url || ''
      setImageUrl(url); setImagePreview(url)
    } catch (e) { setErrors(prev => ({ ...prev, image: "Échec upload" })) }
    finally { setUploadingImage(false) }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Requis'
    if (!price || parseInt(price) <= 0) e.price = 'Prix invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || uploadingImage) return
    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        price: parseInt(price),
        details: details.trim() || undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        realisationDays: realisationDays ? parseInt(realisationDays) : undefined,
        isActive,
        imageUrl: imageUrl || undefined,
      }
      const url = initialData ? `${API_BASE_URL}/mi-services/${initialData.id}` : `${API_BASE_URL}/mi-services`
      const res = await fetch(url, { method: initialData ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Erreur')
      onSaved(); onClose()
    } catch (err: any) { setErrors({ _global: err.message }) }
    finally { setSubmitting(false) }
  }

  if (!isOpen) return null
  const IMG_BASE = 'https://myikigai.sfo2.digitaloceanspaces.com/uploads/'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{initialData ? 'Modifier' : 'Nouveau'} Mi Service</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><Plus className="h-4 w-4 rotate-45" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors._global && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{errors._global}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            {imagePreview ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border mb-2">
                <img src={imagePreview.startsWith('http') ? imagePreview : IMG_BASE + imagePreview} alt="preview" className="w-full h-full object-cover" />
                {uploadingImage && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="h-6 w-6 text-white animate-spin" /></div>}
              </div>
            ) : null}
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-ikigai-primary transition-colors">
              <ImageIcon className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-500">Choisir une image</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input type="text" className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary ${errors.name ? 'border-red-400' : 'border-gray-200'}`} value={name} onChange={e => setName(e.target.value)} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA) *</label>
              <input type="number" className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary ${errors.price ? 'border-red-400' : 'border-gray-200'}`} value={price} onChange={e => setPrice(e.target.value)} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temps de réalisation (jours)</label>
              <input type="number" min={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary" value={realisationDays} onChange={e => setRealisationDays(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary bg-white" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="">— Aucune —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Détails</label>
            <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary resize-none" value={details} onChange={e => setDetails(e.target.value)} />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 text-ikigai-primary border-gray-300 rounded" />
            <span className="text-sm text-gray-700">Actif</span>
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Annuler</Button>
            <Button type="submit" className="bg-ikigai-primary hover:bg-ikigai-primary/90" disabled={submitting || uploadingImage}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement...</> : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
