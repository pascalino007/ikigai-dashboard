'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react'
import { Category } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { CategoryForm } from '@/components/forms/category-form'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/`)
        if (!res.ok) throw new Error('Failed to fetch categories')
        const data: Category[] = await res.json()
        setCategories(data)
      } catch (err) {
        console.error(err)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const filteredCategories = categories.filter(category => {
    const matchesSearch =
      (category?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (category?.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && category.isActive) ||
      (filterStatus === 'inactive' && !category.isActive)

    return matchesSearch && matchesStatus
  })

  // Add category via API
  const handleAddCategory = async (data: any) => {
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('description', data.description)
      formData.append('isActive', data.isActive !== false ? 'true' : 'false')
      if (data.image) formData.append('image', data.image)

      const res = await fetch(`${API_BASE_URL}/categories/`, {
        method: 'POST',
        body: formData,
      })
      const newCategory: Category = await res.json()
      setCategories(prev => [newCategory, ...prev])
      setShowAddModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  // Update category via API
  const handleUpdateCategory = async (data: any) => {
    if (!editingCategory) return
    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('description', data.description)
      formData.append('isActive', data.isActive !== false ? 'true' : 'false')
      if (data.image) formData.append('image', data.image)

      const res = await fetch(
        `${API_BASE_URL}/categories/${editingCategory.id}`,
        {
          method: 'PUT',
          body: formData,
        }
      )
      const updatedCategory: Category = await res.json()
      setCategories(prev =>
        prev.map(cat => (cat.id === editingCategory.id ? updatedCategory : cat))
      )
      setEditingCategory(null)
    } catch (err) {
      console.error(err)
    }
  }

  // Delete category via API
  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE',
      })
      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
    } catch (err) {
      console.error(err)
    }
  }

  // Toggle active status via API
  const handleToggleStatus = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (!category) return

    try {
      const res = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive }),
      })
      const updatedCategory: Category = await res.json()
      setCategories(prev =>
        prev.map(cat => (cat.id === categoryId ? updatedCategory : cat))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const totalActive = categories.filter(c => c.isActive).length
  const totalInactive = categories.length - totalActive

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Catégories</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gérez les catégories de services</p>
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
              <Tag className="h-5 w-5 text-ikigai-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{categories.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
              <span className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalActive}</p>
              <p className="text-xs text-gray-500">Actives</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <span className="h-3 w-3 rounded-full bg-red-400" />
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
                placeholder="Rechercher une catégorie..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-ikigai-primary dark:focus:ring-ikigai-teal focus:border-transparent outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-ikigai-primary dark:focus:ring-ikigai-teal focus:border-transparent outline-none"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">Tous statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ikigai-primary mr-3" />
            Chargement...
          </div>
        )}

        {/* Categories Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredCategories.map(category => (
                <div key={category.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                  <div className="relative h-40 flex-shrink-0">
                    <img
                      src={category.imageurl?.startsWith('http') ? category.imageurl : `https://myikigai.sfo2.digitaloceanspaces.com/uploads/${category.imageurl}`}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                      }}
                    />
                    <span className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm ${
                      category.isActive ? 'bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${category.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                      {category.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1 truncate">{category.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-3">{category.description || '—'}</p>
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {new Date(category.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          title={category.isActive ? 'Désactiver' : 'Activer'}
                          onClick={() => handleToggleStatus(category.id)}
                          className={`h-7 w-7 rounded-md flex items-center justify-center text-xs transition-colors ${
                            category.isActive
                              ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10'
                          }`}
                        >
                          {category.isActive ? '●' : '○'}
                        </button>
                        <button
                          title="Modifier"
                          onClick={() => setEditingCategory(category)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 hover:text-ikigai-primary dark:hover:text-ikigai-teal hover:bg-ikigai-primary/5 dark:hover:bg-ikigai-teal/10 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          title="Supprimer"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredCategories.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 py-16 text-center shadow-sm">
                <Tag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">Aucune catégorie trouvée</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  {searchTerm || filterStatus !== 'all' ? 'Essayez de modifier vos filtres.' : 'Commencez par ajouter une catégorie.'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Button onClick={() => setShowAddModal(true)} className="mt-4 bg-ikigai-primary hover:bg-ikigai-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une catégorie
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Add Category Form */}
        <CategoryForm isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddCategory} />

        {/* Edit Category Form */}
        <CategoryForm
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          onSubmit={handleUpdateCategory}
          initialData={editingCategory}
        />
      </div>
    </DashboardLayout>
  )
}
