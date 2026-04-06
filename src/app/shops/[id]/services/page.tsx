'use client'

import { API_BASE_URL } from '@/services/api'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft, Search, Clock, DollarSign, Edit, Trash2, Eye, Scissors } from 'lucide-react'
import { Service } from '@/types'
import { DashboardLayout } from '@/components/dashboard-layout'
import { ServiceForm } from '@/components/forms/service-form'
import { SpecialOfferForm } from '@/components/forms/special-offer-form'

// Mock data for demonstration
const mockServices: Service[] = [
  

]

// Mock shop data
const mockShops = [
  { id: '1', name: 'Downtown Beauty Studio' },
  { id: '2', name: 'Elite Hair & Spa' },
  { id: '3', name: 'Modern Cuts Barbershop' },
  { id: '4', name: 'Paris Beauty Center' },
  { id: '5', name: 'London Hair Studio' }
]

export default function ShopServicesPage() {
  const params = useParams()
  const router = useRouter()
  const shopId = params.id as string
  
  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSpecialModal, setShowSpecialModal] = useState(false)
  const [shopName, setShopName] = useState('')
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter services for this specific shop
useEffect(() => {

  if (!shopId) return;

  const controller = new AbortController();

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching services for shop ID:', shopId);
      const response = await fetch(`${API_BASE_URL}/services/shop/${shopId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      console.log('Fetched services data:', data);

      // ensure it's an array
      const formatted = Array.isArray(data) ? data : [data];
      setServices(formatted);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching services:', error);
        setError('Error loading services');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchServices();

  return () => controller.abort();
}, [shopId]);


  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' ||
     service.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(services.map(s => s.category)))

  const handleAddService = async (formData: any) => {
    // Create new service object
    const newService: Service = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      category: formData.category,
      subcategory: formData.subcategory,
      providerId: 'provider-new',
      shopId: shopId, // Use the current shop ID
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Add to services list
    setServices(prev => [newService, ...prev])
    console.log('Service created successfully!')
  }

  const handleAddSpecialOffer = async (data: any) => {
    // create a simple special-offer object and add to services list (adjust shape as needed)
    const newOffer: Service = {
      id: Date.now().toString(),
      name: data.title || 'Special Offer',
      description: data.description || '',
      price: data.price || 0,
      duration: data.duration || 0,
      category: data.category || 'special',
      subcategory: data.subcategory || '',
      providerId: 'offer-new',
      shopId: shopId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setServices(prev => [newOffer, ...prev])
    setShowSpecialModal(false)
  }

  const handleBackToShop = () => {
    router.push(`/shops/${shopId}`)
  }

  const handleUpdateService = (updatedService: any) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s))
    setEditingService(null)
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      const res = await fetch(`${API_BASE_URL}/services/${serviceId}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete service')
      setServices(prev => prev.filter(s => s.id !== serviceId))
    } catch (err) {
      console.error('Error deleting service:', err)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="outline" 
              onClick={handleBackToShop}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Services</h1>
              <p className="text-gray-600 mt-2">
                Manage services for <strong>{shopId}</strong>
              </p>
            </div>
            
            <Button onClick={() => setShowSpecialModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Special offert
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ikigai-primary focus:border-transparent"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
  {filteredServices.map((service) => (
    <div key={service.id} className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      
      {/* 🖼️ Service Image */}
      <div className="h-48 w-full overflow-hidden">
        <img
          src={service.imageurl}
          alt={service.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* 📄 Service Info */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{service.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              service.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {service.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{service.category}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subcategory:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{service.subcategory}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Price:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
             
              {service.price}  XOF
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {service.duration} 
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Created {service.createdAt.toString().slice(0, 10)}
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setEditingService(service)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteService(service.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>


        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Scissors className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first service to this shop.'
              }
            </p>
            {!searchTerm && filterCategory === 'all' && (
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Service
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Add Service Form */}
        <ServiceForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddService}
          shops={[{ id: shopId, name: shopName }]} // Pre-select current shop
          selectedShopId={shopId} // Pre-select the current shop
        />
        <SpecialOfferForm
          isOpen={showSpecialModal}
          onClose={() => setShowSpecialModal(false)}
          onSubmit={handleAddSpecialOffer}
          //shopServices={services}
          shopId={shopId}
        />

        {editingService && (
          <ServiceForm
            isOpen={!!editingService}
            onClose={() => setEditingService(null)}
            onSubmit={handleUpdateService}
            shops={[{ id: shopId, name: shopName || shopId }]}
            selectedShopId={shopId}
            initialData={editingService}
          />
        )}
      </div>
    </DashboardLayout>
  )
}




function setError(arg0: string) {
  throw new Error('Function not implemented.')
}

function setLoading(arg0: boolean) {
  throw new Error('Function not implemented.')
}
