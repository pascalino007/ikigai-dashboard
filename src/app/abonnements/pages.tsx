'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, X, ImageIcon, Package, Tag, ShoppingBag } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AdminOnly } from '@/components/auth/route-guard'

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  description: string
  image?: string
  status: 'active' | 'draft'
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Hair Oil',
    price: 15000,
    category: 'Hair Care',
    stock: 45,
    description: 'Nourishing oil for all hair types, enriched with vitamins.',
    status: 'active'
  },
  {
    id: '2',
    name: 'Professional Scissors Set',
    price: 85000,
    category: 'Tools',
    stock: 12,
    description: 'High-grade stainless steel scissors for precision cutting.',
    status: 'active'
  },
  {
    id: '3',
    name: 'Beard Grooming Kit',
    price: 35000,
    category: 'Men',
    stock: 28,
    description: 'Complete kit with oil, balm, and comb.',
    status: 'draft'
  }
]

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Partial<Product>>({})

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setFormData({ status: 'active', stock: 0, price: 0 })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({ ...product })
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } as Product : p))
    } else {
      setProducts([...products, { ...formData, id: Date.now().toString() } as Product])
    }
    setIsModalOpen(false)
  }

  return (
    <AdminOnly>
      <DashboardLayout>
      <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-2">Manage your e-commerce inventory</p>
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full md:w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ikigai-primary focus:border-transparent shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 group">
            {/* Image Placeholder */}
            <div className="h-48 bg-gray-100 flex items-center justify-center relative">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-12 w-12 text-gray-300" />
              )}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Tag className="h-3 w-3 mr-1" />
                    {product.category}
                  </p>
                </div>
                <p className="font-bold text-ikigai-primary whitespace-nowrap">
                  {product.price.toLocaleString()} FCFA
                </p>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
                {product.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center text-sm text-gray-500">
                  <Package className="h-4 w-4 mr-1" />
                  {product.stock} in stock
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ikigai-primary focus:border-ikigai-primary"
              value={formData.name || ''}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (FCFA)</label>
              <input
                required
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ikigai-primary focus:border-ikigai-primary"
                value={formData.price || ''}
                onChange={e => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                required
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ikigai-primary focus:border-ikigai-primary"
                value={formData.stock || ''}
                onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ikigai-primary focus:border-ikigai-primary"
                value={formData.category || ''}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select Category</option>
                <option value="Hair Care">Hair Care</option>
                <option value="Tools">Tools</option>
                <option value="Men">Men</option>
                <option value="Skin Care">Skin Care</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ikigai-primary focus:border-ikigai-primary"
                value={formData.status || 'active'}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-ikigai-primary focus:border-ikigai-primary"
              value={formData.description || ''}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

      </div>
    </DashboardLayout>
    </AdminOnly>
  )
}
