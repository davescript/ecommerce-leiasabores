import type { APIRequestContext } from '@playwright/test'

/**
 * Helper simples para chamadas de API do admin
 */
export class AdminAPI {
  constructor(
    private api: APIRequestContext,
    private baseURL: string,
    private token: string
  ) {}

  /**
   * Fazer login
   */
  static async login(
    api: APIRequestContext,
    baseURL: string,
    email: string,
    password: string
  ): Promise<{ token: string; user: any }> {
    const response = await api.post(`${baseURL}/v1/admin/auth/login`, {
      headers: {
        'X-Test-Mode': 'true',
        'X-Playwright-Test': 'true',
        'Content-Type': 'application/json',
      },
      data: { email, password },
    })

    if (!response.ok()) {
      const error = await response.text()
      throw new Error(`Login failed: ${response.status()} - ${error}`)
    }

    const data = await response.json()
    const token = data.accessToken || data.token

    if (!token) {
      throw new Error('No token received')
    }

    return { token, user: data.user }
  }

  /**
   * Criar produto
   */
  async createProduct(data: {
    name: string
    description?: string
    price: number
    category: string
    inStock?: boolean
    stock?: number
  }) {
    // Garantir que categoria existe
    const categories = await this.listCategories()
    const categoryList = categories.categories || categories
    let categorySlug = data.category

    if (categoryList.length > 0) {
      const found = categoryList.find(
        (c: any) => c.slug === data.category || c.id === data.category || c.name === data.category
      )
      if (found) {
        categorySlug = found.slug || found.id
      } else {
        categorySlug = categoryList[0].slug || categoryList[0].id
      }
    }

    const response = await this.api.post(`${this.baseURL}/v1/admin/products`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      data: {
        ...data,
        category: categorySlug,
        inStock: data.inStock !== false,
        status: 'active',
      },
    })

    if (!response.ok()) {
      const error = await response.json().catch(() => ({ error: response.statusText() }))
      throw new Error(`Create product failed: ${error.error || response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Listar produtos
   */
  async listProducts() {
    const response = await this.api.get(`${this.baseURL}/v1/admin/products`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok()) {
      throw new Error(`List products failed: ${response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Deletar produto
   */
  async deleteProduct(id: string) {
    const response = await this.api.delete(`${this.baseURL}/v1/admin/products/${id}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok()) {
      // Não lançar erro se produto já não existir
      if (response.status() !== 404) {
        throw new Error(`Delete product failed: ${response.statusText()}`)
      }
    }
  }

  /**
   * Listar categorias
   */
  async listCategories() {
    const response = await this.api.get(`${this.baseURL}/v1/admin/categories`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok()) {
      throw new Error(`List categories failed: ${response.statusText()}`)
    }

    return await response.json()
  }

  /**
   * Criar categoria
   */
  async createCategory(data: { name: string; slug?: string; description?: string }) {
    // Gerar slug válido (apenas letras minúsculas, números e hífens)
    let slug = data.slug
    if (!slug) {
      slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
        .replace(/^-+|-+$/g, '') // Remove hífens do início/fim
        .substring(0, 190) // Limita tamanho
      // Adicionar timestamp para garantir unicidade
      slug = `${slug}-${Date.now()}`
    }
    
    // Garantir que slug só contém caracteres válidos
    slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

    // Preparar dados (não enviar campos undefined)
    const categoryData: any = {
      name: data.name,
      slug: slug,
      displayOrder: 0,
    }
    
    // Adicionar description apenas se fornecido
    if (data.description !== undefined) {
      categoryData.description = data.description || null
    }

    const response = await this.api.post(`${this.baseURL}/v1/admin/categories`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      data: categoryData,
    })

    if (!response.ok()) {
      const status = response.status()
      const error = await response.json().catch(async () => {
        const text = await response.text().catch(() => response.statusText())
        return { error: text }
      })
      
      // Incluir detalhes de validação se disponíveis
      const errorMessage = error.error || response.statusText()
      const errorDetails = error.details ? ` Details: ${JSON.stringify(error.details)}` : ''
      throw new Error(`Create category failed: ${errorMessage}${errorDetails} (Status: ${status})`)
    }

    return await response.json()
  }

  /**
   * Deletar categoria
   */
  async deleteCategory(id: string) {
    const response = await this.api.delete(`${this.baseURL}/v1/admin/categories/${id}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })

    if (!response.ok()) {
      if (response.status() !== 404) {
        throw new Error(`Delete category failed: ${response.statusText()}`)
      }
    }
  }
}

