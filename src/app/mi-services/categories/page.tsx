'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, Tag, ImageIcon, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'

interface MiServiceCategory {
  id: number
  name: string
  imageUrl: string | null
  isActive: boolean
  createdAt: string
}

const IMG_BASE = 'https://myikigai.sfo2.digitaloceanspaces.com/uploads/'

export default function MiServiceCategoriesPage() {
  const [categories, setCategories] = useState<MiServiceCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<MiServiceCategory | null>(null)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/mi-services/categories`)
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (e) { setCategories([]) }
    finally { setLoading(false) }
  }

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette catégorie ? Les Mi Services associés ne seront plus rangés dessous.')) return
    await fetch(`${API_BASE_URL}/mi-services/categories/${id}`, { method: 'DELETE' })
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const openAdd = () => { setEditing(null); setShowModal(true) }
  const openEdit = (c: MiServiceCategory) => { setEditing(c); setShowModal(true) }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Catégories Mi Services</h1>
            <p className="text-sm text-gray-500 mt-1">Regroupez les Mi Services par catégorie</p>
          </div>
          <Button onClick={openAdd} className="bg-ikigai-primary hover:bg-ikigai-primary/90">
            <Plus className="h-4 w-4 mr-2" />Ajouter
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', val: categories.length, color: 'bg-ikigai-primary/10', icon: <Tag className="h-5 w-5 text-ikigai-primary" /> },
            { label: 'Actives', val: categories.filter(c => c.isActive).length, color: 'bg-green-50', icon: <span className="h-3 w-3 rounded-full bg-green-500" /> },
            { label: 'Inactives', val: categories.filter(c => !c.isActive).length, color: 'bg-red-50', icon: <span className="h-3 w-3 rounded-full bg-red-400" /> },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
              <div className={`h-10 w-10 rounded-lg ${s.color} flex items-center justify-center`}>{s.icon}</div>
              <div><p className="text-2xl font-bold text-gray-900">{s.val}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ikigai-primary mr-3" />Chargement...
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(c => (
              <div key={c.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="relative h-32 flex-shrink-0 bg-gray-100">
                  {c.imageUrl ? (
                    <img src={IMG_BASE + c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-10 w-10 text-gray-300" /></div>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-gray-900 truncate flex-1">{c.name}</h3>
                  <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</span>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 hover:text-ikigai-primary hover:bg-ikigai-primary/5 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(c.id)} className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
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
            <p className="text-gray-600 font-medium">Aucune catégorie trouvée</p>
            {!searchTerm && <Button onClick={openAdd} className="mt-4 bg-ikigai-primary"><Plus className="h-4 w-4 mr-2" />Ajouter</Button>}
          </div>
        )}

        <CategoryModal isOpen={showModal} onClose={() => setShowModal(false)} onSaved={loadAll} initialData={editing} />
      </div>
    </DashboardLayout>
  )
}

function CategoryModal({ isOpen, onClose, onSaved, initialData }: { isOpen: boolean; onClose: () => void; onSaved: () => void; initialData: MiServiceCategory | null }) {
  const [name, setName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setName(initialData.name); setIsActive(initialData.isActive)
      setImageUrl(initialData.imageUrl || ''); setImagePreview(initialData.imageUrl || '')
    } else { setName(''); setIsActive(true); setImageUrl(''); setImagePreview('') }
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
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || uploadingImage) return
    setSubmitting(true)
    try {
      const payload = { name: name.trim(), isActive, imageUrl: imageUrl || undefined }
      const url = initialData ? `${API_BASE_URL}/mi-services/categories/${initialData.id}` : `${API_BASE_URL}/mi-services/categories`
      const res = await fetch(url, { method: initialData ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Erreur')
      onSaved(); onClose()
    } catch (err: any) { setErrors({ _global: err.message }) }
    finally { setSubmitting(false) }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{initialData ? 'Modifier' : 'Nouvelle'} catégorie</h2>
          <Button variant="ghost" size="sm" onClick={onClose}><Plus className="h-4 w-4 rotate-45" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors._global && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{errors._global}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            {imagePreview ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden border mb-2">
                <img src={IMG_BASE + imagePreview} alt="preview" className="w-full h-full object-cover" />
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
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 text-ikigai-primary border-gray-300 rounded" />
            <span className="text-sm text-gray-700">Active</span>
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
