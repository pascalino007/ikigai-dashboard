'use client'

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
        const res = await fetch('http://localhost:4040/categories/')
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
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())

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

      const res = await fetch('http://localhost:4040/categories/', {
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
        `http://localhost:4040/categories/${editingCategory.id}`,
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
      await fetch(`http://localhost:4040/categories/${categoryId}`, {
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
      const res = await fetch(`http://localhost:4040/categories/${categoryId}`, {
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

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-2">Manage service categories</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && <p className="text-center text-gray-500">Loading categories...</p>}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                  onError={e => {
                    const target = e.target as HTMLImageElement
                    target.src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Created {new Date(category.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(category.id)}>
                      {category.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingCategory(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Tag className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first category.'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Category
                </Button>
              </div>
            )}
          </div>
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
