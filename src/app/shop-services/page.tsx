'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, Clock, DollarSign, Tag, List, Grid, Layers, CheckCircle, XCircle } from 'lucide-react'
import { ShopService } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ShopServiceForm } from '@/components/forms/shop-service-form'
import { ShopServiceEditModal } from '@/components/modals/shop-service-edit-modal'

const BADGE_COLORS = [
  'bg-purple-100 text-purple-800', 'bg-pink-100 text-pink-800',
  'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800', 'bg-orange-100 text-orange-800',
  'bg-indigo-100 text-indigo-800', 'bg-teal-100 text-teal-800',
]
function catColor(name: string) {
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return BADGE_COLORS[Math.abs(h) % BADGE_COLORS.length]
}

interface NormalizedService extends ShopService {
  categoryName: string
  sousCategoryName: string
}

function normalize(s: any, i: number): NormalizedService {
  const dur = String(s.duration ?? '').match(/(\d+)/)
  return {
    id: String(s.id ?? `tmp-${i}`),
    name: s.name ?? 'Untitled',
    description: s.description ?? '',
    price: Number(String(s.price ?? '0').replace(/[^\d.-]/g, '')) || 0,
    duration: dur ? parseInt(dur[1]) : Number(s.duration ?? 0),
    category: String(s.Category ?? s.category ?? ''),
    subcategory: String(s.sous_category ?? s.subcategory ?? ''),
    categoryName: s.categoryName ?? '',
    sousCategoryName: s.sousCategoryName ?? '',
    shopId: String(s.shopId ?? s.shop_id ?? ''),
    shopName: String(s.shopName ?? s.shop_name ?? ''),
    providerId: s.provider_id ? String(s.provider_id) : undefined,
    providerName: s.provider_name ?? s.providerName ?? 'admin',
    isActive: typeof s.is_active !== 'undefined' ? Boolean(s.is_active) : (s.isActive ?? true),
    tags: s.tags ? (typeof s.tags === 'string' ? s.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : s.tags) : [],
    image: s.imageurl ?? s.image ?? undefined,
    createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
    updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
    services: [],
  }
}

