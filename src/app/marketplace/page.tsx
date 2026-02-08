'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2, ImageIcon, Tag, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { AdminOnly } from '@/components/auth/route-guard'
import { ProductForm, Product } from '@/components/forms/product-form'
import { useAuth } from '@/lib/auth/auth-context'

export default function ProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('http://168.231.101.119:4040/marketplace/products')
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.Category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`http://168.231.101.119:4040/marketplace/products/${id}`, {
          method: 'DELETE'
        })
        if (res.ok) {
          setProducts(products.filter(p => p.id !== id))
        } else {
          console.error('Failed to delete product')
        }
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const handleFormSubmit = () => {
    fetchProducts()
    setIsModalOpen(false)
  }

  return (
    <AdminOnly>
      <DashboardLayout>
      <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
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
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-ikigai-primary" />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 group flex flex-col">
            {/* Image Placeholder */}
            <div className="h-48 bg-gray-100 flex items-center justify-center relative">
              {product.image1 ? (
                <img src={product.image1} alt={product.name} className="w-full h-full object-cover" />
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

            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Tag className="h-3 w-3 mr-1" />
                    {product.Category}
                  </p>
                </div>
                <p className="font-bold text-ikigai-primary whitespace-nowrap">
                  {Number(product.price).toLocaleString()} FCFA
                </p>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                {product.Description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center text-sm text-gray-500">
                  {/* Stock info removed as it's not in DTO */}
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => product.id && handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Add/Edit Modal */}
      <ProductForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        providerId={user?.id ? parseInt(user.id) : 0}
      />

      </div>
    </DashboardLayout>
    </AdminOnly>
  )
}
