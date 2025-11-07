// API service functions for backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // Add authentication token if available
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    }
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

// Shop API functions
export const shopApi = {
  // Get all shops with optional filters
  getAll: async (filters?: {
    search?: string
    category?: string
    country?: string
    city?: string
    area?: string
    isActive?: boolean
  }) => {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.country) params.append('country', filters.country)
    if (filters?.city) params.append('city', filters.city)
    if (filters?.area) params.append('area', filters.area)
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())

    const queryString = params.toString()
    return apiRequest<any[]>(`/shops${queryString ? `?${queryString}` : ''}`)
  },

  // Get shop by ID
  getById: async (id: string) => {
    return apiRequest<any>(`/shops/${id}`)
  },

  // Create new shop
  create: async (shopData: any) => {
    return apiRequest<any>('/shops', {
      method: 'POST',
      body: JSON.stringify(shopData),
    })
  },

  // Update shop
  update: async (id: string, shopData: any) => {
    return apiRequest<any>(`/shops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shopData),
    })
  },

  // Delete shop
  delete: async (id: string) => {
    return apiRequest<void>(`/shops/${id}`, {
      method: 'DELETE',
    })
  },

  // Toggle shop status (active/inactive)
  toggleStatus: async (id: string) => {
    return apiRequest<any>(`/shops/${id}/toggle-status`, {
      method: 'PATCH',
    })
  },

  // Upload shop images
  uploadImages: async (shopId: string, images: File[]) => {
    const formData = new FormData()
    images.forEach((image, index) => {
      formData.append(`images`, image)
    })

    return apiRequest<any>(`/shops/${shopId}/images`, {
      method: 'POST',
      headers: {}, // Remove Content-Type header to let browser set it for FormData
      body: formData,
    })
  }
}

// Service Provider API functions
export const providerApi = {
  getAll: async (filters?: {
    search?: string
    type?: string
    shopId?: string
    isActive?: boolean
  }) => {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.shopId) params.append('shopId', filters.shopId)
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())

    const queryString = params.toString()
    return apiRequest<any[]>(`/providers${queryString ? `?${queryString}` : ''}`)
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/providers/${id}`)
  },

  create: async (providerData: any) => {
    return apiRequest<any>('/providers', {
      method: 'POST',
      body: JSON.stringify(providerData),
    })
  },

  update: async (id: string, providerData: any) => {
    return apiRequest<any>(`/providers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(providerData),
    })
  },

  delete: async (id: string) => {
    return apiRequest<void>(`/providers/${id}`, {
      method: 'DELETE',
    })
  }
}

// Special Offers API functions
export const specialOfferApi = {
  getAll: async (filters?: {
    search?: string
    shopId?: string
    serviceId?: string
    isActive?: boolean
  }) => {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.shopId) params.append('shopId', filters.shopId)
    if (filters?.serviceId) params.append('serviceId', filters.serviceId)
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())

    const queryString = params.toString()
    return apiRequest<any[]>(`/special-offers${queryString ? `?${queryString}` : ''}`)
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/special-offers/${id}`)
  },

  create: async (offerData: any) => {
    return apiRequest<any>('/special-offers', {
      method: 'POST',
      body: JSON.stringify(offerData),
    })
  },

  update: async (id: string, offerData: any) => {
    return apiRequest<any>(`/special-offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(offerData),
    })
  },

  delete: async (id: string) => {
    return apiRequest<void>(`/special-offers/${id}`, {
      method: 'DELETE',
    })
  }
}

// Shop Services API functions
export const shopServiceApi = {
  getAll: async (filters?: {
    search?: string
    shopId?: string
    category?: string
    isActive?: boolean
  }) => {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.shopId) params.append('shopId', filters.shopId)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())

    const queryString = params.toString()
    return apiRequest<any[]>(`/shop-services${queryString ? `?${queryString}` : ''}`)
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/shop-services/${id}`)
  },

  create: async (serviceData: any) => {
    return apiRequest<any>('/shop-services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    })
  },

  update: async (id: string, serviceData: any) => {
    return apiRequest<any>(`/shop-services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    })
  },

  delete: async (id: string) => {
    return apiRequest<void>(`/shop-services/${id}`, {
      method: 'DELETE',
    })
  }
}

// Categories API functions
export const categoryApi = {
  getAll: async () => {
    return apiRequest<any[]>('/categories')
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/categories/${id}`)
  },

  create: async (categoryData: any) => {
    return apiRequest<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    })
  },

  update: async (id: string, categoryData: any) => {
    return apiRequest<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
  },

  delete: async (id: string) => {
    return apiRequest<void>(`/categories/${id}`, {
      method: 'DELETE',
    })
  }
}

// Utility function to handle API errors
export const handleApiError = (error: any) => {
  console.error('API Error:', error)
  
  if (error.message.includes('401')) {
    // Handle unauthorized access
    localStorage.removeItem('authToken')
    window.location.href = '/login'
  }
  
  return {
    success: false,
    message: error.message || 'An error occurred',
    error: error
  }
}

// Utility function for successful API responses
export const handleApiSuccess = (data: any, message?: string) => {
  return {
    success: true,
    data,
    message: message || 'Operation completed successfully'
  }
}
