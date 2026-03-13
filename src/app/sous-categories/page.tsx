'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Edit, Trash2, Eye, Tag } from 'lucide-react'
import { SousCategory } from '@/types'
import { SousCategoryForm } from '@/components/forms/sous-category-form'
import { SousCategoryEditModal, type SousCategoryItem } from '@/components/modals/sous-category-edit-modal'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function ShopServicesPage() {
  const [shopServices, setShopServices] = useState<SousCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<SousCategoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Example categories
  const serviceCategories = ['Hair', 'Nails', 'Skincare', 'Makeup', 'Massage']
  const serviceSubcategories = {
    Hair: ['Cut', 'Color', 'Styling'],
    Nails: ['Manicure', 'Pedicure'],
  }

  // ✅ Fetch data from your API
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:4040/sous-categories`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) throw new Error('Failed to fetch services')

        const data = await res.json()
        setShopServices(data)
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // ✅ Filtering logic
  const filteredServices = shopServices.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesCategory =
      filterCategory === 'all' || service.category === filterCategory

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && service.isActive) ||
      (filterStatus === 'inactive' && !service.isActive)

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hair':
        return 'bg-purple-100 text-purple-800'
      case 'Nails':
        return 'bg-pink-100 text-pink-800'
      case 'Skincare':
        return 'bg-green-100 text-green-800'
      case 'Makeup':
        return 'bg-yellow-100 text-yellow-800'
      case 'Massage':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // ✅ Add new service (local only for now)
  const handleAddService = (formData: any) => {
    const newService: SousCategory = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      tags: formData.tags
        ? formData.tags.split(',').map((tag: string) => tag.trim()).join(',')
        : '',
      isActive: true,
      createdAt: new Date(),
    }

    setShopServices((prev) => [newService, ...prev])
    setShowAddModal(false)
  }

  const handleToggleServiceStatus = (serviceId: string) => {
    setShopServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? { ...service, isActive: !service.isActive }
          : service
      )
    )
  }

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setShopServices((prev) => prev.filter((service) => service.id !== serviceId))
    }
  }

  const handleUpdateSousCategory = async (
    id: string,
    data: { name: string; category: string; tags: string; isActive: boolean }
  ) => {
    try {
      // Make API call to update the sous category
      const response = await fetch(`http://localhost:4040/sous-categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          tags: data.tags,
          isActive: data.isActive
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update sous category: ${response.status}`);
      }

      // Update local state if API call succeeds
      const tagsArray = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      setShopServices((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                name: data.name,
                category: data.category,
                tags: tagsArray,
                isActive: data.isActive,
                updatedAt: new Date()
              }
            : s
        )
      );
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating sous category:', error);
      alert('Failed to update sous category. Please try again.');
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Les Sous Categories</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your shop's services and offerings
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Sous Categories
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-100 dark:border-gray-800 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {serviceCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-800">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading services...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : filteredServices.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No services found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sous Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-md bg-ikigai-primary flex items-center justify-center text-white font-bold">
                            {service.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {service.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                            service.category
                          )}`}
                        >
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {service.tags}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setEditingItem({
                                id: service.id,
                                name: service.name,
                                category: service.category,
                                tags: service.tags,
                                isActive: service.isActive
                              })
                            }
                            title="Edit sous category"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleServiceStatus(service.id)
                            }
                            className={
                              service.isActive
                                ? 'text-orange-600 hover:text-orange-700'
                                : 'text-green-600 hover:text-green-700'
                            }
                          >
                            {service.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Service Form */}
        <SousCategoryForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddService}
          serviceCategories={serviceCategories}
          serviceSubcategories={serviceSubcategories}
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
