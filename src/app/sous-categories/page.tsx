'use client'

import { API_BASE_URL } from '@/services/api'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, Tag, Layers, CheckCircle, XCircle } from 'lucide-react'
import { SousCategory } from '@/types'
import { SousCategoryForm } from '@/components/forms/sous-category-form'
import { SousCategoryEditModal, type SousCategoryItem } from '@/components/modals/sous-category-edit-modal'
import { DashboardLayout } from '@/components/dashboard-layout'

const BADGE_COLORS = [
  'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-400',
  'bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-400',
  'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400',
  'bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-400',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-400',
  'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-400',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-400',
  'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-400',
]

function categoryColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return BADGE_COLORS[Math.abs(hash) % BADGE_COLORS.length]
}

export default function SousCategoriesPage() {
  const [items, setItems] = useState<SousCategory[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<SousCategoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [scRes, catRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sous-categories`),
        fetch(`${API_BASE_URL}/categories/`),
      ])
      if (!scRes.ok) throw new Error('Failed to fetch sous-categories')
      const scData = await scRes.json()
      setItems(Array.isArray(scData) ? scData : [])
      if (catRes.ok) {
        const catData = await catRes.json()
        setCategories(Array.isArray(catData) ? catData.map((c: any) => ({ id: String(c.id), name: c.name })) : [])
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const filtered = items.filter((s) => {
    const displayName = (s.categoryName || s.category).toLowerCase()
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      displayName.includes(searchTerm.toLowerCase()) ||
      (typeof s.tags === 'string' ? s.tags : '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || s.category === filterCategory || s.categoryName === filterCategory
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && s.isActive) ||
      (filterStatus === 'inactive' && !s.isActive)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const totalActive = items.filter(s => s.isActive).length
  const totalInactive = items.length - totalActive

  const handleAddService = async (formData: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sous-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, category: formData.category, tags: formData.tags || '' }),
      })
      if (!res.ok) throw new Error('Failed to create sous-category')
      await loadAll()
      setShowAddModal(false)
    } catch (err: any) {
      alert(err.message || 'Failed to add sous-category')
    }
  }

  const handleToggleStatus = async (item: SousCategory) => {
    try {
      await fetch(`${API_BASE_URL}/sous-categories/${item.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !item.isActive }),
      })
      setItems(prev => prev.map(s => s.id === item.id ? { ...s, isActive: !s.isActive } : s))
    } catch { /* silent */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sous-category?')) return
    try {
      await fetch(`${API_BASE_URL}/sous-categories/${id}`, { method: 'DELETE' })
      setItems(prev => prev.filter(s => s.id !== id))
    } catch { /* silent */ }
  }

  const handleUpdateSousCategory = async (
    id: string,
    data: { name: string; category: string; tags: string; isActive: boolean }
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sous-categories/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, category: data.category, tags: data.tags, is_active: data.isActive }),
      })
      if (!res.ok) throw new Error(`Update failed (${res.status})`)
      await loadAll()
      setEditingItem(null)
    } catch (err: any) {
      alert(err.message || 'Failed to update')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sous-Catégories</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez les sous-catégories de services</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-ikigai-primary hover:bg-ikigai-primary/90 self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-ikigai-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-ikigai-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{items.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalActive}</p>
              <p className="text-xs text-gray-500">Actives</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalInactive}</p>
              <p className="text-xs text-gray-500">Inactives</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-ikigai-primary dark:focus:ring-ikigai-teal focus:border-transparent outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ikigai-primary dark:focus:ring-ikigai-teal focus:border-transparent outline-none"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Toutes catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ikigai-primary dark:focus:ring-ikigai-teal focus:border-transparent outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ikigai-primary mr-3" />
              Chargement...
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-500">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Tag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune sous-catégorie trouvée</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Ajoutez votre première sous-catégorie</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filtered.map((service) => {
                    const displayCategory = service.categoryName || service.category
                    const tags = typeof service.tags === 'string'
                      ? service.tags.split(',').map(t => t.trim()).filter(Boolean)
                      : Array.isArray(service.tags) ? service.tags : []
                    return (
                      <tr key={service.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-ikigai-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {service.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{service.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${categoryColor(displayCategory)}`}>
                            {displayCategory}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {tags.length > 0 ? tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {tag}
                              </span>
                            )) : <span className="text-gray-400 text-xs">—</span>}
                            {tags.length > 3 && (
                              <span className="text-xs text-gray-400">+{tags.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            service.isActive ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${service.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                            {service.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-gray-500 hover:text-ikigai-primary dark:hover:text-ikigai-teal"
                              onClick={() => setEditingItem({
                                id: service.id,
                                name: service.name,
                                category: service.category,
                                tags: service.tags,
                                isActive: service.isActive,
                              })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 px-2 text-xs ${service.isActive ? 'text-orange-500 hover:text-orange-700 dark:text-orange-400' : 'text-green-600 hover:text-green-700 dark:text-green-400'}`}
                              onClick={() => handleToggleStatus(service)}
                            >
                              {service.isActive ? 'Désactiver' : 'Activer'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <SousCategoryForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddService}
          serviceCategories={[]}
          serviceSubcategories={{}}
        />

        <SousCategoryEditModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          onSubmit={handleUpdateSousCategory}
        />
      </div>
    </DashboardLayout>
  )
}