export default function ShopServicesPage() {
  const [services, setServices] = useState<NormalizedService[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState<NormalizedService | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const loadAll = async () => {
    setLoading(true); setError(null)
    try {
      const [svcRes, catRes] = await Promise.all([
        fetch(`${API_BASE_URL}/services`),
        fetch(`${API_BASE_URL}/categories/`),
      ])
      if (!svcRes.ok) throw new Error(`Erreur ${svcRes.status} lors du chargement des services`)
      const raw = await svcRes.json()
      const arr = Array.isArray(raw) ? raw : (raw.data ?? raw.services ?? [])
      setServices(arr.map(normalize))
      if (catRes.ok) {
        const cats = await catRes.json()
        setCategories(Array.isArray(cats) ? cats.map((c: any) => ({ id: String(c.id), name: c.name })) : [])
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchCat = filterCategory === 'all' || s.category === filterCategory
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' && s.isActive) || (filterStatus === 'inactive' && !s.isActive)
    return matchSearch && matchCat && matchStatus
  })

  const totalActive = services.filter(s => s.isActive).length

  const handleAddService = async (formData: any) => {
    const res = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? `Erreur ${res.status}`)
    }
    await loadAll()
  }

  const handleToggle = async (s: NormalizedService) => {
    await fetch(`${API_BASE_URL}/services/${s.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !s.isActive }),
    }).catch(() => {})
    setServices(prev => prev.map(x => x.id === s.id ? { ...x, isActive: !x.isActive } : x))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce service ?')) return
    await fetch(`${API_BASE_URL}/services/${id}`, { method: 'DELETE' }).catch(() => {})
    setServices(prev => prev.filter(x => x.id !== id))
  }

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length
  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : filtered.map(s => s.id))

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Services</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Services universels créés par l'admin</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-ikigai-primary hover:bg-ikigai-primary/90 self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />Ajouter
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: <Layers className="h-5 w-5 text-ikigai-primary" />, bg: 'bg-ikigai-primary/10', val: services.length, label: 'Total' },
            { icon: <CheckCircle className="h-5 w-5 text-green-600" />, bg: 'bg-green-50', val: totalActive, label: 'Actifs' },
            { icon: <XCircle className="h-5 w-5 text-red-500" />, bg: 'bg-red-50', val: services.length - totalActive, label: 'Inactifs' },
          ].map(({ icon, bg, val, label }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
              <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
              <div><p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{val}</p><p className="text-xs text-gray-500">{label}</p></div>
            </div>
          ))}
        </div>

        {/* Filters + View toggle */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary"
            value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">Toutes catégories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ikigai-primary"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Tous statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1">
            {(['list', 'grid'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${viewMode === m ? 'bg-ikigai-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'list' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 py-16 flex items-center justify-center text-gray-400 shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ikigai-primary mr-3" />Chargement...
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-100 py-12 text-center text-red-500 shadow-sm">
            <p className="font-medium">{error}</p>
            <Button variant="outline" className="mt-3" onClick={loadAll}>Réessayer</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 py-16 text-center shadow-sm">
            <Tag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Aucun service trouvé</p>
            <p className="text-gray-400 text-sm mt-1">{searchTerm || filterCategory !== 'all' || filterStatus !== 'all' ? 'Modifiez vos filtres.' : 'Créez votre premier service.'}</p>
            {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
              <Button className="mt-4 bg-ikigai-primary hover:bg-ikigai-primary/90" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />Créer un service
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(s => (
              <div key={s.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="h-28 bg-ikigai-primary flex items-center justify-center relative">
                  {s.image ? <img src={s.image} alt={s.name} className="h-full w-full object-cover" /> :
                    <span className="text-2xl font-bold text-white">{s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>}
                  <span className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                    {s.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{s.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">{s.description}</p>
                  {(s.category || s.subcategory) && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {(s.categoryName || s.category) && <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${catColor(s.categoryName || s.category)}`}>{s.categoryName || s.category}</span>}
                      {(s.sousCategoryName || s.subcategory) && <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-500">{s.sousCategoryName || s.subcategory}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 flex-1 items-end">
                    <DollarSign className="h-3 w-3" />{s.price} FCFA
                    <Clock className="h-3 w-3 ml-1" />{s.duration} min
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 dark:border-gray-800">
                    <button onClick={() => setEditingService(s)} className="text-xs text-ikigai-primary hover:underline">Modifier</button>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggle(s)} className={`text-xs ${s.isActive ? 'text-orange-500' : 'text-green-600'}`}>{s.isActive ? 'Désact.' : 'Activer'}</button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-4 py-3">
                      <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 text-ikigai-primary border-gray-300 rounded" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Catégorie</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Prix / Durée</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-4">
                        <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} className="h-4 w-4 text-ikigai-primary border-gray-300 rounded" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-ikigai-primary flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                            {s.image ? <img src={s.image} alt={s.name} className="h-full w-full object-cover" /> : s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{s.name}</p>
                            <p className="text-xs text-gray-400 max-w-xs truncate">{s.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${catColor(s.categoryName || s.category)}`}>{s.categoryName || s.category || '—'}</span>
                        {(s.sousCategoryName || s.subcategory) && <p className="text-xs text-gray-400 mt-0.5">{s.sousCategoryName || s.subcategory}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                          <DollarSign className="h-3 w-3" />{s.price}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <Clock className="h-3 w-3" />{s.duration} min
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {s.tags?.slice(0, 2).map((t, i) => <span key={i} className="px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{t}</span>)}
                          {(s.tags?.length ?? 0) > 2 && <span className="text-xs text-gray-400">+{s.tags!.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                          {s.isActive ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setEditingService(s)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggle(s)}
                            className={`h-8 px-2 text-xs ${s.isActive ? 'text-orange-500' : 'text-green-600'}`}>
                            {s.isActive ? 'Désactiver' : 'Activer'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="h-8 px-2 text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <ShopServiceForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddService}
        />

        <ShopServiceEditModal
          service={editingService}
          onClose={() => setEditingService(null)}
          onSaved={loadAll}
        />
      </div>
    </DashboardLayout>
  )
}
