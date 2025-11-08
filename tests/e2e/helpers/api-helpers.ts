import type { APIRequestContext } from '@playwright/test'

/**
 * Helper para chamadas de API do admin
 */
export class AdminAPIHelper {
  constructor(
    private api: APIRequestContext,
    private baseURL: string,
    private token: string
  ) {}

  /**
   * Fazer login e obter token
   */
  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const response = await this.api.post(`${this.baseURL}/v1/admin/auth/login`, {
      data: { email, password },
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Login failed: ${error.error || response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Fazer logout
   */
  async logout(refreshToken?: string): Promise<void> {
    await this.api.post(`${this.baseURL}/v1/admin/auth/logout`, {
      headers: { Authorization: `Bearer ${this.token}` },
      data: { refreshToken },
    })
  }

  /**
   * Obter usuário atual
   */
  async getMe(): Promise<any> {
    const response = await this.api.get(`${this.baseURL}/v1/admin/auth/me`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      throw new Error(`Get me failed: ${response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Criar produto
   */
  async createProduct(data: any): Promise<any> {
    const response = await this.api.post(`${this.baseURL}/v1/admin/products`, {
      headers: { Authorization: `Bearer ${this.token}` },
      data,
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Create product failed: ${error.error || response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Atualizar produto
   */
  async updateProduct(id: string, data: any): Promise<any> {
    const response = await this.api.put(`${this.baseURL}/v1/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
      data,
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Update product failed: ${error.error || response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Deletar produto
   */
  async deleteProduct(id: string): Promise<void> {
    const response = await this.api.delete(`${this.baseURL}/v1/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Delete product failed: ${error.error || response.statusText()}`)
    }
  }

  /**
   * Obter produto
   */
  async getProduct(id: string): Promise<any> {
    const response = await this.api.get(`${this.baseURL}/v1/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      throw new Error(`Get product failed: ${response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Listar produtos
   */
  async listProducts(params?: { page?: number; limit?: number; search?: string; category?: string }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())
    if (params?.search) queryParams.set('search', params.search)
    if (params?.category) queryParams.set('category', params.category)

    const response = await this.api.get(`${this.baseURL}/v1/admin/products?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      throw new Error(`List products failed: ${response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Criar categoria
   */
  async createCategory(data: any): Promise<any> {
    const response = await this.api.post(`${this.baseURL}/v1/admin/categories`, {
      headers: { Authorization: `Bearer ${this.token}` },
      data,
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Create category failed: ${error.error || response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Atualizar categoria
   */
  async updateCategory(id: string, data: any): Promise<any> {
    const response = await this.api.put(`${this.baseURL}/v1/admin/categories/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
      data,
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Update category failed: ${error.error || response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Deletar categoria
   */
  async deleteCategory(id: string): Promise<void> {
    const response = await this.api.delete(`${this.baseURL}/v1/admin/categories/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Delete category failed: ${error.error || response.statusText()}`)
    }
  }

  /**
   * Listar categorias
   */
  async listCategories(): Promise<any> {
    const response = await this.api.get(`${this.baseURL}/v1/admin/categories`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      throw new Error(`List categories failed: ${response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Criar cupom
   */
  async createCoupon(data: any): Promise<any> {
    const response = await this.api.post(`${this.baseURL}/v1/admin/coupons`, {
      headers: { Authorization: `Bearer ${this.token}` },
      data,
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Create coupon failed: ${error.error || response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Atualizar cupom
   */
  async updateCoupon(id: string, data: any): Promise<any> {
    const response = await this.api.put(`${this.baseURL}/v1/admin/coupons/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
      data,
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Update coupon failed: ${error.error || response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Deletar cupom
   */
  async deleteCoupon(id: string): Promise<void> {
    const response = await this.api.delete(`${this.baseURL}/v1/admin/coupons/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Delete coupon failed: ${error.error || response.statusText()}`)
    }
  }

  /**
   * Upload de imagem para R2
   */
  async uploadImage(file: Buffer | ArrayBuffer | Uint8Array, filename: string, productId?: string): Promise<any> {
    const token = await this.getToken()
    
    // Converter Buffer para ArrayBuffer/Uint8Array se necessário
    let fileData: Uint8Array
    if (file instanceof Buffer) {
      fileData = new Uint8Array(file)
    } else if (file instanceof ArrayBuffer) {
      fileData = new Uint8Array(file)
    } else {
      fileData = file
    }

    // Playwright usa multipart como objeto, não FormData
    const multipartData: Record<string, string | { name: string; mimeType: string; buffer: Buffer }> = {
      file: {
        name: filename,
        mimeType: 'image/jpeg',
        buffer: Buffer.from(fileData),
      },
    }
    
    if (productId) {
      multipartData.productId = productId
    }

    const response = await this.api.post(`${this.baseURL}/v1/admin/products/upload-image`, {
      headers: { Authorization: `Bearer ${token}` },
      multipart: multipartData as any,
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Upload image failed: ${error.error || response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Deletar imagem
   */
  async deleteImage(id: string, key: string): Promise<void> {
    const response = await this.api.delete(`${this.baseURL}/v1/admin/products/delete-image`, {
      headers: { Authorization: `Bearer ${this.token}` },
      data: { id, key },
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Delete image failed: ${error.error || response.statusText()}`)
    }
  }

  /**
   * Listar pedidos
   */
  async listOrders(params?: { page?: number; limit?: number; status?: string }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())
    if (params?.status) queryParams.set('status', params.status)

    const response = await this.api.get(`${this.baseURL}/v1/admin/orders?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      throw new Error(`List orders failed: ${response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Atualizar status do pedido
   */
  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<any> {
    const response = await this.api.put(`${this.baseURL}/v1/admin/orders/${orderId}/status`, {
      headers: { Authorization: `Bearer ${this.token}` },
      data: { status, notes },
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Update order status failed: ${error.error || response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Listar clientes
   */
  async listCustomers(params?: { page?: number; limit?: number; search?: string }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())
    if (params?.search) queryParams.set('search', params.search)

    const response = await this.api.get(`${this.baseURL}/v1/admin/customers?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      throw new Error(`List customers failed: ${response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Atualizar cliente
   */
  async updateCustomer(id: string, data: any): Promise<any> {
    const response = await this.api.put(`${this.baseURL}/v1/admin/customers/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
      data,
    })

    if (!response.ok()) {
      const error = await response.json()
      throw new Error(`Update customer failed: ${error.error || response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Obter estatísticas do dashboard
   */
  async getDashboardStats(): Promise<any> {
    const response = await this.api.get(`${this.baseURL}/v1/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      throw new Error(`Get dashboard stats failed: ${response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Listar cupons
   */
  async listCoupons(params?: { page?: number; limit?: number; search?: string; active?: boolean }): Promise<any> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', params.page.toString())
    if (params?.limit) queryParams.set('limit', params.limit.toString())
    if (params?.search) queryParams.set('search', params.search)
    if (params?.active !== undefined) queryParams.set('active', params.active.toString())

    const response = await this.api.get(`${this.baseURL}/v1/admin/coupons?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      throw new Error(`List coupons failed: ${response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Obter pedido
   */
  async getOrder(id: string): Promise<any> {
    const response = await this.api.get(`${this.baseURL}/v1/admin/orders/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      throw new Error(`Get order failed: ${response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Obter cliente
   */
  async getCustomer(id: string): Promise<any> {
    const response = await this.api.get(`${this.baseURL}/v1/admin/customers/${id}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok()) {
      throw new Error(`Get customer failed: ${response.statusText()}`)
    }

    return await response.json()
  }
}

