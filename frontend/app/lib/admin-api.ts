import axios from 'axios'

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api'
    }
  }
  
  return 'https://api.leiasabores.pt/api'
}

const baseURL = `${getBaseURL()}/v1/admin`

const api = axios.create({
  baseURL,
  timeout: 30000,
})

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('admin_refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
          })

          const { accessToken } = response.data
          localStorage.setItem('admin_access_token', accessToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('admin_access_token')
        localStorage.removeItem('admin_refresh_token')
        window.location.href = '/admin/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
}

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentOrders: (limit = 10) => api.get(`/dashboard/recent-orders?limit=${limit}`),
  getTopProducts: (limit = 10) => api.get(`/dashboard/top-products?limit=${limit}`),
  getSalesChart: (days = 30) => api.get(`/dashboard/sales-chart?days=${days}`),
}

// Products
export const productsApi = {
  list: (params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    inStock?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => api.get('/products', { params }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  uploadImage: async (file: File, productId: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)
    
    const token = localStorage.getItem('admin_access_token')
    const apiUrl = getBaseURL()
    const response = await fetch(`${apiUrl}/v1/admin/products/upload-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw { response: { data: error } }
    }
    
    return { data: await response.json() }
  },
  deleteImage: async (idOrKey: string, productId?: string) => {
    const token = localStorage.getItem('admin_access_token')
    const apiUrl = getBaseURL()
    const body: any = {}
    
    // If it looks like an ID (starts with img_), use id, otherwise use key
    if (idOrKey.startsWith('img_')) {
      body.id = idOrKey
    } else {
      body.key = idOrKey
    }
    
    if (productId) {
      body.productId = productId
    }
    
    const response = await fetch(`${apiUrl}/v1/admin/products/delete-image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw { response: { data: error } }
    }
    
    return { data: await response.json() }
  },
  createVariant: (productId: string, data: any) =>
    api.post(`/products/${productId}/variants`, data),
  updateVariant: (id: string, data: any) =>
    api.put(`/products/variants/${id}`, data),
  deleteVariant: (id: string) => api.delete(`/products/variants/${id}`),
}

// Orders
export const ordersApi = {
  list: (params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    startDate?: string
    endDate?: string
  }) => api.get('/orders', { params }),
  get: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),
  getTimeline: (id: string) => api.get(`/orders/${id}/timeline`),
}

// Customers
export const customersApi = {
  list: (params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => api.get('/customers', { params }),
  get: (id: string) => api.get(`/customers/${id}`),
  getOrders: (id: string) => api.get(`/customers/${id}/orders`),
  addNote: (id: string, note: string, internal = true) =>
    api.post(`/customers/${id}/notes`, { note, internal }),
  getNotes: (id: string) => api.get(`/customers/${id}/notes`),
}

// Categories
export const categoriesApi = {
  list: () => api.get('/categories'),
  get: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  reorder: (items: Array<{ id: string; displayOrder: number }>) =>
    api.put('/categories/reorder', { items }),
}

// Coupons
export const couponsApi = {
  list: (params?: {
    page?: number
    limit?: number
    search?: string
    active?: boolean
  }) => api.get('/coupons', { params }),
  get: (id: string) => api.get(`/coupons/${id}`),
  create: (data: any) => api.post('/coupons', data),
  update: (id: string, data: any) => api.put(`/coupons/${id}`, data),
  delete: (id: string) => api.delete(`/coupons/${id}`),
}

// Settings
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
}

// Admin Users
export const adminUsersApi = {
  list: (params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
}

export default api

